<svelte:head>
  <style src="../scss/global.scss"></style>
  <title>Now Playing</title>
</svelte:head>

<h1 class="title">Now playing</h1>

{#if $currentTrack}
<div class="card">
  {#if $albumImage['#text']}
    <div class="card-image has-text-centered">
      <figure class="image is-4by3">
        <img src="{$albumImage['#text']}" alt="Placeholder image">
      </figure>
    </div>
  {:else}
    <div class="card-image has-text-centered">
      <figure class="image is-4by3">
        <img src="{process.env.NODE_ENV === 'development' ? '' : '/apollo'}/logo-512.png" alt="Placeholder image" width="256" height="192">
      </figure>
    </div>
  {/if}

  <div class="card-content">
    <div class="media">
      <div class="media-content">
        {#if $currentTrack.track}
          <p class="title is-4">{$currentTrack.track.name}</p>
          {#if $currentTrack.track.artists}
            <p class="subtitle is-6">{$currentTrack.track.artists[0].name}</p>
          {/if}
        {/if}
      </div>
    </div>

    <div class="content">
      <div class="columns is-mobile">
        <div class="column is-narrow">
            {convertSencondsToString($currentPlaytime)}
        </div>
        <div class="column">
          {#if ($currentPlaytime && $totalPlaytime)}
            <input 
              type="range"
              min="0" 
              max="100" 
              bind:value="{currentPlaytimePercent}" 
              on:change="{setTrackTime(currentPlaytimePercent)}"
              class="slider">
          {/if}
        </div>
        <div class="column is-narrow">
            {convertSencondsToString($totalPlaytime)}
        </div>
      </div>
    </div>
  </div>
</div>
{/if}

<div class="list is-hoverable">
  {#each tlTracklists as tlTrack}
    <a class="list-item" href="{null}">
      <div class="columns is-mobile">
        <div class="column" on:click={() => tlTrack.visibility = !tlTrack.visibility}>
          {tlTrack.track.name}
        </div>
        <div class="column is-narrow">
          <div class="dropdown is-right is-up" class:is-active={tlTrack.visibility} >
            <div class="dropdown-trigger" on:click={() => tlTrack.visibility = !tlTrack.visibility}>
            {#if tlTrack.visibility}
              <FontAwesomeIcon icon={faAngleUp} class="icon" aria-haspopup="true" aria-controls="dropdown-menu"/>
            {:else}
              <FontAwesomeIcon icon={faAngleDown} class="icon" aria-haspopup="true" aria-controls="dropdown-menu"/>
            {/if}
            </div>
            <div class="dropdown-menu" id="dropdown-menu" role="menu">
              <div class="dropdown-content">
                <a href="{null}" class="dropdown-item" on:click={playTracklist(tlTrack)}>
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
    <a class="list-item" href="{null}">loading songs...</a>
  {/each}
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
  import { mopidy, currentTrack, currentPlaytime, totalPlaytime, albumImage } from '../tools/stores';
  import { connectWS, convertSencondsToString, convertPercentToSeconds, normalizeTime, getCurrentTlTrackList } from '../tools/mopidyTools';
  import FontAwesomeIcon from '../components/FontAwesomeIcon.svelte'
  import {
    faAngleDown,
    faAngleUp,
    faPlayCircle,
    faGripLines,
    faRandom,
    faMinus
  } from '@fortawesome/free-solid-svg-icons';

  let tlTracklists = []
  let image
  $: currentPlaytimePercent = normalizeTime($currentPlaytime, $totalPlaytime)

  onMount(async () => {
    $mopidy = await connectWS()
    tlTracklists = await getCurrentTlTrackList()
    loadAlbumImage()
    $mopidy.tracklist.index()
  })

  async function loadAlbumImage() {
    if ($currentTrack.track.album) {
      let res = await fetch(`https://ws.audioscrobbler.com/2.0/?format=json&method=album.getInfo&album=${$currentTrack.track.album.name}&artist=${$currentTrack.track.artists[0].name}&api_key=4320a3ef51c9b3d69de552ac083c55e3`)
      //res = await mopidy.library.getImages([currentTrack.uri])
      let lastfm = await res.json()
      if (lastfm && lastfm.album) {
        $albumImage = lastfm.album.image.find(x => x.size === 'extralarge');
      }
    }
  }

  async function setTrackTime(currentPlaytimePercent) {
    const ms = convertPercentToSeconds(currentPlaytimePercent, $totalPlaytime)
    const changed = await $mopidy.playback.seek([ms])
    $currentPlaytime = ms
    console.log(changed, ms)
    if (changed) {
      console.log("set track time", currentPlaytimePercent)
    }
  }

  async function removeTrack(tlTrack) {
    const res = await $mopidy.tracklist.remove({criteria: {uri: [tlTrack.track.uri]}})
    if (res.length > 0) {
      tlTracklists = tlTracklists.filter(x => x.track.uri != res[0].track.uri)
    }
  }

  async function playTracklist(tlTrack) {
    // tl_model do not contain visibility key
    delete tlTrack.visibility
    $mopidy.playback.play([tlTrack])
  }
  
</script>
