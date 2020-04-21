<svelte:head>
  <title>Search</title>
  <style src="../scss/global.scss"></style>
</svelte:head>

<h1 class="title">Search</h1>

<div class="columns">
  <div class="column">
    <input class="input is-rounded" type="text" placeholder="Rounded input" on:input|preventDefault={handleSearch} bind:value={searchTerm}>
  </div>
  <div class="column is-narrow">
    <div class="columns is-mobile">
      <div class="column">
        <div class:is-active={dropMenuActive} class="dropdown">
          <div class="dropdown-trigger"  on:click={toggleDropmenu}>
            <button class="button" aria-haspopup="true" aria-controls="dropdown-menu-sources">
              <span>Sources</span>
              <span class="icon is-small">
                <i class="fas fa-angle-down" aria-hidden="true"></i>
              </span>
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
        <button on:click={handleSearch} class="button">
          <FontAwesomeIcon icon={faSearch} class="icon"/>
        </button>
      </div>
    </div>
  </div>
</div>

{#if promise}
{#await promise}
  <p>...waiting</p>
{:then tracks}
  {#if tracks}
  <div class="list is-hoverable">
  {#each tracks as track}
    <a class="list-item" href="{null}">{track.artists.pop().name} - {track.name}</a>
  {:else}
    <a class="list-item" href="{null}">loading..</a>
  {/each}
  </div>
  {:else}
    <a class="list-item" href="{null}">no tracks found</a>
  {/if}
{:catch error}
  <p style="color: red">{error.message}</p>
{/await}
{/if}

<script>
  import { connectWS } from '../tools/mopidyTools';
  import { mopidy } from '../tools/stores';
  import { onMount } from 'svelte';
  import FontAwesomeIcon from '../components/FontAwesomeIcon.svelte'
  import {
    faSearch,
  } from '@fortawesome/free-solid-svg-icons';

  let searchTerm = "maluma"
  let dropMenuActive = false
  let selectedUris = ['local']
  let hideUris = ['http', 'https', 'mms', 'rtmp', 'rtmps', 'rtsp', 'file']
  let uris = []
  let promise

  onMount(async () => {
    $mopidy = await connectWS()
    const urisResult = await $mopidy.getUriSchemes()
    if (urisResult) {
      uris = urisResult.filter(x => hideUris.indexOf(x) === -1)
    }
  })

  async function searchFunction() {
    const urisRequest = selectedUris.map(x => x + ':')
    const res = await $mopidy.library.search({'query': {'any': [searchTerm]}, 'uris': [`${urisRequest}`]})
    if (res && res.length > 0) {
      let text = res.pop().tracks
      return text;
    } else {
      throw new Error('what', res);
    }
  }

  function handleSearch() {
    setTimeout(() => { promise = searchFunction() }, 100)
  }

  function toggleDropmenu() {
    dropMenuActive = !dropMenuActive
  }
  
</script>
