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
    {#each browsePath as pathElement}
      <li>
        <a href="{null}" on:click={browserUri(pathElement, 'back')}>
        {pathElement.name}
        </a>
      </li>
    {/each}
  </ul>
</nav>

{#if results.length > 0}
  <div class="list is-hoverable">
    {#each results as result}
      <a href={null} class="list-item" on:click={browserUri(result, 'avance')}>
        {result.name}
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
  import { connectWS } from '../tools/mopidyTools';
  import FontAwesomeIcon from '../components/FontAwesomeIcon.svelte';
  import {
    faSpinner
  } from '@fortawesome/free-solid-svg-icons';

  let browsePath = [];
  let results = [];
  let waitSearch = true;

  onMount(async () => {
    $mopidy = await connectWS()
    results = await $mopidy.library.browse({uri: null})
    waitSearch = false;
  })

  const browserUri = async (result, position) => {
    waitSearch = true;
    console.log(result);
    results = await $mopidy.library.browse({uri: result.uri});
    console.log(results);
    waitSearch = false;
    if (position === 'back') {
      browsePath = [result];
    } else if (position === 'avance') {
      browsePath = [...browsePath, result];
    }
  }

  const goToRoot = async () => {
    waitSearch = true;
    results = await $mopidy.library.browse({uri: null})
    waitSearch = false;
    browsePath = [];
  }
  
</script>
