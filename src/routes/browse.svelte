<svelte:head>
  <title>Browse</title>
</svelte:head>

<h1 class="title">Browse
</h1>
            
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

{#if promise}
  <div class="list is-hoverable">
    {#await promise}
      <p class="list-item">
        <FontAwesomeIcon icon={faSpinner} class="icon is-24" spin={true}/>
      </p>
    {:catch error}
      <p class="list-item" style="color: red">{error.message}</p>
    {/await}
  </div>
{/if}

{#if results.length > 0}
  <div class="list is-hoverable">
    {#each results as result, idx}
      <a href={null} class="list-item" >
        <div class="columns is-mobile">
          <div class="column" on:click={() => promise = browserUri(result, idx, 'avance')}>
        {result.name}
          </div>
          <div class="column is-narrow" on:click={() => handleDropdownActivation(idx)}>
            {#if options == idx}
              <FontAwesomeIcon icon={faAngleUp} class="icon" aria-haspopup="true" aria-controls="dropdown-menu"/>
            {:else}
              <FontAwesomeIcon icon={faAngleDown} class="icon" aria-haspopup="true" aria-controls="dropdown-menu"/>
            {/if}
          </div>
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
  import { mopidy } from '../tools/stores';
  import { connectWS, playTrackSingle, addTrackNext, addTrackQueue  } from '../tools/mopidyTools';
  import FontAwesomeIcon from '../components/FontAwesomeIcon.svelte';
  import {
    faSpinner,
    faAngleDown,
    faAngleUp,
    faPlayCircle,
    faArrowRight,
    faLevelDownAlt
  } from '@fortawesome/free-solid-svg-icons';

  let browsePath = [];
  let results = [];
  let promise;
  let options;

  onMount(async () => {
    $mopidy = await connectWS()
    results = await $mopidy.library.browse({uri: null})
  })

  const browserUri = async (result, idx, location) => {
    if (['directory', 'artist', 'album'].indexOf(result.type) > -1) {
      results = await $mopidy.library.browse({uri: result.uri});
      if (location === 'back') {
        browsePath = [result];
      } else if (location === 'avance') {
        browsePath = [...browsePath, result];
      }
    } else if (result.type === 'track') {
      handleDropdownActivation(idx)
    }
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

  .breadcrumb.has-arrow-separator li + li::before {
    content: "\02192";
  }

  .breadcrumb.has-bullet-separator li + li::before {
    content: "\02022";
  }

  .breadcrumb.has-dot-separator li + li::before {
    content: "\000b7";
  }

  .breadcrumb.has-succeeds-separator li + li::before {
    content: "\0227B";
  }

</style>
