<div class="columns is-mobile">
  <div class="column">
    <h1 class="title">{slug.replace('-',' ')}</h1>
  </div>
  <div class="column is-narrow">
    <a href="playlists">
      <FontAwesomeIcon icon={faArrowLeft} href="playlists" class="icon"/>
    </a>
  </div>
</div>

<div class="list is-hoverable">
  {#each playlistsTracks as track}
    <a class="list-item" href="{null}">
      <div class="columns is-mobile">
        <div class="column" on:click={() => track.visibility = !track.visibility}>
          {track.name}
        </div>
        <div class="column is-narrow">
          <div class="dropdown is-right is-up" class:is-active={track.visibility} >
            <div class="dropdown-trigger" on:click={() => track.visibility = !track.visibility}>
            {#if track.visibility}
              <FontAwesomeIcon icon={faAngleUp} class="icon" aria-haspopup="true" aria-controls="dropdown-menu"/>
            {:else}
              <FontAwesomeIcon icon={faAngleDown} class="icon" aria-haspopup="true" aria-controls="dropdown-menu"/>
            {/if}
            </div>
            <div class="dropdown-menu" id="dropdown-menu" role="menu">
              <div class="dropdown-content">
                <a href="{null}" class="dropdown-item" on:click={playTrackSingle(track.uri)}>
                  <FontAwesomeIcon icon={faPlayCircle} class="icon is-small"/>&nbsp;
                    Play now
                </a>
                <a href="{null}" class="dropdown-item" on:click={addTrackNext(track.uri)}>
                  <FontAwesomeIcon icon={faArrowRight} class="icon is-small"/>&nbsp;
                    Play next
                </a>
                <a href="{null}" class="dropdown-item" on:click={addTrackQueue(track.uri)}>
                  <FontAwesomeIcon icon={faLevelDownAlt} class="icon is-small"/>&nbsp;
                    Add to queue
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </a>
  {:else}
    <a class="list-item" href="{null}">loading songs</a>
  {/each}
</div>

<script>
  import { stores } from "@sapper/app";
  import { onMount } from 'svelte';
  import { mopidy, playlists } from '../../tools/stores';
  import { connectWS, getPlaylists, getPlaylistTracks, playTrackSingle, addTrackNext, addTrackQueue } from '../../tools/mopidyTools';
  import FontAwesomeIcon from '../../components/FontAwesomeIcon.svelte'
  import {
    faArrowLeft,
    faArrowRight,
    faLevelDownAlt,
    faAngleDown,
    faAngleUp,
    faPlayCircle,
  } from '@fortawesome/free-solid-svg-icons';

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
