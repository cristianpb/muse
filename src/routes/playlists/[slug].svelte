<h1 class="title">{slug.replace('-',' ')}</h1>

<div class="list is-hoverable">
{#each playlistsTracks as song}
  <a class="list-item" href="{null}">{song.name}</a>
{:else}
  <a class="list-item" href="{null}">loading songs</a>
{/each}
</div>

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
    playlistsTracks = playlistsTracksRaw.tracks ? playlistsTracksRaw.tracks : []
  })

</script>
