<svelte:head>
  <style src="../scss/global.scss"></style>
	<title>Now Playing</title>
</svelte:head>

<h1 class="title">Now playing</h1>

{#if $currentTrack}
<div class="card">
  {#if image}
  <div class="card-image">
    <figure class="image is-4by3">
      <img src="{image['#text']}" alt="Placeholder image">
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
          {#if $currentPlaytime}
            <progress class="progress" value="{normalizeTime($currentPlaytime)}" max="100">{normalizeTime($currentPlaytime)}%</progress>
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
  import { onMount } from 'svelte';
  import { currentTrack, currentPlaytime, totalPlaytime } from '../tools/stores';
  import Mopidy from "mopidy";
  
  let image
  let interval
  onMount(async () => {

    const mopidy = new Mopidy({
      webSocketUrl: "ws://10.3.141.129:6680/mopidy/ws/",
      //webSocketUrl: "ws://localhost:6680/mopidy/ws/",
    });

    mopidy.on("state", console.log);
    mopidy.on("event", console.log);

    mopidy.on("event:trackPlaybackEnded", (event) => {
      console.log("Stop", event);
      let { tlTrack, timePosition } = event
      clearInterval(interval);
      $currentPlaytime = 0
    })
    mopidy.on("event:trackPlaybackStarted", (event) => {
      console.log("Start", event);
      let { tl_track } = event
      $currentTrack = tl_track.track
      $totalPlaytime = tl_track.track.length
      $currentPlaytime = 0
      interval = setInterval(() => {
        $currentPlaytime = $currentPlaytime + 1000
        if ($currentPlaytime == $totalPlaytime) clearInterval(interval)
      }, 1000);
    });

    mopidy.on("state:online", async () => {
      console.log("connected");
      $currentTrack = await mopidy.playback.getCurrentTrack()
      $currentPlaytime = await mopidy.playback.getTimePosition()
      console.log($currentTrack);
      $totalPlaytime = $currentTrack.length
      interval = setInterval(() => {
        $currentPlaytime = $currentPlaytime + 1000
      }, 1000);
      //let res = await fetch(`https://ws.audioscrobbler.com/2.0/?format=json&method=album.getInfo&album=${$currentTrack.album.name}&artist=${$currentTrack.artists[0].name}&api_key=4320a3ef51c9b3d69de552ac083c55e3`)
      ////res = await mopidy.library.getImages([currentTrack.uri])
      //let lastfm = await res.json()
      //console.log(lastfm);
      //image = lastfm.album.image[3];
    });

  })

  function convertSencondsToString(ms) {
    let minutes = ~~(ms / 60000)
    let seconds = `${~~((ms / 1000) % 60)}`
    return `${minutes}:${seconds.padStart(2, '0')}`
  }

  function normalizeTime(current) {
    let total = $totalPlaytime
    let norm = ((current / total ) * 100)
    return norm
  }

</script>
