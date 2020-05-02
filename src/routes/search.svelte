<svelte:head>
  <title>Search</title>
</svelte:head>

<h1 class="title">Search</h1>

<div class="columns">
  <div class="column">
    <input class="input is-rounded" type="text" placeholder="Rounded input" on:keydown={handleSearch}>
  </div>
  <div class="column is-narrow">
    <div class="columns is-mobile">
      <div class="column">
        <div class:is-active={dropMenuActive} class="dropdown">
          <div class="dropdown-trigger"  on:click={() => dropMenuActive = !dropMenuActive}>
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

<AddToPlaylist showAddToPlaylistModal={showAddToPlaylistModal} track={selectedTrack}/>
{#if promise}
  {#await promise}
    <p>...waiting</p>
  {:then tracks}
    {#if tracks}
      <div class="list is-hoverable">
        {#each tracks as track, i}
          <a class="list-item" href="{null}">
            <div class="columns is-mobile">
              <div class="column"  on:click={() => track.visibility = !track.visibility}>
                {#if track.artists}
                {track.artists.map(x => x.name).join(', ')} - {track.name}
                {:else}
                  unknown artist
                {/if}
              </div>
              <div class="column is-narrow">
                <div class:is-active={track.visibility} class="dropdown is-right is-up" >
                  <div class="dropdown-trigger" on:click={() => track.visibility = !track.visibility}>
                  {#if track.visibility }
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
    faPlus
  } from '@fortawesome/free-solid-svg-icons';

  let dropMenuActive = false;
  let selectedUris = ['local'];
  let hideUris = ['http', 'https', 'mms', 'rtmp', 'rtmps', 'rtsp', 'file']
  let uris = [];
  let promise;
  let showAddToPlaylistModal = false;
  let selectedTrack;

  onMount(async () => {
    $mopidy = await connectWS()
    const urisResult = await $mopidy.getUriSchemes()
    if (urisResult) {
      uris = urisResult.filter(x => hideUris.indexOf(x) === -1)
    }
  })

  async function searchFunction(searchTerm) {
    const urisRequest = selectedUris.map(x => x + ':')
    const res = await $mopidy.library.search({'query': {'any': [searchTerm]}, 'uris': [`${urisRequest}`]})
    if (res && res.length > 0) {
      let { tracks } = res.pop()
      return tracks.map(obj=> ({ ...obj, visibility: false }))
    } else {
      throw new Error('what', res);
    }
  }

  function handleSearch(event) {
    if (event.which === 13) {
      setTimeout(() => { promise = searchFunction(event.target.value) }, 100)
    }
  }

  const openAddListModal = (track) => {
    delete track.visibility;
    selectedTrack = track 
    showAddToPlaylistModal = !showAddToPlaylistModal
  }

</script>
