<div class="columns is-mobile">
  <div class="column">
    <h1 class="title">Playlists</h1>
  </div>
  <div class="column is-narrow">
    <a class="button" href="{null}" on:click={() => showCreatePlaylistModal = !showCreatePlaylistModal} >
      <FontAwesomeIcon icon={faPlus} class="icon"/>
    </a>
  </div>
</div>

<CreatePlalist {showCreatePlaylistModal} />

<div class="list is-hoverable">
  {#if promise}
    {#await promise}
      <p class="list-item">
        <FontAwesomeIcon icon={faSpinner} class="icon is-24" spin={true}/>
        Loading playlists ..
      </p>
    {:then _}
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
      {:catch error}
        <p class="list-item" style="color: red">{error.message}</p>
        {/await}
  {/if}
</div>

<script>

  import { playlists } from '../../tools/stores';
  import { getPlaylists, getPlaylistTracks, playPlaylist, shufflePlaylist, addToQueuePlaylists } from '../../tools/mopidyTools';
  import { onMount } from 'svelte';
  import CreatePlalist from '../../components/CreatePlaylist.svelte';
  import FontAwesomeIcon from '../../components/FontAwesomeIcon.svelte';
  import {
    faAngleDown,
    faPlayCircle,
    faRandom,
    faGripLines,
    faPlus,
    faSpinner
  } from '@fortawesome/free-solid-svg-icons';

  let promise;
  let showCreatePlaylistModal = false;

  onMount(async () => {
    promise = loadPlaylists()
  })

  const loadPlaylists = async () => {
    $playlists = await getPlaylists()
  }

</script>
