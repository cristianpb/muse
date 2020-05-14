<div class="columns">
  <div class="column">
    <h1 class="title">{slug.replace('-',' ')}</h1>
  </div>
  <div class="column is-narrow" >
    <div class="columns is-mobile">
      <div class="column">
        <a class="button" href="playlists">
          <FontAwesomeIcon icon={faArrowLeft} class="icon"/>
        </a>
      </div>
      <div class="column">
        <a class="button" href="{null}" on:click={handleClickSave}>
          <FontAwesomeIcon icon={faSave} class="icon"/>
        </a>
      </div>
      <div class="column">
        <div class="dropdown is-right" class:is-active={showOptions} >
          <div class="dropdown-trigger" on:click={() => showOptions = !showOptions}>
          {#if showOptions}
            <a href="{null}" class="button">
              <FontAwesomeIcon icon={faAngleUp} class="icon" aria-haspopup="true" aria-controls="dropdown-menu"/>
            </a>
          {:else}
            <a href="{null}" class="button">
              <FontAwesomeIcon icon={faAngleDown} class="icon" aria-haspopup="true" aria-controls="dropdown-menu"/>
            </a>
          {/if}
          </div>
          <div class="dropdown-menu" id="dropdown-menu" role="menu">
            <div class="dropdown-content">
              <a href="{null}" class="dropdown-item" on:click={playPlaylist(selectedPlaylist.uri)}>
                <FontAwesomeIcon icon={faPlayCircle} class="icon is-small"/>&nbsp;&nbsp;
                  Play now
              </a>
              <a href="{null}" class="dropdown-item" on:click={shufflePlaylist(selectedPlaylist.uri)}>
                <FontAwesomeIcon icon={faRandom} class="icon is-small"/>&nbsp;&nbsp;
                  Play shuffle
              </a>
              <a href="{null}" class="dropdown-item" on:click={addToQueuePlaylists(selectedPlaylist.uri)}>
                <FontAwesomeIcon icon={faLevelDownAlt} class="icon is-small"/>&nbsp;&nbsp;
                  Add to queue
              </a>
              <a href="{null}" class="dropdown-item" on:click={() => deletePlaylistConfirmation = !deletePlaylistConfirmation}>
                <FontAwesomeIcon icon={faMinus} class="icon is-small"/>&nbsp;&nbsp;
                  Delete playlist
              </a>
            </div>
          </div>
        </div>


      </div>
      {#if savePlaylistPromise}
        {#await savePlaylistPromise}
          <div class="column">
            <a class="button" href="{null}">
              <FontAwesomeIcon icon={faSpinner} spin={true} class="icon"/>
            </a>
          </div>
        {:then res}
          {#if res}
            <div class="column">
              <a class="button" href="{null}">
                <FontAwesomeIcon icon={faCheck} class="icon"/>
              </a>
            </div>
          {:else}
            Error
          {/if}
        {:catch error}
          {error.message}
        {/await}
      {/if}
    </div>
  </div>
</div>

<div class="modal" class:is-active={deletePlaylistConfirmation}  >
  <div class="modal-background"  on:click={() => deletePlaylistConfirmation = !deletePlaylistConfirmation}></div>
  <div class="modal-content has-text-centered">
    <p class="title">
      Delete playlist
    </p>
    <button class="button" on:click={deletePlaylist(selectedPlaylist.uri)}>
      Yes
    </button>
  </div>
  <button class="modal-close is-large" aria-label="close" on:click={() => deletePlaylistConfirmation = !deletePlaylistConfirmation}></button>
</div>


<div class="list is-hoverable">
  {#if playlistsTracks.tracks}
    {#each playlistsTracks.tracks as track, index (getKey(track)) }
      <a class="list-item" 
         href="{null}" 
         draggable={true} 
         on:dragstart={event => dragstart(event, index)}
         on:drop|preventDefault={event => drop(event, index)}
         ondragover="return false"
         on:dragenter={() => hovering = index}
         class:is-active={hovering === index}
         animate:flip
         >
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
                   <a href="{null}" class="dropdown-item" on:click={removeTrack(track.uri)}>
                     <FontAwesomeIcon icon={faMinus} class="icon is-small"/>&nbsp;
                       Remove track
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
  {:else}
    <a class="list-item" href="{null}">No tracks</a>
  {/if}
</div>

<script>
  import { stores } from "@sapper/app";
  import { onMount } from 'svelte';
  import { mopidy, playlists } from '../../tools/stores';
  import { flip } from 'svelte/animate';
  import { goto } from '@sapper/app';
  import { connectWS, getPlaylists, getPlaylistTracks, playTrackSingle, addTrackNext, addTrackQueue, playPlaylist, shufflePlaylist, addToQueuePlaylists } from '../../tools/mopidyTools';
  import FontAwesomeIcon from '../../components/FontAwesomeIcon.svelte'
  import {
    faArrowLeft,
    faArrowRight,
    faLevelDownAlt,
    faAngleDown,
    faAngleUp,
    faPlayCircle,
    faSpinner,
    faCheck,
    faMinus,
    faSave,
    faRandom,
    faGripLines
  } from '@fortawesome/free-solid-svg-icons';

  const { page } = stores();
  const { slug } = $page.params;

  let deletePlaylistConfirmation = false;
  let showOptions = false;
  let playlistsTracks = [];
  let selectedPlaylist;
  let savePlaylistPromise;
  let hovering = false;
  let key;
  const getKey = item => (key ? item[key] : item);

  onMount(async() => {
    $mopidy = await connectWS()
    $playlists = await getPlaylists()
    selectedPlaylist = $playlists.find(playlist => playlist.name === slug)
    playlistsTracks  = await getPlaylistTracks(selectedPlaylist.uri)
  })

  function drop(event, i) {
		event.dataTransfer.dropEffect = 'move';
    let target = event.dataTransfer.getData("text/plain");
    let newPlaylist = playlistsTracks.tracks
    newPlaylist[i] = newPlaylist.splice(target, 1, newPlaylist[i])[0];
    playlistsTracks.tracks = newPlaylist
    hovering = null
  }

  function dragstart(event, i) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.dropEffect = 'move';
    let target = i;
    event.dataTransfer.setData('text/plain', target);
  }

  async function savePlaylist() {
    const res = await $mopidy.playlists.save({playlist: playlistsTracks})
    if (res) {
      return true
    } else {
      return false
    }
  }

  function handleClickSave() {
    savePlaylistPromise = savePlaylist()
  }

  function removeTrack(uri) {
    let newPlaylist = playlistsTracks.tracks
    newPlaylist = newPlaylist.filter(x => x.uri != uri);
    playlistsTracks.tracks = newPlaylist
  }

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

  .modal-close {
    background: none;
    height: 40px;
    position: fixed;
    right: 20px;
    top: 20px;
    width: 40px;
  }
</style>
