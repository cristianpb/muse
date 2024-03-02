<svelte:head>
  <title>Search</title>
</svelte:head>

<h1 class="title">Search</h1>

<div class="columns">
  <div class="column">
    <input class="input is-rounded" type="text" placeholder="Search for music" on:keydown={handleSearch}  bind:value={searchTerm}>
  </div>
  <div class="column is-narrow">
    <div class="columns is-mobile">
      <div class="column">
        {#await promiseLoading}
          {#if mopidyConnectionStatus}
            <button class="button" disabled>
              Loading sources &nbsp;&nbsp;&nbsp;
              <FontAwesomeIcon icon={faSpinner} spin={true} class="icon"/>
            </button>
          {:else}
            <button class="button" disabled>
              Connecting to mopidy &nbsp;&nbsp;&nbsp;&nbsp;
              <FontAwesomeIcon icon={faSpinner} spin={true} class="icon"/>
            </button>
          {/if}
        {:then}
          <div class="tags">
            {#each uris as uri}
              <span class="tag" role="button" tabindex="0" class:is-primary="{selectedUris[uri]}" on:click="{() => selectedUris[uri] = !selectedUris[uri]}" on:keypress="{() => selectedUris[uri] = !selectedUris[uri]}">
                {#if uri in uriIcons}
                  <FontAwesomeIcon icon={uriIcons[uri]} class="icon is-small"/> &nbsp; {uri}
                {:else}
                  <FontAwesomeIcon icon={faMusic} class="icon is-small"/> &nbsp; {uri}
                {/if}
              </span>
            {/each}
          </div>
        {/await}
      </div>
      <div class="column is-narrow">
        <button on:click={launchSearch} class="button">
          <FontAwesomeIcon icon={faSearch} class="icon"/>
        </button>
      </div>
      {#if resultTracks.length > 0}
      <div class="column is-narrow">
        <div class="dropdown is-right"  class:is-active={showOptions}>
          <div class="dropdown-trigger" role="button" tabindex="0" on:click={() => showOptions = !showOptions} on:keypress={() => showOptions = !showOptions}>
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
              <a href="{null}" class="dropdown-item" on:click={_playTrackSingle(resultTracks)}>
                <FontAwesomeIcon icon={faPlayCircle} class="icon is-small" />&nbsp;
                  Play All
              </a>
              <a href="{null}" class="dropdown-item" on:click={_shufflePlayAllTracks(resultTracks)}>
                <FontAwesomeIcon icon={faRandom} class="icon is-small"/>&nbsp;
                  Shuffle & Play All
              </a>
              <a href="{null}" class="dropdown-item" on:click={_addTracksQueue(resultTracks)}>
                <FontAwesomeIcon icon={faLevelDownAlt} class="icon is-small"/>&nbsp;
                  Add to queue
              </a>
              <!--
              <a href="{null}" class="dropdown-item">
                <FontAwesomeIcon icon={faPlus} class="icon is-small"/>&nbsp;
                  Add to playlist
              </a>
              -->
            </div>
          </div>
        </div>
      </div>
      {/if}
    </div>
  </div>
</div>

<AddToPlaylist showAddToPlaylistModal={showAddToPlaylistModal} track={selectedTrack}/>
{#if resultTracks.length > 0}
  <div use:clickOutside on:click_outside={() => dropdownActivate = null} class="list is-hoverable">
    {#each resultTracks as track, idx (idx + 1)}
      <a class="list-item" 
         animate:flip={{ duration: 300 }}
         href="{null}"
         draggable={true} 
         on:dragstart={event => dragstart(event, idx)}
         on:drop|preventDefault={event => drop(event)}
         ondragover="return false"
         on:dragenter={() => hovering = idx}
         class:is-active={hovering === idx}
         >
        <div class="columns is-mobile" role="button" tabindex="0" on:click={handleDropdownActivation(idx)} on:keypress={handleDropdownActivation(idx)}>
          <div class="column">
            {#if track.artists}
              {track.artists.map(x => x.name).join(', ')} - {track.name}
            {:else}
              unknown artist
            {/if}
          </div>
          <div class="column is-narrow">
            <div class:is-active={dropdownActivate == idx} class="dropdown is-right is-up" >
              <div class="dropdown-trigger">
                {#if dropdownActivate == idx}
                  <FontAwesomeIcon icon={faAngleUp} class="icon" aria-haspopup="true" aria-controls="dropdown-menu"/>
                {:else}
                  <FontAwesomeIcon icon={faAngleDown} class="icon" aria-haspopup="true" aria-controls="dropdown-menu"/>
                {/if}
              </div>
              <div class="dropdown-menu" id="dropdown-menu" role="menu">
                <div class="dropdown-content">
                  <a href="{null}" class="dropdown-item" on:click={_playTrackSingle(track.uri)}>
                    <FontAwesomeIcon icon={faPlayCircle} class="icon is-small"/>&nbsp;
                      Play now
                  </a>
                  <a href={null} class="dropdown-item" on:click={_addTrackNext(track.uri)}>
                    <FontAwesomeIcon icon={faArrowRight} class="icon is-small"/>&nbsp;
                      Play next
                  </a>
                  <a href="{null}" class="dropdown-item" on:click={_addTrackQueue(track.uri)}>
                    <FontAwesomeIcon icon={faLevelDownAlt} class="icon is-small"/>&nbsp;
                      Add to queue
                  </a>
                  <a href="{null}" class="dropdown-item" on:click={openAddListModal(track)}>
                    <FontAwesomeIcon icon={faPlus} class="icon is-small" />&nbsp;
                      Add to a playlist
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </a>
    {/each}
  </div>
{:else}
  {#if promise}
    {#await promise}
      <p class="list-item">loading ...</p>
    {:then}
      <a class="list-item" href="{null}">no tracks found</a>
    {:catch error}
      <p class="list-item" style="color: red">{error.message}</p>
    {/await}
  {/if}
{/if}

<script>
  import { flip } from 'svelte/animate';
  import { playTrackSingle, addTrackNext, shufflePlayAllTracks, addTracksQueue, loadUrisResults, searchFunction } from '../../lib/tools/mopidyTools';
  import AddToPlaylist from '../../lib/components/AddToPlaylist.svelte';
  import { clickOutside } from '../../lib/tools/clickOutside';
  import { onMount } from 'svelte';
  import FontAwesomeIcon from '../../lib/components/FontAwesomeIcon.svelte'
  import {
    faSearch,
    faPlayCircle,
    faAngleDown,
    faArrowRight,
    faLevelDownAlt,
    faAngleUp,
    faPlus,
    faRandom,
    faDatabase,
    faPodcast,
    faFish,
    faGuitar,
    faMusic,
    faSpinner
  } from '@fortawesome/free-solid-svg-icons';

  let selectedUris = {};
  let hideUris = ['http', 'https', 'file', 'mms', 'rtmp', 'rtmps', 'rtsp', 'podcast+file', 'podcast+http', 'podcast+https']
  let uriIcons = {
    local: faDatabase,
    podcast: faPodcast,
    subidy: faFish,
    tunein: faGuitar
  }
  let uris = [];
  let promise;
  let promiseLoading;
  let showAddToPlaylistModal = false;
  let showOptions = false;
  let selectedTrack;
  let dropdownActivate;
  let resultTracks = [];
  let hovering = false;
  let searchTerm = '';
  let mopidyConnectionStatus;

  onMount(async () => {
    uris = await loadUrisResults(selectedUris, hideUris)
  })

  const handleSearch = (event) => {
    if (event.which === 13) {
      launchSearch()
    }
  }

  const launchSearch = async () => {
      resultTracks = await searchFunction(selectedUris, searchTerm)
  }

  const openAddListModal = (track) => {
    selectedTrack = track 
    showAddToPlaylistModal = !showAddToPlaylistModal
  }

  const handleDropdownActivation = (idx) => {
    if (dropdownActivate === idx) {
      dropdownActivate = null
    } else {
      dropdownActivate = idx
    }
  }

  function drop(event) {
		event.dataTransfer.dropEffect = 'move';
    hovering = null
  }

  function dragstart(event, i) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.dropEffect = 'move';
    const start = i;
    event.dataTransfer.setData('text/plain', start);
  }

  const _playTrackSingle = (track) => {
    dropdownActivate = null
    showOptions = false
    playTrackSingle(track)
  }

  const _addTrackNext = (uri) => {
    dropdownActivate = null
    addTrackNext(uri)
  }

  const _addTrackQueue = (uri) => {
    dropdownActivate = null
    addTracksQueue(null, [uri])
  }

  const _shufflePlayAllTracks = (Tracks) => {
    showOptions = false
    shufflePlayAllTracks(Tracks)
  }

  const _addTracksQueue = (Tracks) => {
    showOptions = false
    addTracksQueue(Tracks)
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

  .input.is-rounded {
    border-radius: 290486px;
    padding-left: calc(calc(0.75em - 1px) + 0.375em);
    padding-right: calc(calc(0.75em - 1px) + 0.375em);
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

  .tags {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
  }

  .tags .tag {
    margin-bottom: 0.5rem;
  }

  .tags .tag:not(:last-child) {
    margin-right: 0.5rem;
  }

  .tags:last-child {
    margin-bottom: -0.5rem;
  }

  .tags:not(:last-child) {
    margin-bottom: 1rem;
  }

  .tag:not(body) {
    align-items: center;
    background-color: whitesmoke;
    border-radius: 4px;
    color: #4a4a4a;
    display: inline-flex;
    font-size: 0.75rem;
    height: 2em;
    justify-content: center;
    line-height: 1.5;
    padding-left: 0.75em;
    padding-right: 0.75em;
    white-space: nowrap;
  }

  .tag:not(body).is-primary {
    background-color: #DA9C20;
    color: #fff;
  }
</style>
