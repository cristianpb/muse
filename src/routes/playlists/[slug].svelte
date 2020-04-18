<h1 class="title">{slug.replace('-',' ')}</h1>

{#each playlistsTracks as song}
  <p> {song.name} </p>
{:else}
  <p>loading songs</p>
{/each}

<script>
  import { stores } from "@sapper/app";
  import { onMount } from 'svelte';
  import { mopidy, playlists } from '../../tools/stores';
  import { connectWS, getPlaylists, getPlaylistTracks } from '../../tools/mopidyTools';

  const { page } = stores();
  const { slug } = $page.params;

  let playlistsTracks = []

  onMount(async() => {
    $mopidy = await connectWS()
    $playlists = await getPlaylists()
    const selectedPlaylist = $playlists.find(playlist => playlist.name === slug)
    const playlistsTracksRaw  = await getPlaylistTracks(selectedPlaylist.uri)
    playlistsTracks = playlistsTracksRaw.tracks
  })

</script>
