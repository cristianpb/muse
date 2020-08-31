<svelte:head>
  <title>Now Playing</title>
</svelte:head>

<h1 class="title">Now playing</h1>

{#if $currentTrack}
  <div class="card">
    {#if $albumImage}
      <div class="card-image has-text-centered">
        <figure class="image">
          <img src="{$albumImage}" width="480" height="480" alt="Album image">
        </figure>
      </div>
    {:else}
      <div class="card-image has-text-centered">
        <figure class="image is-1by1">
          <img src="{process.env.NODE_ENV === 'development' ? '' : '/muse'}/icon.svg" alt="Placeholder image" width="128" height="128">
        </figure>
      </div>
    {/if}

    {#if $currentTrack.track}
    <div class="card-content">
      <div class="media">
        <div class="media-content">
            <p class="title is-4">{$currentTrack.track.name}</p>
            {#if $currentTrack.track.artists}
              <p class="subtitle is-6">{$currentTrack.track.artists[0].name}</p>
            {/if}
        </div>
      </div>

      {#if $currentPlaytime && $totalPlaytime}
      <div class="content">
        <div class="columns is-mobile">
          <div class="column is-narrow">
            {convertSencondsToString($currentPlaytime)}
          </div>
          <div class="column">
              <input 
                type="range"
                min="0" 
                max="100" 
                bind:value="{currentPlaytimePercent}" 
                on:change="{setTrackTime(currentPlaytimePercent)}"
                class="slider">
          </div>
          <div class="column is-narrow">
            {convertSencondsToString($totalPlaytime)}
          </div>
        </div>
      </div>
      {/if}
    </div>
    {/if}
  </div>
{/if}

<div use:clickOutside on:click_outside={() => dropdownActivate = null} class="list is-hoverable">
  {#each tlTracklists as tlTrack, index (tlTrack.tlid)}
    <a class="list-item" 
       animate:flip={{ duration: 300 }}
       href="{null}"
       draggable={true} 
       on:dragstart={event => dragstart(event, index)}
       on:drop|preventDefault={event => drop(event, index)}
       ondragover="return false"
       on:dragenter={() => hovering = index}
       class:is-active={hovering === index}
       >
      <div class="columns is-mobile">
        <div class="column"  on:click={handleDropdownActivation(tlTrack.tlid)}>
          {tlTrack.track.name}
          {#if index === $currentTrack.index}
              &nbsp;<FontAwesomeIcon icon={faCog} spin={$currentState == 'playing' ? true : false} class="icon is-small"/>
          {/if}
        </div>
        <div class="column is-narrow">
          <div class="dropdown is-right is-up" class:is-active={dropdownActivate == tlTrack.tlid} >
            <div class="dropdown-trigger" on:click={handleDropdownActivation(tlTrack.tlid)}>
            {#if dropdownActivate == tlTrack.tlid}
              <FontAwesomeIcon icon={faAngleUp} class="icon" aria-haspopup="true" aria-controls="dropdown-menu"/>
            {:else}
              <FontAwesomeIcon icon={faAngleDown} class="icon" aria-haspopup="true" aria-controls="dropdown-menu"/>
            {/if}
            </div>
            <div class="dropdown-menu" id="dropdown-menu" role="menu">
              <div class="dropdown-content">
                <a href="{null}" class="dropdown-item" on:click={handlePlayTracklist(tlTrack)}>
                  <FontAwesomeIcon icon={faPlayCircle} class="icon is-small"/>&nbsp;
                  Play
                </a>
                <a href="{null}" class="dropdown-item" on:click={removeTrack(tlTrack)}>
                  <FontAwesomeIcon icon={faMinus} class="icon is-small"/>&nbsp;
                  Remove track
                </a>
              </div>
            </div>
          </div>


        </div>
      </div>
    </a>
  {:else}
    {#if promise && $mopidy && $mopidy._webSocket.readyState == 1}
      {#await promise}
        <p class="list-item">loading songs...</p>
      {:then number}
        <p class="list-item">no tracks playing</p>
      {:catch error}
        <p class="list-item" style="color: red">{error.message}</p>
      {/await}
    {:else}
      {#if $mopidy && $mopidy._webSocket.readyState == 1}
        <p class="list-item">loading songs...</p>
      {:else}
        <p class="list-item">not connected to mopidy</p>
      {/if}
    {/if}
  {/each}
</div>

<div class="columns">
  <div class="column has-text-centered">
    <a href="https://github.com/cristianpb/muse">
      Version - __VERSION__
    </a>
  </div>
</div>

<style>
  .slider {
    -webkit-appearance: none;
    width: 100%;
    height: 5px;
    border-radius: 5px;
    background: #d3d3d3;
    outline: none;
    opacity: 0.7;
    -webkit-transition: .2s;
    transition: opacity .2s;
  }

  .slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 25px;
    height: 25px;
    border-radius: 10%; 
    background: #DA9C20;
    cursor: pointer;
  }

  .slider::-moz-range-thumb {
    width: 25px;
    height: 25px;
    border-radius: 50%;
    background: #DA9C20;
    cursor: pointer;
  }

</style>

<script>
  import { onMount } from 'svelte';
  import { flip } from 'svelte/animate';
  import { mopidy, currentTrack, currentPlaytime, totalPlaytime, albumImage, currentState, imageProvider, mopidyHost, mopidyPort, mopidySSL } from '../tools/stores';
  import { convertSencondsToString, normalizeTime, getCurrentTlTrackList, setTrackTime, playTracklist, loadAlbumImageLocal } from '../tools/mopidyTools';
  import { loadAlbumImage }  from '../tools/lastfm';
  import { clickOutside } from '../tools/clickOutside';
  import FontAwesomeIcon from '../components/FontAwesomeIcon.svelte';
  import {
    faAngleDown,
    faAngleUp,
    faPlayCircle,
    faMinus,
    faCog
  } from '@fortawesome/free-solid-svg-icons';

  let tlTracklists = [];
  let hovering = false;
  let dropdownActivate;
  let promise;

  $: currentPlaytimePercent = normalizeTime($currentPlaytime, $totalPlaytime)

  onMount(async () => {
    const res = await fetch('/muse/config')
    const config = await res.json()
    $mopidyHost = config.mopidy && config.mopidy.host ? config.mopidy.host : window.location.hostname;
    $mopidyPort = config.mopidy && config.mopidy.port ? config.mopidy.port : window.location.port;
    $mopidySSL = config.mopidy && config.mopidy.ssl ? config.mopidy.ssl : window.location.protocol === 'https:' ? true : false;
    promise = loadCurrentTracklist()
  })

  currentTrack.subscribe(async (myTrack) => {
    if (myTrack && myTrack.track) {
      if ($imageProvider === 'local') {
        $albumImage = await loadAlbumImageLocal(myTrack.track);
      } else if ($imageProvider === 'lastfm') {
        $albumImage = await loadAlbumImage(myTrack.track);
      }
    }
  })

  const loadCurrentTracklist = async () => {
    tlTracklists = await getCurrentTlTrackList()
  }

  const handlePlayTracklist = (tlTrack) => {
    playTracklist(tlTrack)
    dropdownActivate = null
  }

  const removeTrack = async (tlTrack) => {
    const res = await $mopidy.tracklist.remove({criteria: {uri: [tlTrack.track.uri]}})
    dropdownActivate = null
    if (res.length > 0) {
      tlTracklists = tlTracklists.filter(x => x.track.uri != res[0].track.uri)
    }
  }

  function drop(event, target) {
		event.dataTransfer.dropEffect = 'move';
    const start = parseInt(event.dataTransfer.getData("text/plain"));
    const newTracklist = tlTracklists
    if (start < target) {
      newTracklist.splice(target + 1, 0, newTracklist[start]);
      newTracklist.splice(start, 1);
      $mopidy.tracklist.move({start, end: start+1, to_position: target})
    } else {
      newTracklist.splice(target, 0, newTracklist[start]);
      newTracklist.splice(start + 1, 1);
      $mopidy.tracklist.move({start: target, end: start, to_position: target + 1})
    }
    tlTracklists = newTracklist
    if (start === $currentTrack.index) {
      $currentTrack.index = target
    }
    hovering = null
  }

  function dragstart(event, i) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.dropEffect = 'move';
    const start = i;
    event.dataTransfer.setData('text/plain', start);
  }

  const handleDropdownActivation = (tlid) => {
    if (dropdownActivate === tlid) {
      dropdownActivate = null
    } else {
      dropdownActivate = tlid
    }
  }
  
</script>
