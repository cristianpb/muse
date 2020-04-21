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
        <div class:is-active={dropMenuActive} class="dropdown  is-hoverable">
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
        {#each tracks as track, i}
          <a class="list-item" href="{null}">
            <div class="columns is-mobile">
              <div class="column">
                {#if track.artists}
                {track.artists.map(x => x.name).join(', ')} - {track.name}
                {:else}
                  unknown artist
                {/if}
              </div>
              <div class="column is-narrow">
                <div class:is-active={track.visibility} class="dropdown is-right" >
                  <div class="dropdown-trigger" on:click={() => track.visibility = !track.visibility}>
                    <button class="button" aria-haspopup="true" aria-controls="dropdown-menu">
                      <FontAwesomeIcon icon={faAngleDown} class="icon"/>
                    </button>
                  </div>
                  <div class="dropdown-menu" id="dropdown-menu" role="menu">
                    <div class="dropdown-content">
                      <a href="{null}" class="dropdown-item" on:click={playTrackSingle(track.uri)}>
                        Play now
                      </a>
                      <a href={null} class="dropdown-item" on:click={addTrackNext(track.uri)}>
                        Play next
                      </a>
                      <a href="{null}" class="dropdown-item" on:click={addTrackQueue(track.uri)}>
                        Add to queue
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </a>
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
    faPlayCircle,
    faAngleDown
  } from '@fortawesome/free-solid-svg-icons';

  let searchTerm = "file"
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
      let { tracks } = res.pop()
      return tracks.map(obj=> ({ ...obj, visibility: false }))
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

  function playTrackSingle(uri) {
    $mopidy.tracklist.clear()
    $mopidy.tracklist.add({uris:[uri]})
    $mopidy.playback.play()
  }

  async function addTrackNext(uri) {
    const index = await $mopidy.tracklist.index()
    $mopidy.tracklist.add({at_position: index + 1, uris:[uri]})
  }

  async function addTrackQueue(uri) {
    $mopidy.tracklist.add({uris:[uri]})
  }

</script>
