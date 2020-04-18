<svelte:head>
  <style src="../scss/global.scss"></style>
	<title>Now Playing</title>
</svelte:head>

<h1 class="title">Now playing</h1>

{#if $currentTrack}
<div class="card">
  {#if albumImage}
  <div class="card-image">
    <figure class="image is-4by3">
      <img src="{albumImage['#text']}" alt="Placeholder image">
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
{/if}

<div class="list is-hoverable">
{#each tracklists as tracklist}
  <a class="list-item" href="{null}">{tracklist.name}</a>
{:else}
  <a class="list-item" href="{null}">loading songs</a>
{/each}
</div>

<script>
  import { onMount } from 'svelte';
  import { mopidy, currentTrack, currentPlaytime, totalPlaytime, albumImage } from '../tools/stores';
  import { connectWS, convertSencondsToString, normalizeTime, getCurrentTrackList } from '../tools/mopidyTools';

  let tracklists = []

  onMount(async () => {
    $mopidy = await connectWS()
    tracklists = await getCurrentTrackList()
    console.log("Tracklists", tracklists);
  })
  
</script>
