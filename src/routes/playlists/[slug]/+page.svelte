<DeletePlaylist deletePlaylistConfirmation={deletePlaylistConfirmation} selectedPlaylist={data.selectedPlaylist} />
<div class="columns">
  <div class="column">
    <h1 class="title">{data.slug.replace('-',' ')}</h1>
  </div>
  <div class="column is-narrow" >
    <div class="columns is-mobile">
      <div class="column">
        <a class="button" href="{base}/playlists">
          <FontAwesomeIcon icon={faArrowLeft} class="icon"/>
        </a>
      </div>
      <div class="column">
        <a href="{null}" class="button"  on:click={handleClickSave}>
          <FontAwesomeIcon icon={faSave} class="icon"/>
        </a>
      </div>
      <div class="column">
        <div class="dropdown is-right" class:is-active={showOptions} >
          <div class="dropdown-trigger"  role="button" tabindex="0" on:click={() => showOptions = !showOptions} on:keypress={() => showOptions = !showOptions}>
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
              <a href="{null}" class="dropdown-item" on:click={playPlaylist(data.selectedPlaylist.uri)}>
                <FontAwesomeIcon icon={faPlayCircle} class="icon is-small"/>&nbsp;&nbsp;
                  Play now
              </a>
              <a href="{null}" class="dropdown-item" on:click={shufflePlaylist(data.selectedPlaylist.uri)}>
                <FontAwesomeIcon icon={faRandom} class="icon is-small"/>&nbsp;&nbsp;
                  Play shuffle
              </a>
              <a href="{null}" class="dropdown-item" on:click={addToQueuePlaylists(data.selectedPlaylist.uri)}>
                <FontAwesomeIcon icon={faLevelDownAlt} class="icon is-small"/>&nbsp;&nbsp;
                  Add to queue
              </a>
              <a  href="{null}" class="dropdown-item" on:click={() => deletePlaylistConfirmation = !deletePlaylistConfirmation}>
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
            <a href="{null}" class="button" >
              <FontAwesomeIcon icon={faSpinner} spin={true} class="icon"/>
            </a>
          </div>
        {:then res}
          {#if res}
            <div class="column">
              <a href="{null}" class="button" >
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

<div use:clickOutside on:click_outside={() => dropdownActivate = null} class="list is-hoverable">
  {#await promise}
    <p class="list-item">
      <FontAwesomeIcon icon={faSpinner} class="icon is-24" spin={true}/>
      Loading songs ..
    </p>
  {:then _}
  {#if data.playlistsTracks.tracks}
    {#each data.playlistsTracks.tracks as track, index (getKey(track)) }
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
           <div class="column" role="button" tabindex="0" on:click={handleDropdownActivation(index)} on:keypress={handleDropdownActivation(index)}>
             {track.name}
           </div>
           <div class="column is-narrow">
             <div class="dropdown is-right is-up" class:is-active={dropdownActivate == index} >
               <div class="dropdown-trigger" role="button" tabindex="0" on:click={handleDropdownActivation(index)} on:keypress={handleDropdownActivation(index)}>
               {#if dropdownActivate == index}
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
                   <a  href="{null}" class="dropdown-item" on:click={addTrackNext(track.uri)}>
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
    <a href="{null}" class="list-item" >loading songs</a>
  {/each}
  {:else}
    <a href="{null}" class="list-item" >No tracks</a>
  {/if}
  {:catch error}
    <p class="list-item" style="color: red">{error.message}</p>
  {/await}
</div>

<script>
  import { mopidy } from '../../../lib/tools/stores';
  import { clickOutside } from '../../../lib/tools/clickOutside';
  import { flip } from 'svelte/animate';
  import { base } from '$app/paths';
  import DeletePlaylist from '../../../lib/components/DeletePlaylist.svelte';
  import { playTrackSingle, addTrackNext, addTrackQueue, playPlaylist, shufflePlaylist, addToQueuePlaylists } from '../../../lib/tools/mopidyTools';
  import FontAwesomeIcon from '../../../lib/components/FontAwesomeIcon.svelte'
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
    faRandom
  } from '@fortawesome/free-solid-svg-icons';

	/** @type {import('./$types').PageData} */
	export let data;

  let deletePlaylistConfirmation = false;
  let showOptions = false;
  //let playlistsTracks = [];
  //let selectedPlaylist;
  let savePlaylistPromise;
  let hovering = false;
  let key;
  let dropdownActivate;
  const getKey = item => (key ? item[key] : item);
  let promise

  //onMount(() => promise = loadTracks())

  function drop(event, i) {
		event.dataTransfer.dropEffect = 'move';
    let target = event.dataTransfer.getData("text/plain");
    let newPlaylist = data.playlistsTracks.tracks
    newPlaylist[i] = newPlaylist.splice(target, 1, newPlaylist[i])[0];
    data.playlistsTracks.tracks = newPlaylist
    hovering = null
  }

  function dragstart(event, i) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.dropEffect = 'move';
    let target = i;
    event.dataTransfer.setData('text/plain', target);
  }

  async function savePlaylist() {
    const res = await $mopidy.playlists.save({playlist: data.playlistsTracks})
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
    let newPlaylist = data.playlistsTracks.tracks
    newPlaylist = newPlaylist.filter(x => x.uri != uri);
    data.playlistsTracks.tracks = newPlaylist
  }

  const handleDropdownActivation = (index) => {
    if (dropdownActivate === index) {
      dropdownActivate = null
    } else {
      dropdownActivate = index
    }
  }

</script>
