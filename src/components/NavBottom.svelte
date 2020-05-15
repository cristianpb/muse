<nav class="navbar is-fixed-bottom " role="navigation" aria-label="main navigation">
  <div class="navbar-brand">
    <a href="{null}" class="navbar-item" on:click={$mopidy.playback.previous()}>
     <FontAwesomeIcon icon={faCaretLeft} class="icon"/>
    </a>
    <a href="{null}" class="navbar-item" on:click={togglePlayPause($currentState)}>
      {#if $currentState == 'playing'}
        <FontAwesomeIcon icon={faPauseCircle} class="icon"/>
      {:else}
        {#if $currentState == 'paused' || $currentState == 'stopped'}
          <FontAwesomeIcon icon={faPlayCircle} class="icon"/>
        {:else}
          <FontAwesomeIcon icon={faPlayCircle} class="icon"/>
        {/if}
      {/if}
    </a>
    <a href="{null}" class="navbar-item" on:click={$mopidy.playback.next()}>
      <FontAwesomeIcon icon={faCaretRight} class="icon"/>
    </a>
    <div class="navbar-item is-hidden-mobile">
      {$currentTrack.track ? $currentTrack.track.name : "-:-"}
    </div>
    <div class="navbar-item is-hidden-tablet">
      {trimNameMobile($currentTrack.track)}
    </div>
    <a href="{null}" 
       class:is-active={burgerState}
       on:click={() => burgerState = !burgerState}
       role="button" class="navbar-burger" aria-label="menu" aria-expanded="false" data-target="navMenu">
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
    </a>
  </div>
  <div id="navMenu" class="navbar-menu" class:is-active={burgerState}>
    <div class="navbar-end">

      {#if $snapGroups.length > 0}
        <a href="{null}" class="navbar-item  is-hidden-touch" on:click={() =>$snapClientsVisibility = !$snapClientsVisibility}>
          {#if $snapClientsVisibility}
            <FontAwesomeIcon icon={faCompressAlt} class="icon"/>
          {:else}
            <FontAwesomeIcon icon={faPodcast} class="icon"/>
          {/if}
        </a>
        {#each $snapGroups as group}
        {#each group.clients as client}
          <div class="navbar-item  is-hidden-desktop">
            <div class="columns is-mobile">
              <div class="column is-narrow">
                {client.name}
              </div>
              {#if client.connected}
                <div class="column">
                  <input 
                    type="range"
                    min="0" 
                    max="100" 
                    bind:value="{client.volume}" 
                    on:change="{changeHandler(client.id, client.volume)}"
                    class="slider">
                </div>
              {:else}
                <div class="column">
                 disconnected 
                </div>
              {/if}
            </div>
          </div>
        {/each}
        {/each}
      {/if}

      <div class="navbar-item is-hidden-desktop">
        <div class="columns is-mobile">
          <div class="column is-narrow">
            <button class="button is-white" on:click={toggleMute}>
              {#if $currentMute}
                <FontAwesomeIcon icon={faVolumeMute} class="icon"/>
              {:else}
                <FontAwesomeIcon icon={faVolumeUp} class="icon"/>
              {/if}
            </button>
          </div>
          <div class="column">
            <input 
              type="range"
              min="0" 
              max="100" 
              bind:value="{$currentVolume}" 
              on:change="{$mopidy.mixer.setVolume([$currentVolume])}"
              class="slider">
          </div>
          <div class="column is-narrow">
            <button class="button is-white" on:click="{toggleCurrentRandom}">
              {#if $currentRandom}
                <FontAwesomeIcon icon={faRandom} class="icon"/>
              {:else}
                <FontAwesomeIcon icon={faGripLines} class="icon"/>
              {/if}
            </button>
          </div>
        </div>
      </div>

      <a href={null} class="navbar-item is-hidden-touch" on:click={toggleMute}>
        {#if $currentMute}
          <FontAwesomeIcon icon={faVolumeMute} class="icon"/>
        {:else}
          <FontAwesomeIcon icon={faVolumeUp} class="icon"/>
        {/if}
      </a>
      <div class="navbar-item is-hidden-touch">
        <input 
          type="range"
          min="0" 
          max="100" 
          bind:value="{$currentVolume}" 
          on:change="{$mopidy.mixer.setVolume([$currentVolume])}"
          class="slider">
      </div>
      <a class="navbar-item is-hidden-touch" href="{null}"  on:click="{toggleCurrentRandom}">
        {#if $currentRandom}
          <FontAwesomeIcon icon={faRandom} class="icon"/>
        {:else}
          <FontAwesomeIcon icon={faGripLines} class="icon"/>
        {/if}
      </a>

      <div class="navbar-item">
        <div class="columns is-mobile">
          <div class="column is-narrow">
            {convertSencondsToString($currentPlaytime)}
          </div>
          <div class="column">
            {#if ($currentPlaytime && $totalPlaytime)}
              <div class="navbar-item">
                <input 
                  type="range"
                  min="0" 
                  max="100" 
                  bind:value="{currentPlaytimePercent}" 
                  on:change="{setTrackTime(currentPlaytimePercent)}"
                  class="slider">
              </div>
            {/if}
          </div>
          <div class="column is-narrow">
            {convertSencondsToString($totalPlaytime)}
          </div>
        </div>
      </div>
    </div>
  </div>
</nav>

<svelte:head>
  <style src="../scss/global.scss"></style>
</svelte:head>

<script>
  import { onMount } from 'svelte';
  import FontAwesomeIcon from './FontAwesomeIcon.svelte'
  import {
    faCaretRight,
    faCaretLeft,
    faPlayCircle,
    faPauseCircle,
    faPodcast,
    faCompressAlt,
    faVolumeUp,
    faVolumeMute,
    faRandom,
    faGripLines
  } from '@fortawesome/free-solid-svg-icons';
  import { snapGroups, snapClientsVisibility, currentTrack, currentPlaytime, totalPlaytime, albumImage, currentState, currentVolume, currentMute, mopidy, snapcast, currentRandom } from '../tools/stores';
  import { convertSencondsToString, normalizeTime, connectWS, getRandomMode } from '../tools/mopidyTools';
  import { connectSnapcast, muteGroup, changeHandler } from '../tools/snapcast';

  let burgerState = false;
  $: currentPlaytimePercent = normalizeTime($currentPlaytime, $totalPlaytime)

  onMount(async () => {
    $mopidy = await connectWS()
    try {
      $snapcast = await connectSnapcast()
    } catch(e) {
      console.log('[Snapcast]: catch error:', e);
    }
  })

  const togglePlayPause = (state) => {
    if (state === 'playing') {
      $mopidy.playback.pause()
    } else if ((state === 'paused') || (state === 'stopped')) {
      $mopidy.playback.play()
    } 
  }

  const toggleMute = () => {
    if ($currentMute) {
      $mopidy.mixer.setMute([false])
    } else {
      $mopidy.mixer.setMute([true])
    }
    $currentMute = !$currentMute
  }

  const toggleCurrentRandom = () => {
    if ($currentRandom) {
      $mopidy.tracklist.setRandom([false])
    } else {
      $mopidy.tracklist.setRandom([true])
    }
    $currentRandom = !$currentRandom
  }

  const setTrackTime = async (currentPlaytimePercent) => {
    const ms = convertPercentToSeconds(currentPlaytimePercent, $totalPlaytime)
    const changed = await $mopidy.playback.seek([ms])
    $currentPlaytime = ms
    console.log(changed, ms)
    if (changed) {
      console.log("set track time", currentPlaytimePercent)
    }
  }

  const trimNameMobile = (trackname) => {
    const limit = 20
    if (trackname && trackname.name && trackname.name.length > limit) {
      return trackname.name.substring(0,20) + ".."
    } else if (trackname && trackname.name) {
      return trackname.name
    } else {
      return "-:-"
    }
  }

</script>

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
