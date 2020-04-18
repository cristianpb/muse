<h1 class="title">Playlists</h1>

<div class="list is-hoverable">
  {#each $playlists as playlist}
    <a class="list-item" href="playlists/{playlist.slug}">{playlist.name}
      {#await getPlaylistTracks(playlist.uri)}
      {:then playlistInfo}
        {playlistInfo.tracks ? playlistInfo.tracks.length : '0'}
      {:catch error}
        {error.message}
      {/await}
    </a>
  {:else}
    <p>loading</p>
  {/each}
</div>

<script>

  import { mopidy, playlists } from '../../tools/stores';
  import { connectWS, getPlaylists, getPlaylistTracks } from '../../tools/mopidyTools';
  import { onMount } from 'svelte';

  //let playlists = []

  onMount(async () => {
    $mopidy = await connectWS()
    $playlists = await getPlaylists()
    console.log("PLAYLIS", $playlists);
  })

</script>
