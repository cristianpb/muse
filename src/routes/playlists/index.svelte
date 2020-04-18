<h1 class="title">Playlists</h1>

<div class="list is-hoverable">
  {#each $playlists as playlist, i}
    <div class="list-item">
      <nav class="level is-mobile">
        <a class="level-left"  href="playlists/{playlist.slug}">
          <div class="level-item">
            <p>
              {playlist.name}
            </p>
          </div>
          <div class="level-item">
            <p>
              {#await getPlaylistTracks(playlist.uri)}
                loading..
              {:then playlistInfo}
                {playlistInfo.tracks ? playlistInfo.tracks.length : '0'}
              {:catch error}
                {error.message}
              {/await}
            </p>
          </div>
        </a>
        <a class="level-right" href="{null}" on:click={togglePlaylistOptions(playlist.visibility, i)}>
          <p class="level-item"><strong>More</strong></p>
        </a>
      </nav>
      {#if playlist.visibility}
      <nav class="level">
        <a href="{null}" class="level-item" on:click={playPlaylist(playlist.uri)}>
          Play
        </a>
        <a href="{null}" class="level-item" on:click={shufflePlaylist(playlist.uri)}>
          Shuffle
        </a>
        <a href="{null}" class="level-item" on:click={addToQueuePlaylists(playlist.uri)}>
          Add to queue
        </a>
      </nav>
      {/if}
    </div>
  {:else}
    <p>loading</p>
  {/each}
</div>

<script>

  import { mopidy, playlists } from '../../tools/stores';
  import { connectWS, getPlaylists, getPlaylistTracks } from '../../tools/mopidyTools';
  import { onMount } from 'svelte';

  onMount(async () => {
    $mopidy = await connectWS()
    $playlists = await getPlaylists()
    console.log("Playlists", $playlists);
  })

  function togglePlaylistOptions(visibility, idx) {
    console.log("toggling playlist options", idx);
    $playlists[idx].visibility = !visibility
  }

  async function playPlaylist(uri) {
    const playlistInfo = await getPlaylistTracks(uri)
    $mopidy.tracklist.clear()
    $mopidy.tracklist.add([playlistInfo.tracks])
    $mopidy.playback.play()
  }

  async function shufflePlaylist(uri) {
    const playlistInfo = await getPlaylistTracks(uri)
    $mopidy.tracklist.clear()
    $mopidy.tracklist.add([playlistInfo.tracks])
    $mopidy.tracklist.shuffle()
    $mopidy.playback.play()
  }

  async function addToQueuePlaylists(uri) {
    const playlistInfo = await getPlaylistTracks(uri)
    $mopidy.tracklist.add([playlistInfo.tracks])
  }


</script>
