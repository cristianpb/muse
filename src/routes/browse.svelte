<svelte:head>
  <title>Browse</title>
</svelte:head>

<h1 class="title">Browse
  {#if waitSearch}
    <FontAwesomeIcon icon={faSpinner} class="icon is-24" spin={true}/>
  {/if}
</h1>
            
<nav class="breadcrumb" aria-label="breadcrumbs">
  <ul>
    <li>
      <a href="{null}" on:click={goToRoot}>
      Root
      </a>
    </li>
    {#each browsePath as pathElement, idx}
      <li>
        <a href="{null}" on:click={browserUri(pathElement, idx, 'back')}>
        {pathElement.name}
        </a>
      </li>
    {/each}
  </ul>
</nav>

{#if results.length > 0}
  <div class="list is-hoverable">
    {#each results as result, idx}
          <a href={null} class="list-item" on:click={browserUri(result, idx, 'avance')}>
            <div class="columns is-mobile">
              <div class="column">
                {result.name}
              </div>
              <div class="column is-narrow">
                {#if options == idx}
                  <FontAwesomeIcon icon={faAngleUp} class="icon" aria-haspopup="true" aria-controls="dropdown-menu"/>
                {:else}
                  <FontAwesomeIcon icon={faAngleDown} class="icon" aria-haspopup="true" aria-controls="dropdown-menu"/>
                {/if}
              </div>
            </div>
            {#if options == idx}
              {#if result.type == 'track'}
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
  let waitSearch = true;
  let options;

  onMount(async () => {
    $mopidy = await connectWS()
    results = await $mopidy.library.browse({uri: null})
    waitSearch = false;
  })

  const browserUri = async (result, idx, location) => {
    if (result.type == 'directory') {
      waitSearch = true;
      results = await $mopidy.library.browse({uri: result.uri});
      waitSearch = false;
      if (location === 'back') {
        browsePath = [result];
      } else if (location === 'avance') {
        browsePath = [...browsePath, result];
      }
    } else if (result.type === 'track') {
      if (options == idx) {
        options = null
      } else {
        options = idx
      }
    }
  }

  const goToRoot = async () => {
    waitSearch = true;
    results = await $mopidy.library.browse({uri: null})
    waitSearch = false;
    browsePath = [];
  }
  
</script>
