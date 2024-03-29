<svelte:head>
  <title>Browse</title>
</svelte:head>

<h1 class="title">Browse
</h1>

<div class="columns is-mobile">
  <div class="column">
    <nav class="breadcrumb" aria-label="breadcrumbs">
      <ul>
        <li>
          <a href="{null}" on:click={() => promise = goToRoot()}>
            Root
          </a>
        </li>
        {#each browsePath as pathElement, idx}
          <li>
            <a href="{null}" on:click={() => promise = browserUri(pathElement, idx, 'back')}>
              {pathElement.name}
            </a>
          </li>
        {/each}
      </ul>
    </nav>
  </div>
  {#if results.some(checkOverallDropdownNeeded)}
  <div class="column is-narrow">
    <div class="dropdown is-right" class:is-active={showOptions} >
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
          <a href="{null}" class="dropdown-item" on:click={() => _playAllTracks(results)}>
            <FontAwesomeIcon icon={faPlayCircle} class="icon is-small"  />&nbsp;&nbsp;
            Play now
          </a>
          <a href="{null}" class="dropdown-item" on:click={() => _shufflePlayAllTracks(results)}>
            <FontAwesomeIcon icon={faRandom} class="icon is-small"/>&nbsp;&nbsp;
            Play shuffle
          </a>
          <a href="{null}" class="dropdown-item" on:click={() => _addTracksQueue(results)}>
            <FontAwesomeIcon icon={faLevelDownAlt} class="icon is-small"/>&nbsp;&nbsp;
            Add to queue
          </a>
        </div>
      </div>
    </div>
  </div>
  {/if}
</div>

{#if promise}
  <div class="list is-hoverable">
    {#await promise}
      {#if mopidyConnectionStatus}
        <p class="list-item">
          Loading sources &nbsp;&nbsp;&nbsp;
          <FontAwesomeIcon icon={faSpinner} spin={true} class="icon"/>
        </p>
      {:else}
        <p class="list-item">
          Connecting to mopidy &nbsp;&nbsp;&nbsp;&nbsp;
          <FontAwesomeIcon icon={faSpinner} class="icon is-24" spin={true}/>
        </p>
      {/if}
    {:catch error}
      <p class="list-item" style="color: red">{error.message}</p>
    {/await}
  </div>
{/if}

{#if results.length > 0}
  <div use:clickOutside on:click_outside={() => options = null} class="list is-hoverable">
    {#each results as result, idx}
      <a href={null} class="list-item" >
        <div class="columns is-mobile">
          <div class="column" role="button" tabindex="0" on:click={() => promise = browserUri(result, idx, 'avance')} on:keypress={() => promise = browserUri(result, idx, 'avance')}>
            {result.name}
          </div>
          {#if checkItemDropdownNeeded(result)}
          <div class="column is-narrow" role="button" tabindex="0" on:click={() => handleDropdownActivation(idx)} on:keypress={() => handleDropdownActivation(idx)}>
            {#if options == idx}
              <FontAwesomeIcon icon={faAngleUp} class="icon" aria-haspopup="true" aria-controls="dropdown-menu"/>
            {:else}
              <FontAwesomeIcon icon={faAngleDown} class="icon" aria-haspopup="true" aria-controls="dropdown-menu"/>
            {/if}
          </div>
          {/if}
        </div>
        {#if options == idx}
            <div class="list is-hoverable">
              <div class="list-item">
                <a href="{null}" class="dropdown-item" on:click={playTrackSingle(result.uri)}>
                  <FontAwesomeIcon icon={faPlayCircle} class="icon is-small"/>&nbsp;
                    Play now
                </a>
              </div>
              <div class="list-item">
                <a href="{null}" class="dropdown-item" on:click={addTrackNext(result.uri)}>
                  <FontAwesomeIcon icon={faArrowRight} class="icon is-small"/>&nbsp;
                    Play next
                </a>
              </div>
              <div class="list-item">
                <a href="{null}" class="dropdown-item" on:click={addTrackQueue(result.uri)}>
                  <FontAwesomeIcon icon={faLevelDownAlt} class="icon is-small"/>&nbsp;
                    Add to queue
                </a>
              </div>
            </div>
        {/if}
      </a>
    {:else}
      <a href={null} class="list-item">
        no results
      </a>
    {/each}
  </div>
{/if}

<script>
  import { onMount } from 'svelte';
  import { mopidy } from '../../lib/tools/stores';
  import { clickOutside } from '../../lib/tools/clickOutside';
  import { loadUris, playTrackSingle, addTrackNext, addTrackQueue, addTracksQueue, shufflePlayAllTracks, playAllTracks } from '../../lib/tools/mopidyTools';
  import FontAwesomeIcon from '../../lib/components/FontAwesomeIcon.svelte';
  import {
    faSpinner,
    faAngleDown,
    faAngleUp,
    faPlayCircle,
    faArrowRight,
    faLevelDownAlt,
    faRandom
  } from '@fortawesome/free-solid-svg-icons';

  let browsePath = [];
  let results = [];
  let promise;
  let options;
  let showOptions = false;
  let mopidyConnectionStatus;

  onMount(async () => {
    results = await loadUris()
  })

  const browserUri = async (result, idx, location) => {
    if (['directory', 'artist', 'album', 'playlist'].indexOf(result.type) > -1) {
      options = null

      // First try to use browse; only if this does not return results, resort
      // to lookup.
      const browse_response = await $mopidy.library.browse({uri: result.uri})
      if (browse_response.length == 0) {
        const lookup_response = await $mopidy.library.lookup({uris: [result.uri]})
        results = lookup_response[result.uri]
      } else {
        results = browse_response
      }

      if (location === 'back') {
        const idxResult = browsePath.indexOf(result)
        const newPath = browsePath.slice(0, idxResult + 1)
        browsePath = newPath
      } else if (location === 'avance') {
        browsePath = [...browsePath, result];
      }
    } else if (result.type === 'track' || result.__model__ === 'Track') {
      handleDropdownActivation(idx)
    }
  }

  const checkOverallDropdownNeeded = (result) => {
    return ['track'].indexOf(result.type) > -1
      || (result.__model__ === 'Track')
      || (result.type === 'directory' && result.uri.indexOf('file://') > -1)
  }

  const checkItemDropdownNeeded = (result) => {
    return (['album', 'track', 'artist', 'playlist'].indexOf(result.type) > -1)
      || (result.__model__ === 'Track')
  }

  const handleDropdownActivation = (idx) => {
    if (options == idx) {
      options = null
    } else {
      options = idx
    }
  }

  const goToRoot = async () => {
    results = await $mopidy.library.browse({uri: null})
    browsePath = [];
  }

  const getRecursiveTracks = async (result) => {
    if (result.type === 'track' || result.__model__ === 'Track') {
      return result.uri
    } else if (result.type === 'directory' && result.uri.indexOf('file://') > -1) {
      const tempResults = await $mopidy.library.browse({uri: result.uri});
      const tempRecursive = await Promise.all(tempResults.map((tempResult) => {
        return getRecursiveTracks(tempResult)
      }))
      return tempRecursive.flat(1)
    }
  }

  const _playAllTracks = async (results) => {
    const recursiveTracks = await Promise.all(results.map((result) => {
      return getRecursiveTracks(result)
    }))
    playAllTracks(recursiveTracks.flat(1))
    showOptions = false
  }

  const _shufflePlayAllTracks = async (results) => {
    const recursiveTracks = await Promise.all(results.map((result) => {
      return getRecursiveTracks(result)
    }))
    shufflePlayAllTracks(null, recursiveTracks.flat(1))
    showOptions = false
  }

  const _addTracksQueue = async (results) => {
    const recursiveTracks = await Promise.all(results.map((result) => {
      return getRecursiveTracks(result)
    }))
    addTracksQueue(null, recursiveTracks.flat(1))
  }
  
</script>

<style>
  .breadcrumb {
    font-size: 1rem;
    white-space: nowrap;
    margin-bottom: 1.5rem;
  }

  .breadcrumb a {
    align-items: center;
    display: flex;
    justify-content: center;
    padding: 0 0.75em;
  }

  .breadcrumb a:hover {
    color: #363636;
  }

  .breadcrumb li {
    align-items: center;
    display: flex;
  }

  .breadcrumb li:first-child a {
    padding-left: 0;
  }

  .breadcrumb li.is-active a {
    color: #363636;
    cursor: default;
    pointer-events: none;
  }

  .breadcrumb li + li::before {
    color: #b5b5b5;
    content: "\0002f";
  }

  .breadcrumb ul {
    align-items: flex-start;
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
  }

</style>
