<div class="modal" class:is-active={showCreatePlaylistModal}  >
  <div class="modal-background"  on:click={() => showCreatePlaylistModal = !showCreatePlaylistModal}></div>
  <div class="modal-card">
    <header class="modal-card-head">
      <p class="modal-card-title">Create playlist</p>
      <a href="{null}" aria-label="close" on:click={() => showCreatePlaylistModal = !showCreatePlaylistModal}>
        <FontAwesomeIcon icon={faTimesCircle} class="icon"/>
      </a>
    </header>
    <section class="modal-card-body">
      <label class="label">Name
        <input class="input" type="text" bind:value={playlistName} name="playlist name" id="playlist name"/>
      </label>
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

<script lang="ts">
  import { onMount } from 'svelte';
  import { mopidy } from '../tools/stores';
  import { connectWS } from '../tools/mopidyTools';
  import FontAwesomeIcon from '../components/FontAwesomeIcon.svelte'
  import {
    faCheck,
    faSpinner,
    faTimesCircle
  } from '@fortawesome/free-solid-svg-icons';

  let playlistName = '';
  let createPlaylistPromise: any;

  export let showCreatePlaylistModal: boolean;

  onMount(async () => {
    $mopidy = await connectWS()
  })

  const createPlaylist = async () => {
    const res = await $mopidy.playlists.create({name: playlistName})
    if (res) {
      setTimeout(() => { showCreatePlaylistModal = !showCreatePlaylistModal }, 1500)
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
