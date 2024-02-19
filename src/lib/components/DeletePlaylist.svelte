<div class="modal" class:is-active={deletePlaylistConfirmation}  >
  <div class="modal-background" role="button" tabindex="0" on:click={() => deletePlaylistConfirmation = !deletePlaylistConfirmation} on:keypress={() => deletePlaylistConfirmation = !deletePlaylistConfirmation}></div>
  <div class="modal-card">
    <div class="modal-card-body has-text-centered">
      <p class="title">
        Delete playlist
      </p>
      <button class="button" on:click={deletePlaylist(selectedPlaylist.uri)}>
        Yes
      </button>
    </div>
  </div>
  <button class="modal-close is-large" aria-label="close" on:click={() => deletePlaylistConfirmation = !deletePlaylistConfirmation}></button>
</div>

<script>
  import { mopidy } from '../tools/stores';
  import { goto } from '$app/navigation';

  export let deletePlaylistConfirmation;
  export let selectedPlaylist;

  const deletePlaylist = async (uri) => {
    const res = await $mopidy.playlists.delete({uri})
    if (res) {
      deletePlaylistConfirmation = !deletePlaylistConfirmation
      setTimeout(() => { goto('playlists'); }, 1000)
    } else {
      console.log("Error: no laylist remove")
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

  .modal-card-body {
    -webkit-overflow-scrolling: touch;
    background-color: white;
    flex-grow: 1;
    flex-shrink: 1;
    overflow: auto;
    padding: 20px;
  }

</style>
