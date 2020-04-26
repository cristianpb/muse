<div class="modal" class:is-active={showCreatePlaylistModal}  >
  <div class="modal-background"  on:click={() => showCreatePlaylistModal = !showCreatePlaylistModal}></div>
  <div class="modal-card">
    <header class="modal-card-head">
      <p class="modal-card-title">Create playlist</p>
      <button class="delete" aria-label="close"></button>
    </header>
    <section class="modal-card-body">
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
  import { mopidy } from '../tools/stores';
  import FontAwesomeIcon from '../components/FontAwesomeIcon.svelte'
  import {
    faCheck,
    faSpinner
  } from '@fortawesome/free-solid-svg-icons';

  let playlistName = '';
  let createPlaylistPromise;

  export let showCreatePlaylistModal;

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
