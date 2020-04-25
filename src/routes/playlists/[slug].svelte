<div class="columns is-mobile">
  <div class="column">
    <h1 class="title">{slug.replace('-',' ')}</h1>
  </div>
  <div class="column is-narrow">
    <a class="button" href="playlists">
      <FontAwesomeIcon icon={faArrowLeft} class="icon"/>
    </a>
  </div>
  <div class="column is-narrow">
    <a class="button" href="{null}" on:click={handleClickSave}>
      Save
    </a>
    {#if savePlaylistPromise}
      {#await savePlaylistPromise}
        <a class="button" href="{null}">
          <FontAwesomeIcon icon={faSpinner} spin={true} class="icon"/>
        </a>
      {:then res}
        {#if res}
          <a class="button" href="{null}">
            <FontAwesomeIcon icon={faCheck} class="icon"/>
          </a>
        {:else}
          Error
        {/if}
      {:catch error}
        {error.message}
      {/await}
    {/if}
  </div>
</div>

<div class="list is-hoverable"
     
  >
  {#if playlistsTracks.tracks}
    {#each playlistsTracks.tracks as track, i}
      <a class="list-item" 
         href="{null}" 
         draggable={true} 
         on:dragstart={event => dragstart(event, i)}
         on:drop|preventDefault={event => drop(event, i)}
         ondragover="return false"
         >
         <div class="columns is-mobile">
           <div class="column" on:click={() => track.visibility = !track.visibility}>
             {track.name}
           </div>
           <div class="column is-narrow">
             <div class="dropdown is-right is-up" class:is-active={track.visibility} >
               <div class="dropdown-trigger" on:click={() => track.visibility = !track.visibility}>
               {#if track.visibility}
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
                   <a href="{null}" class="dropdown-item" on:click={addTrackNext(track.uri)}>
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
    <a class="list-item" href="{null}">loading songs</a>
    {/each}
  {:else}
    <a class="list-item" href="{null}">No tracks</a>
  {/if}
</div>

<script>
  import { stores } from "@sapper/app";
  import { onMount } from 'svelte';
  import { mopidy, playlists } from '../../tools/stores';
  import { connectWS, getPlaylists, getPlaylistTracks, playTrackSingle, addTrackNext, addTrackQueue } from '../../tools/mopidyTools';
  import FontAwesomeIcon from '../../components/FontAwesomeIcon.svelte'
  import {
    faArrowLeft,
    faArrowRight,
    faLevelDownAlt,
    faAngleDown,
    faAngleUp,
    faPlayCircle,
    faSpinner,
    faCheck,
    faMinus
  } from '@fortawesome/free-solid-svg-icons';

  const { page } = stores();
  const { slug } = $page.params;

	let hovering = false;
  let playlistsTracks = []
  let savePlaylistPromise

  onMount(async() => {
    $mopidy = await connectWS()
    $playlists = await getPlaylists()
    const selectedPlaylist = $playlists.find(playlist => playlist.name === slug)
    playlistsTracks  = await getPlaylistTracks(selectedPlaylist.uri)
  })

  function drop(event, i) {
		event.dataTransfer.dropEffect = 'move';
    let target = event.dataTransfer.getData("text/plain");
    let newPlaylist = playlistsTracks.tracks
    newPlaylist[i] = newPlaylist.splice(target, 1, newPlaylist[i])[0];
    playlistsTracks.tracks = newPlaylist
  }

  function dragstart(event, i) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.dropEffect = 'move';
    let target = i;
    event.dataTransfer.setData('text/plain', target);
  }

  async function savePlaylist() {
    const res = await $mopidy.playlists.save({playlist: playlistsTracks})
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
    let newPlaylist = playlistsTracks.tracks
    newPlaylist = newPlaylist.filter(x => x.uri != uri);
    playlistsTracks.tracks = newPlaylist
  }

</script>
