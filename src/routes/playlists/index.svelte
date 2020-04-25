<h1 class="title">Playlists</h1>

<div class="list is-hoverable">
  {#each $playlists as playlist, i}
    <div class="list-item">
      <div class="columns is-mobile">
        <a class="column" href="playlists/{playlist.slug}">
          {playlist.name}
        </a>
        <div class="column is-narrow">
          {#await getPlaylistTracks(playlist.uri)}
            loading..
          {:then playlistInfo}
            ({playlistInfo.tracks ? playlistInfo.tracks.length : '0'})
          {:catch error}
            {error.message}
          {/await}
        </div>
        <div class="column is-narrow">
          <div class="dropdown is-right is-up" class:is-active={playlist.visibility} >
            <div class="dropdown-trigger" on:click={() => playlist.visibility = !playlist.visibility}>
            <FontAwesomeIcon icon={faAngleDown} class="icon" aria-haspopup="true" aria-controls="dropdown-menu"/>
            </div>
            <div class="dropdown-menu" id="dropdown-menu" role="menu">
              <div class="dropdown-content">
                <a href="{null}" class="dropdown-item" on:click={playPlaylist(playlist.uri)}>
                  <FontAwesomeIcon icon={faPlayCircle} class="icon is-small"/>&nbsp;
                  Play
                </a>
                <a href="{null}" class="dropdown-item" on:click={shufflePlaylist(playlist.uri)}>
                  <FontAwesomeIcon icon={faRandom} class="icon is-small"/>&nbsp;
                  Shuffle
                </a>
                <a href="{null}" class="dropdown-item" on:click={addToQueuePlaylists(playlist.uri)}>
                  <FontAwesomeIcon icon={faGripLines} class="icon is-small"/>&nbsp;
                  Add to queue
                </a>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  {:else}
    <div class="list-item">
    <p>loading</p>
    </div>
  {/each}
</div>

<script>

  import { mopidy, playlists } from '../../tools/stores';
  import { connectWS, getPlaylists, getPlaylistTracks, playPlaylist, shufflePlaylist, addToQueuePlaylists } from '../../tools/mopidyTools';
  import { onMount } from 'svelte';
  import FontAwesomeIcon from '../../components/FontAwesomeIcon.svelte'
  import {
    faAngleDown,
    faPlayCircle,
    faRandom,
    faGripLines
  } from '@fortawesome/free-solid-svg-icons';

  onMount(async () => {
    $mopidy = await connectWS()
    $playlists = await getPlaylists()
  })

</script>
