<svelte:head>
  <style src="../scss/global.scss"></style>
  <title>Now Playing</title>
</svelte:head>

<h1 class="title">Now playing</h1>

{#if $currentTrack}
<div class="card">
  {#if albumImage['#text']}
    <div class="card-image has-text-centered">
      <figure class="image is-4by3">
        <img src="{albumImage['#text']}" alt="Placeholder image">
      </figure>
    </div>
  {:else}
    <div class="card-image has-text-centered">
      <figure class="image is-4by3">
        <img src="/logo-512.png" alt="Placeholder image" width="256" height="192">
      </figure>
    </div>
  {/if}

  <div class="card-content">
    <div class="media">
      <div class="media-content">
        <p class="title is-4">{$currentTrack.name}</p>
        {#if $currentTrack.artists}
        <p class="subtitle is-6">{$currentTrack.artists[0].name}</p>
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
{#each tracklists as tracklist}
  <a class="list-item" href="{null}">{tracklist.name}</a>
{:else}
  <a class="list-item" href="{null}">loading songs</a>
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
  import { connectWS, convertSencondsToString, convertPercentToSeconds, normalizeTime, getCurrentTrackList } from '../tools/mopidyTools';

  let tracklists = []
  $: currentPlaytimePercent = normalizeTime($currentPlaytime, $totalPlaytime)

  onMount(async () => {
    $mopidy = await connectWS()
    tracklists = await getCurrentTrackList()
  })

  async function setTrackTime(currentPlaytimePercent) {
    const ms = convertPercentToSeconds(currentPlaytimePercent, $totalPlaytime)
    const changed = await $mopidy.playback.seek([ms])
    $currentPlaytime = ms
    console.log(changed, ms)
    if (changed) {
      console.log("set track time", currentPlaytimePercent)
    }
  }
  
</script>
