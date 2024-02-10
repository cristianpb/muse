<div class="modal" class:is-active={showAddToPlaylistModal}  >
  <div class="modal-background"  on:click={() => showAddToPlaylistModal = !showAddToPlaylistModal} on:keypress={() => showAddToPlaylistModal = !showAddToPlaylistModal}></div>
  <div class="modal-card">
    <header class="modal-card-head">
      <p class="modal-card-title">Add to playlist</p>
      <a href="{null}" aria-label="close" on:click={() => showAddToPlaylistModal = !showAddToPlaylistModal}>
        <FontAwesomeIcon icon={faTimesCircle} class="icon"/>
      </a>
    </header>
    <section class="modal-card-body">
      {#if track}
      <p class="label">Add {track.name} to a playlist</p>
      {/if}
      
      <div class="list is-hoverable">
        {#each $playlists as playlist}
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
    // $mopidy = await connectWS()
    const message = await connectWS()
    console.log("in playlist", message);
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
      showAddToPlaylistModal = !showAddToPlaylistModal
      return true
    } else {
      return false
    }
    
  }

</script>

<style>
  .modal, .modal-background {
    bottom: 0;
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
  }

  .modal-close {
    -moz-appearance: none;
    -webkit-appearance: none;
    background-color: rgba(10, 10, 10, 0.2);
    border: none;
    border-radius: 290486px;
    cursor: pointer;
    pointer-events: auto;
    display: inline-block;
    flex-grow: 0;
    flex-shrink: 0;
    font-size: 0;
    height: 20px;
    max-height: 20px;
    max-width: 20px;
    min-height: 20px;
    min-width: 20px;
    outline: none;
    position: relative;
    vertical-align: top;
    width: 20px;
  }

  .modal-close::before, .modal-close::after {
    background-color: white;
    content: "";
    display: block;
    left: 50%;
    position: absolute;
    top: 50%;
    transform: translateX(-50%) translateY(-50%) rotate(45deg);
    transform-origin: center center;
  }

  .modal-close::before {
    height: 2px;
    width: 50%;
  }

  .modal-close::after {
    height: 50%;
    width: 2px;
  }

  .modal-close:hover, .modal-close:focus {
    background-color: rgba(10, 10, 10, 0.3);
  }

  .modal-close:active {
    background-color: rgba(10, 10, 10, 0.4);
  }

  .is-large.modal-close {
    height: 32px;
    max-height: 32px;
    max-width: 32px;
    min-height: 32px;
    min-width: 32px;
    width: 32px;
  }

  .modal {
    align-items: center;
    display: none;
    flex-direction: column;
    justify-content: center;
    overflow: hidden;
    position: fixed;
    z-index: 40;
  }

  .modal.is-active {
    display: flex;
  }


  .modal-background {
    background-color: rgba(10, 10, 10, 0.86);
  }

  .modal-card {
    margin: 0 20px;
    max-height: calc(100vh - 160px);
    overflow: auto;
    position: relative;
    width: 100%;
  }

  @media screen and (min-width: 769px), print {
    .modal-card {
      margin: 0 auto;
      max-height: calc(100vh - 40px);
      width: 640px;
    }
  }

  .modal-close {
    background: none;
    height: 40px;
    position: fixed;
    right: 20px;
    top: 20px;
    width: 40px;
  }

  .modal-card {
    display: flex;
    flex-direction: column;
    max-height: calc(100vh - 40px);
    overflow: hidden;
    overflow-y: visible;
    -ms-overflow-y: visible;
  }

  .modal-card-head,
  .modal-card-foot {
    align-items: center;
    background-color: whitesmoke;
    display: flex;
    flex-shrink: 0;
    justify-content: flex-start;
    padding: 20px;
    position: relative;
  }

  .modal-card-head {
    border-bottom: 1px solid #dbdbdb;
    border-top-left-radius: 6px;
    border-top-right-radius: 6px;
  }

  .modal-card-title {
    color: #363636;
    flex-grow: 1;
    flex-shrink: 0;
    font-size: 1.5rem;
    line-height: 1;
  }

  .modal-card-foot {
    border-bottom-left-radius: 6px;
    border-bottom-right-radius: 6px;
    border-top: 1px solid #dbdbdb;
  }

  .modal-card-foot .button:not(:last-child) {
    margin-right: 0.5em;
  }

  .modal-card-body {
    -webkit-overflow-scrolling: touch;
    background-color: white;
    flex-grow: 1;
    flex-shrink: 1;
    overflow: auto;
    padding: 20px;
  }
</style>

