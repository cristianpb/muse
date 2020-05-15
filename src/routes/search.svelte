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
        <div class:is-active={dropMenuActive} class="dropdown">
          <div class="dropdown-trigger"  on:click={() => dropMenuActive = !dropMenuActive}>
            <button class="button is-link" aria-haspopup="true" aria-controls="dropdown-menu-sources">
              <span>Sources</span>
              {#if dropMenuActive}
                <FontAwesomeIcon icon={faAngleUp} class="icon" aria-haspopup="true" aria-controls="dropdown-menu"/>
              {:else}
                <FontAwesomeIcon icon={faAngleDown} class="icon" aria-haspopup="true" aria-controls="dropdown-menu"/>
              {/if}
            </button>
          </div>
          <div class="dropdown-menu" id="dropdown-menu-sources" role="menu">
            <div class="dropdown-content">
              {#each uris as uri}
              <a href="{null}" class="dropdown-item">
                <label class="checkbox">
                  <input bind:group={selectedUris} value={uri} type="checkbox">
                  {uri}
                </label>
              </a>
              {:else}
              <a href="{null}" class="dropdown-item">
                loading
              </a>
              {/each}
            </div>
          </div>
        </div>
      </div>
      <div class="column">
        <button on:click={searchFunction} class="button">
          <FontAwesomeIcon icon={faSearch} class="icon"/>
        </button>
      </div>
      {#if resultTracks.length > 0}
      <div class="column">
        <div class="dropdown is-right"  class:is-active={showOptions}>
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
              <a href="{null}" class="dropdown-item" on:click={playAllTracks}>
                <FontAwesomeIcon icon={faPlayCircle} class="icon is-small" />&nbsp;
                  Play All
              </a>
              <a href="{null}" class="dropdown-item" on:click={shufflePlayAllTracks}>
                <FontAwesomeIcon icon={faRandom} class="icon is-small"/>&nbsp;
                  Shuffle & Play All
              </a>
              <a href="{null}" class="dropdown-item" on:click={addTracksQueue}>
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
  <div class="list is-hoverable">
    {#each resultTracks as track, idx (idx)}
      <a class="list-item" 
         animate:flip={{ duration: 300 }}
         href="{null}"
         draggable={true} 
         on:dragstart={event => dragstart(event, idx)}
         on:drop|preventDefault={event => drop(event, idx)}
         ondragover="return false"
         on:dragenter={() => hovering = idx}
         class:is-active={hovering === idx}
         >
        <div class="columns is-mobile">
          <div class="column"  on:click={handleDropdownActivation(idx + 1)} >
            {#if track.artists}
              {track.artists.map(x => x.name).join(', ')} - {track.name}
            {:else}
              unknown artist
            {/if}
          </div>
          <div class="column is-narrow">
            <div class:is-active={dropdownActivate == idx + 1} class="dropdown is-right is-up" >
              <div class="dropdown-trigger">
                {#if dropdownActivate == idx + 1 }
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
                  <a href={null} class="dropdown-item" on:click={addTrackNext(track.uri)}>
                    <FontAwesomeIcon icon={faArrowRight} class="icon is-small"/>&nbsp;
                      Play next
                  </a>
                  <a href="{null}" class="dropdown-item" on:click={addTrackQueue(track.uri)}>
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
    {:then number}
      <a class="list-item" href="{null}">no tracks found</a>
    {:catch error}
      <p class="list-item" style="color: red">{error.message}</p>
    {/await}
  {/if}
{/if}

<script>
  import { flip } from 'svelte/animate';
  import { connectWS, playTrackSingle, addTrackNext, addTrackQueue } from '../tools/mopidyTools';
  import AddToPlaylist from '../components/AddToPlaylist.svelte';
  import { mopidy } from '../tools/stores';
  import { onMount } from 'svelte';
  import FontAwesomeIcon from '../components/FontAwesomeIcon.svelte'
  import {
    faSearch,
    faPlayCircle,
    faAngleDown,
    faArrowRight,
    faLevelDownAlt,
    faAngleUp,
    faPlus,
    faRandom,
  } from '@fortawesome/free-solid-svg-icons';

  let dropMenuActive = false;
  let selectedUris = ['local'];
  let hideUris = ['http', 'https', 'mms', 'rtmp', 'rtmps', 'rtsp', 'file']
  let uris = [];
  let promise;
  let showAddToPlaylistModal = false;
  let showOptions = false;
  let selectedTrack;
  let dropdownActivate;
  let resultTracks = [];
  let hovering = false;
  let searchTerm = '';

  onMount(async () => {
    $mopidy = await connectWS()
    const urisResult = await $mopidy.getUriSchemes()
    if (urisResult) {
      uris = urisResult.filter(x => hideUris.indexOf(x) === -1)
    }
  })

  async function searchFunction() {
    resultTracks = []
    const urisRequest = selectedUris.map(x => x + ':')
    const res = await $mopidy.library.search({'query': {'any': [searchTerm]}, 'uris': [`${urisRequest}`]})
    if (res && res.length > 0) {
      let { tracks } = res.pop()
      if (tracks) resultTracks =  tracks
      return true
    }
  }

  function handleSearch(event) {
    if (event.which === 13) {
      promise = searchFunction()
    }
  }

  const openAddListModal = (track) => {
    selectedTrack = track 
    showAddToPlaylistModal = !showAddToPlaylistModal
  }

  const playAllTracks = () => {
    $mopidy.tracklist.clear()
    $mopidy.tracklist.add([resultTracks])
    $mopidy.playback.play()
    showOptions = !showOptions
  }

  const shufflePlayAllTracks = () => {
    $mopidy.tracklist.clear()
    $mopidy.tracklist.add([resultTracks])
    $mopidy.tracklist.shuffle()
    $mopidy.playback.play()
    showOptions = !showOptions
  }

  const addTracksQueue = () => {
    $mopidy.tracklist.add([resultTracks])
    showOptions = !showOptions
  }

  const handleDropdownActivation = (idx) => {
    if (dropdownActivate === idx) {
      dropdownActivate = null
    } else {
      dropdownActivate = idx
    }
  }

  function drop(event, target) {
		event.dataTransfer.dropEffect = 'move';
    const start = parseInt(event.dataTransfer.getData("text/plain"));
    hovering = null
  }

  function dragstart(event, i) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.dropEffect = 'move';
    const start = i;
    event.dataTransfer.setData('text/plain', start);
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

  .checkbox input {
    cursor: pointer;
  }

  .checkbox {
    cursor: pointer;
    display: inline-block;
    line-height: 1.25;
    position: relative;
  }

  .checkbox input {
    cursor: pointer;
  }

  .checkbox:hover {
    color: #363636;
  }

</style>
