<div class="modal" class:is-active={showCreatePlaylistModal}  >
  <div class="modal-background"  on:click={() => showCreatePlaylistModal = !showCreatePlaylistModal} on:keypress={() => showCreatePlaylistModal = !showCreatePlaylistModal}></div>
  <div class="modal-card">
    <header class="modal-card-head">
      <p class="modal-card-title">Create playlist</p>
      <a href="{null}" aria-label="close" on:click={() => showCreatePlaylistModal = !showCreatePlaylistModal}>
        <FontAwesomeIcon icon={faTimesCircle} class="icon"/>
      </a>
    </header>
    <section class="modal-card-body">
      <label class="label" for="playlist name">Name</label>
      <input class="input" type="text" bind:value={playlistName} name="playlist name" id="playlist name"/>
    </section>
    <footer class="modal-card-foot">
      <button class="button is-success" on:click={handlePlaylistCreate}>Save changes</button>
      {#if createPlaylistPromise}
        {#await createPlaylistPromise}
          <button class="button">
            <FontAwesomeIcon icon={faSpinner} spin={true} class="icon"/>
          </button>
        {:then res}
          {#if res}
            <button class="button">
              <FontAwesomeIcon icon={faCheck} class="icon"/>
            </button>
          {:else}
            Error
          {/if}
        {:catch error}
          {error.message}
        {/await}
      {/if}
    </footer>
  </div>
  <button class="modal-close is-large" aria-label="close" on:click={() => showCreatePlaylistModal = !showCreatePlaylistModal}></button>
</div>

<script>
  import { onMount } from 'svelte';
  import { mopidy, playlists } from '../tools/stores';
  import { connectWS, getPlaylists } from '../tools/mopidyTools';
  import FontAwesomeIcon from '../components/FontAwesomeIcon.svelte'
  import {
    faCheck,
    faSpinner,
    faTimesCircle
  } from '@fortawesome/free-solid-svg-icons';

  let playlistName = '';
  let createPlaylistPromise;

  export let showCreatePlaylistModal;

  onMount(() => {
    connectWS()
  })

  const createPlaylist = async () => {
    const res = await $mopidy.playlists.create({name: playlistName})
    if (res) {
      setTimeout(async () => { 
        const playlistsLocal = await getPlaylists()
        playlists.set(playlistsLocal)
        showCreatePlaylistModal = !showCreatePlaylistModal
      }, 500)
      return true
    } else {
      return false
    }
  }

  const handlePlaylistCreate = () => {
    createPlaylistPromise = createPlaylist()
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


  .input {
    -moz-appearance: none;
    -webkit-appearance: none;
    align-items: center;
    border: 1px solid transparent;
    border-radius: 4px;
    box-shadow: none;
    display: inline-flex;
    font-size: 1rem;
    height: 2.5em;
    justify-content: flex-start;
    line-height: 1.5;
    padding-bottom: calc(0.5em - 1px);
    padding-left: calc(0.75em - 1px);
    padding-right: calc(0.75em - 1px);
    padding-top: calc(0.5em - 1px);
    position: relative;
    vertical-align: top;
  }

  .input {
    background-color: white;
    border-color: #dbdbdb;
    border-radius: 4px;
    color: #363636;
  }

  .input::-moz-placeholder {
    color: rgba(54, 54, 54, 0.3);
  }

  .input::-webkit-input-placeholder {
    color: rgba(54, 54, 54, 0.3);
  }

  .input:-moz-placeholder {
    color: rgba(54, 54, 54, 0.3);
  }

  .input:-ms-input-placeholder {
    color: rgba(54, 54, 54, 0.3);
  }

  .input:hover {
    border-color: #b5b5b5;
  }

  .input:focus {
    border-color: #3273dc;
    box-shadow: 0 0 0 0.125em rgba(50, 115, 220, 0.25);
  }

  .input {
    box-shadow: inset 0 0.0625em 0.125em rgba(10, 10, 10, 0.05);
    max-width: 100%;
    width: 100%;
  }

</style>
