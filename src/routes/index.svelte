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




  {#if $currentTrack.artists}
  <div class="card-content">
    <div class="media">
      <div class="media-content">
        <p class="title is-4">{$currentTrack.name}</p>
        <p class="subtitle is-6">{$currentTrack.artists[0].name}</p>
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
  {/if}
</div>
{/if}

<script>
  import { currentTrack, currentPlaytime, totalPlaytime, albumImage } from '../tools/stores';
  import { convertSencondsToString, normalizeTime } from '../tools/mopidyTools';
  
</script>
