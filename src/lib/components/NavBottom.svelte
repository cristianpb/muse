<nav class="navbar is-fixed-bottom " aria-label="main navigation">
  <div class="navbar-brand">
    <a 
      href="{null}" 
      class="navbar-item" 
      title="Previous track"
      data-toggle="tooltip"
      on:click={$mopidy.playback.previous()}>
     <FontAwesomeIcon icon={faCaretLeft} class="icon"/>
    </a>
    <a 
      href="{null}"
      class="navbar-item"
      title="{$currentState == 'playing'? 'Pause' : 'Play'}"
      data-toggle="tooltip"
      on:click={togglePlayPause($currentState)}>
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
    <a 
      href="{null}" 
      class="navbar-item" 
      title="Next track"
      data-toggle="tooltip"
      on:click={$mopidy.playback.next()}>
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
  <div id="navMenu" class="navbar-menu" class:is-active={burgerState}  transition:slide >
    <div class="navbar-end  scroll-style">

      {#if $snapGroups.length > 0}
        <a 
          href="{null}"
          title="Show snapcast clients"
          data-toggle="tooltip"
          class="navbar-item  is-hidden-touch"
          on:click={() =>$snapClientsVisibility = !$snapClientsVisibility}>
          {#if $snapClientsVisibility}
            <FontAwesomeIcon icon={faCompressAlt} class="icon"/>
          {:else}
            <FontAwesomeIcon icon={faPodcast} class="icon"/>
          {/if}
        </a>
        {#each $snapGroups as group}
        {#each group.clients as client, idx}
          <div class="navbar-item  is-hidden-desktop">
            <span>
            {client.name ? client.name : client.host}
            </span>
            <div class="columns is-mobile">
              <div class="column is-narrow" role="button" tabindex="0" on:click={() => muteClient(client.id, client.muted)} on:keypress={() => muteClient(client.id, client.muted)}>
                <a class="navbar-item small-separation" href="{null}">
                  {#if client.muted}
                    <FontAwesomeIcon icon={faVolumeMute} class="icon"/>
                  {:else}
                    <FontAwesomeIcon icon={faVolumeUp} class="icon"/>
                  {/if}
                </a>
              </div>
              {#if client.connected}
                <div class="column">
                  <input 
                    type="range"
                    min="0" 
                    max="100" 
                    bind:value="{group.clients[idx].volume}" 
                    on:change="{changeHandler(group.clients[idx].id, group.clients[idx].volume)}"
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
            <button 
              class="button is-white"
              title="Mute {$currentMute ? 'on' : 'off'}"
              data-toggle="tooltip"
              on:click={toggleMute}>
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
        </div>
      </div>

      <div class="navbar-item is-hidden-desktop">
        <div class="columns is-mobile is-centered">
          {#if $snapGroups.length > 0 }
          <div class="column is-narrow">
            <button 
              class="button is-white"
              title="Edit snapcast clients"
              data-toggle="tooltip"
              on:click="{() => $snapClientsEditVisibility = !$snapClientsEditVisibility}">
              <FontAwesomeIcon icon={faPodcast} class="icon"/>
            </button>
          </div>
          {/if}
          <div class="column is-narrow">
            <button 
              class="button is-white"
              title="Random {$currentRandom ? 'on' : 'off'}"
              data-toggle="tooltip"
              on:click="{toggleCurrentRandom}">
              {#if $currentRandom}
                <FontAwesomeIcon icon={faRandom} class="icon is-info"/>
              {:else}
                <FontAwesomeIcon icon={faRandom} class="icon"/>
              {/if}
            </button>
          </div>
          <div class="column is-narrow">
            <button 
              class="button is-white"
              title="Consume {$currentConsume ? 'on' : 'off'}"
              data-toggle="tooltip"
              on:click={toggleCurrentConsume}>
              {#if $currentConsume}
                <FontAwesomeIcon icon={faUtensils} class="icon is-info"/>
              {:else}
                <FontAwesomeIcon icon={faUtensils} class="icon"/>
              {/if}
            </button>
          </div>
          <div class="column is-narrow">
            <button 
              class="button is-white"
              title="Repeat {$currentRepeat ? 'on' : 'off'}"
              data-toggle="tooltip"
              on:click={toggleCurrentRepeat}>
              {#if $currentRepeat}
                <FontAwesomeIcon icon={faRecycle} class="icon is-info"/>
              {:else}
                <FontAwesomeIcon icon={faRecycle} class="icon"/>
              {/if}
            </button>
          </div>
          <div class="column is-narrow">
            <button 
              class="button is-white"
              title="Single {$currentSingle ? 'on' : 'off'}"
              data-toggle="tooltip"
              on:click={toggleCurrentSingle}>
              {#if $currentSingle}
                <FontAwesomeIcon icon={faRedo} class="icon is-info"/>
              {:else}
                <FontAwesomeIcon icon={faRedo} class="icon"/>
              {/if}
            </button>
          </div>
        </div>
      </div>

      <a 
        href={null}
        title="Mute {$currentMute ? 'on' : 'off'}"
        data-toggle="tooltip"
        class="navbar-item is-hidden-touch" on:click={toggleMute}>
        {#if $currentMute}
          <FontAwesomeIcon icon={faVolumeMute} class="icon"/>
        {:else}
          <FontAwesomeIcon icon={faVolumeUp} class="icon"/>
        {/if}
      </a>
      <div 
        class="navbar-item is-hidden-touch"
        title="Volume {$currentVolume}"
        data-toggle="tooltip"
        >
        <input 
          type="range"
          min="0" 
          max="100" 
          bind:value="{$currentVolume}" 
          on:change="{$mopidy.mixer.setVolume([$currentVolume])}"
          class="slider">
      </div>
      <a 
        class="navbar-item is-hidden-touch"
        href="{null}"
        title="Random mode {$currentRandom ? 'on' : 'off'}"
        data-toggle="tooltip"
        on:click="{toggleCurrentRandom}">
        {#if $currentRandom}
          <FontAwesomeIcon icon={faRandom} class="icon is-info"/>
        {:else}
          <FontAwesomeIcon icon={faRandom} class="icon"/>
        {/if}
      </a>
      <a 
        class="navbar-item is-hidden-touch"
        href="{null}"
        title="Consume mode {$currentConsume ? 'on' : 'off'}"
        data-toggle="tooltip"
        on:click="{toggleCurrentConsume}">
        {#if $currentConsume}
          <FontAwesomeIcon icon={faUtensils} class="icon is-info"/>
        {:else}
          <FontAwesomeIcon icon={faUtensils} class="icon"/>
        {/if}
      </a>
      <a 
        class="navbar-item is-hidden-touch"
        href="{null}"
        title="Repeat mode {$currentRepeat ? 'on' : 'off'}"
        data-toggle="tooltip"
        on:click="{toggleCurrentRepeat}">
        {#if $currentRepeat}
          <FontAwesomeIcon icon={faRecycle} class="icon is-info"/>
        {:else}
          <FontAwesomeIcon icon={faRecycle} class="icon"/>
        {/if}
      </a>
      <a 
        class="navbar-item is-hidden-touch"
        href="{null}"
        title="Single mode {$currentSingle ? 'on' : 'off'}"
        data-toggle="tooltip"
        on:click="{toggleCurrentSingle}">
        {#if $currentSingle}
          <FontAwesomeIcon icon={faRedo} class="icon is-info"/>
        {:else}
          <FontAwesomeIcon icon={faRedo} class="icon"/>
        {/if}
      </a>

      {#if $currentTrack.track && $currentPlaytime && $totalPlaytime}
        <div class="navbar-item">
          <div class="columns is-mobile is-gapless">
            <div 
              title="current time: {convertSencondsToString($currentPlaytime)}"
              data-toggle="tooltip"
              class="column is-narrow">
              {convertSencondsToString($currentPlaytime)}
            </div>
            <div class="column">
              <div 
                title="time: {convertSencondsToString($currentPlaytime)}"
                data-toggle="tooltip"
                class="navbar-item">
                <input 
                  type="range"
                  min="0" 
                  max="100" 
                  bind:value="{currentPlaytimePercent}" 
                  on:change="{setTrackTime(currentPlaytimePercent)}"
                  class="slider">
              </div>
            </div>
            <div 
              title="total time: {convertSencondsToString($totalPlaytime)}"
              data-toggle="tooltip"
              class="column is-narrow">
              {convertSencondsToString($totalPlaytime)}
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>
</nav>

<script>
  import { slide } from 'svelte/transition';
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
    faUtensils,
    faRedo,
    faRecycle
  } from '@fortawesome/free-solid-svg-icons';
  import { snapGroups, snapClientsVisibility, snapClientsEditVisibility, currentTrack, currentPlaytime, totalPlaytime, currentState, currentVolume, currentMute, mopidy, currentRandom, currentConsume, currentRepeat, currentSingle } from '../tools/stores';
  import { convertSencondsToString, normalizeTime, setTrackTime } from '../tools/mopidyTools';
  import { changeHandler, muteClient } from '../tools/snapcast';

  let burgerState = false;
  $: currentPlaytimePercent = normalizeTime($currentPlaytime, $totalPlaytime)


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

  const toggleCurrentConsume = () => {
    if ($currentConsume) {
      $mopidy.tracklist.setConsume([false])
    } else {
      $mopidy.tracklist.setConsume([true])
    }
    $currentConsume = !$currentConsume
  }

  const toggleCurrentRepeat = () => {
    if ($currentRepeat) {
      $mopidy.tracklist.setRepeat([false])
    } else {
      $mopidy.tracklist.setRepeat([true])
    }
    $currentRepeat = !$currentRepeat
  }

  const toggleCurrentSingle = () => {
    if ($currentSingle) {
      $mopidy.tracklist.setSingle([false])
    } else {
      $mopidy.tracklist.setSingle([true])
    }
    $currentSingle = !$currentSingle
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

  .small-separation {
    padding: 0.1rem 0.75rem;
  }

  .scroll-style {
    max-height: 450px;
    overflow-y: scroll;
  }

</style>
