<nav class="navbar is-fixed-bottom " role="navigation" aria-label="main navigation">
  <div class="navbar-brand">
    <a href="{null}" class="navbar-item is-hidden-touch" on:click={$mopidy.playback.previous()}>
     Pr
    </a>
    <a href="{null}" class="navbar-item" on:click={togglePlayPause($currentState)}>
      {#if $currentState}
        {defineState($currentState)}
      {:else}
        --
      {/if}
    </a>
    <a href="{null}" class="navbar-item is-hidden-touch" on:click={$mopidy.playback.next()}>
      Next
    </a>
    <div class="navbar-item">
      {$currentTrack ? $currentTrack.name : "-:-"}
    </div>
    <a href="{null}" 
       class:is-active={burgerState}
       on:click={toggleBurger}
       role="button" class="navbar-burger" aria-label="menu" aria-expanded="false" data-target="navMenu">
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
    </a>
  </div>
  <div id="navMenu" class="navbar-menu" class:is-active={burgerState}>
    <div class="navbar-end">
      <a href="{null}" class="navbar-item  is-hidden-touch" on:click='{toggleClienstVisibility}'>
        {$snapClientsVisibility ? 'Hide' : 'Show' }
      </a>
      {#each $clients as client}
      <div class="navbar-item  is-hidden-desktop">
        <div class="columns is-mobile">
          <div class="column is-narrow">
            {client.name}
          </div>
          <div class="column is-narrow">
            {client.muted ? 'Mut' : 'Ply' }
          </div>
          <div class="column">
            <progress class="progress" value="{client.volume}" max="100">{client.volume}%</progress>
          </div>
        </div>
      </div>
      {/each}
      <div class="navbar-item">
        <div class="columns is-mobile">
          <a href={null} class="column is-narrow" on:click={toggleMute}>
            {defineMute($currentMute)}
          </a>
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
            Random
          </div>
        </div>
      </div>
      <div class="navbar-item">
        <div class="columns is-mobile">
          <div class="column is-narrow">
            {convertSencondsToString($currentPlaytime)}
          </div>
          <div class="column">
            {#if ($currentPlaytime && $totalPlaytime)}
              <progress class="progress" value="{normalizeTime($currentPlaytime,$totalPlaytime)}" max="100">{normalizeTime($currentPlaytime,$totalPlaytime)}%</progress>
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
  import { clients, snapClientsVisibility, currentTrack, currentPlaytime, totalPlaytime, albumImage, currentState, currentVolume, currentMute, mopidy } from '../tools/stores';
  import { convertSencondsToString, normalizeTime, connectWS } from '../tools/mopidyTools';

  let burgerState = false;
  let interval

  onMount(async () => {

    $mopidy = await connectWS()

    $mopidy.on("state", console.log);
    $mopidy.on("event", console.log);

    $mopidy.on("event:trackPlaybackEnded", (event) => {
      console.log("Stop", event);
      let { tlTrack, timePosition } = event
      clearInterval(interval);
      $currentPlaytime = 0
    })

    $mopidy.on("event:playbackStateChanged", (event) => {
      let { old_state, new_state } = event
      $currentState = new_state
      if (new_state == 'paused') {
        clearInterval(interval);
      } if (new_state == 'playing') {
        interval = setInterval(() => {
          if ($currentPlaytime > $totalPlaytime) clearInterval(interval)
          $currentPlaytime = $currentPlaytime + 1000
        }, 1000);
      }
    })

    $mopidy.on("event:trackPlaybackStarted", (event) => {
      console.log("Start", event);
      let { tl_track } = event
      $currentTrack = tl_track.track
      $totalPlaytime = tl_track.track.length
      $currentPlaytime = 0
      interval = setInterval(() => {
        if ($currentPlaytime > $totalPlaytime) clearInterval(interval)
        $currentPlaytime = $currentPlaytime + 1000
      }, 1000);
    });

    $mopidy.on("state:online", async () => {
      console.log("connected");
      $currentTrack = await $mopidy.playback.getCurrentTrack()
      $currentPlaytime = await $mopidy.playback.getTimePosition()
      $currentState = await $mopidy.playback.getState()
      $currentVolume = await $mopidy.mixer.getVolume()
      $currentMute = await $mopidy.mixer.getMute()
      console.log($currentVolume);
      if ($currentTrack) {
        console.log($currentTrack);
        $totalPlaytime = $currentTrack.length
        if ($currentState === 'playing') {
          interval = setInterval(() => {
            if ($currentPlaytime > $totalPlaytime) clearInterval(interval)
            $currentPlaytime = $currentPlaytime + 1000
          }, 1000);
        }
      }
      //let res = await fetch(`https://ws.audioscrobbler.com/2.0/?format=json&method=album.getInfo&album=${$currentTrack.album.name}&artist=${$currentTrack.artists[0].name}&api_key=4320a3ef51c9b3d69de552ac083c55e3`)
      ////res = await mopidy.library.getImages([currentTrack.uri])
      //let lastfm = await res.json()
      //console.log(lastfm);
      //albumImage = lastfm.album.image[3];
    });

  })

  function toggleBurger() {
    burgerState = !burgerState
  }

  function toggleClienstVisibility() {
    $snapClientsVisibility = !$snapClientsVisibility
  }

  function defineState(state) {
    if (state === 'playing') {
      return 'Pause'
    } else if ((state === 'paused') || (state === 'stopped')) {
      return 'Play'
    } else {
      return '-'
    }
  }

  function togglePlayPause(state) {
    if (state === 'playing') {
      $mopidy.playback.pause()
    } else if ((state === 'paused') || (state === 'stopped')) {
      $mopidy.playback.play()
    } 
  }

  function defineMute(state) {
    console.log('Muting', state);
    if (state) {
      return 'Unmute'
    } else {
      return 'Mute'
    }
  }

  function toggleMute() {
    if ($currentMute) {
      $mopidy.mixer.setMute([false])
    } else {
      $mopidy.mixer.setMute([true])
    }
    $currentMute = !$currentMute
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
