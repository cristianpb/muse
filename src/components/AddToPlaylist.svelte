<div class="modal" class:is-active={showAddToPlaylistModal}  >
  <div class="modal-background"  on:click={() => showAddToPlaylistModal = !showAddToPlaylistModal}></div>
  <div class="modal-card">
    <header class="modal-card-head">
      <p class="modal-card-title">Add to playlist</p>
      <a href="{null}" aria-label="close" on:click={() => showAddToPlaylistModal = !showAddToPlaylistModal}>
        <FontAwesomeIcon icon={faTimesCircle} class="icon"/>
      </a>
    </header>
    <section class="modal-card-body">
      {#if track}
      <label class="label">Add {track.name} to a playlist</label>
      {/if}
      
      <div class="list is-hoverable">
        {#each $playlists as playlist, i}
          <div class="list-item">
            <div class="columns is-mobile">
              <div class="column">
                {playlist.name}
              </div>
              {#await getPlaylistTracks(playlist.uri)}
                loading..
              {:then playlistInfo}
                <div class="column is-narrow">
                  ({playlistInfo.tracks ? playlistInfo.tracks.length : '0'})
                </div>
                <div class="column is-narrow">
                  <a href="{null}" on:click={handleClickSave(playlistInfo)}>
                    <FontAwesomeIcon icon={faPlus} class="icon" />
                  </a>
                </div>
              {:catch error}
                {error.message}
              {/await}
            </div>
          </div>
        {/each}
      </div>
      &nbsp;
    </section>
    <footer class="modal-card-foot">
      {#if savePlaylistPromise}
        {#await savePlaylistPromise}
          <a class="button" href="{null}">
            <FontAwesomeIcon icon={faSpinner} spin={true} class="icon"/>
          </a>
          <button class="button is-success">Save changes</button>
        {:then res}
          {#if res}
            <a class="button" href="{null}">
              <FontAwesomeIcon icon={faCheck} class="icon"/>
            </a>
          {:else}
            Error
          {/if}
        {/await}
      {/if}
    </footer>
  </div>
  <button class="modal-close is-large" aria-label="close" on:click={() => showAddToPlaylistModal = !showAddToPlaylistModal}></button>
</div>

<script>
  import { onMount } from 'svelte';
  import { mopidy, playlists } from '../tools/stores';
  import { connectWS, getPlaylists, getPlaylistTracks } from '../tools/mopidyTools';
  import FontAwesomeIcon from '../components/FontAwesomeIcon.svelte'
  import {
    faPlus,
    faSpinner,
    faTimesCircle,
    faCheck
  } from '@fortawesome/free-solid-svg-icons';

  export let showAddToPlaylistModal;
  export let track;

  let savePlaylistPromise

  onMount(async () => {
    $mopidy = await connectWS()
    $playlists = await getPlaylists()
  })

  const handleClickSave = (playlist) => {
    savePlaylistPromise = addTrackToPlaylist(playlist)
  }

  const addTrackToPlaylist = async (playlistInfo) => {
    if (playlistInfo.tracks) {
      playlistInfo.tracks.push(track)
    } else {
      playlistInfo.tracks = [track]
    }
    const res = await $mopidy.playlists.save({playlist: playlistInfo})
    if (res) {
      $playlists = await getPlaylists()
      return true
    } else {
      return false
    }
    
  }

</script>
