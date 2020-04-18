<h1 class="title">Playlists</h1>

<div class="list is-hoverable">
  {#each playlists as playlist}
    <a class="list-item" href="{null}">{playlist.name} -
      {#await getPlaylistTracks(playlist.uri)}
        ....
      {:then playlistInfo}
        {playlistInfo.tracks ? playlistInfo.tracks.length : '0'}
      {:catch error}
        <p style="color: red">{error.message}</p>
      {/await}
    </a>
  {:else}
    <p>loading playlits</p>
  {/each}
</div>

<script>

  import { mopidy } from '../tools/stores';
  import { connectWS } from '../tools/mopidyTools';
  import { onMount } from 'svelte';

  let playlists = []

  onMount(async () => {
    $mopidy = await connectWS()
    getPlaylists()
  })

  async function getPlaylists() {
    playlists = await $mopidy.playlists.asList()
  }

  async function getPlaylistTracks(uri) {
    const playlistsTracks = await $mopidy.playlists.lookup([uri]) 
    if (playlistsTracks) {
      return playlistsTracks
    } else {
      throw new Error("ii")
    }
  }

</script>
