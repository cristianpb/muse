<DeletePlaylist deletePlaylistConfirmation={deletePlaylistConfirmation} selectedPlaylist={data.selectedPlaylist} />
<div class="columns">
  <div class="column">
    {#if albumImage}
      <div class="card-image has-text-centered">
        <figure class="image">
          <img src="{albumImage}" width="240" height="240" alt="Album">
        </figure>
      </div>
    {:else}
      <div class="card-image has-text-centered">
        <figure class="image is-1by1">
          <img src="{base}/icon.svg" alt="Placeholder" width="240" height="240">
        </figure>
      </div>
    {/if}
  </div>
  <div class="column">
    <h1 class="title">{data.slug.replace('-',' ')}</h1>
    <p>{playlistsTracks.tracks.length} songs</p>
    <p>Last modified: {getFormatedTime(playlistsTracks.last_modified)}</p>
  </div>
  <div class="column is-narrow" >
    <div class="columns is-mobile">
      <div class="column">
        <a class="button" href="{base}/playlists">
          <FontAwesomeIcon icon={faArrowLeft} class="icon"/>
        </a>
      </div>
      <div class="column">
        <a href="{null}" class="button"  on:click={handleClickSave}>
          <FontAwesomeIcon icon={faSave} class="icon"/>
        </a>
      </div>
      <div class="column">
        <div class="dropdown is-right" class:is-active={showOptions} >
          <div class="dropdown-trigger"  role="button" tabindex="0" on:click={() => showOptions = !showOptions} on:keypress={() => showOptions = !showOptions}>
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
              <a href="{null}" class="dropdown-item" on:click={playPlaylist(data.selectedPlaylist.uri)}>
                <FontAwesomeIcon icon={faPlayCircle} class="icon is-small"/>&nbsp;&nbsp;
                  Play now
              </a>
              <a href="{null}" class="dropdown-item" on:click={shufflePlaylist(data.selectedPlaylist.uri)}>
                <FontAwesomeIcon icon={faRandom} class="icon is-small"/>&nbsp;&nbsp;
                  Play shuffle
              </a>
              <a href="{null}" class="dropdown-item" on:click={addToQueuePlaylists(data.selectedPlaylist.uri)}>
                <FontAwesomeIcon icon={faLevelDownAlt} class="icon is-small"/>&nbsp;&nbsp;
                  Add to queue
              </a>
              <a  href="{null}" class="dropdown-item" on:click={() => deletePlaylistConfirmation = !deletePlaylistConfirmation}>
                <FontAwesomeIcon icon={faMinus} class="icon is-small"/>&nbsp;&nbsp;
                  Delete playlist
              </a>
            </div>
          </div>
        </div>


      </div>
      {#if savePlaylistPromise}
        {#await savePlaylistPromise}
          <div class="column">
            <a href="{null}" class="button" >
              <FontAwesomeIcon icon={faSpinner} spin={true} class="icon"/>
            </a>
          </div>
        {:then res}
          {#if res}
            <div class="column">
              <a href="{null}" class="button" >
                <FontAwesomeIcon icon={faCheck} class="icon"/>
              </a>
            </div>
          {:else}
            Error
          {/if}
        {:catch error}
          {error.message}
        {/await}
      {/if}
    </div>
  </div>
</div>

<div use:clickOutside on:click_outside={() => dropdownActivate = null} class="list is-hoverable">
  {#await promise}
    <p class="list-item">
      <FontAwesomeIcon icon={faSpinner} class="icon is-24" spin={true}/>
      Loading songs ..
    </p>
  {:then _}
  {#if playlistsTracks.tracks}
    {#each playlistsTracks.tracks as track, index (getKey(track)) }
      <a class="list-item" 
         href="{null}" 
         draggable={true} 
         on:dragstart={event => dragstart(event, index)}
         on:drop|preventDefault={event => drop(event, index)}
         ondragover="return false"
         on:dragenter={() => hovering = index}
         class:is-active={hovering === index}
         animate:flip
         >
         <div class="columns is-mobile">
           <div class="column" role="button" tabindex="0" on:click={handleDropdownActivation(index)} on:keypress={handleDropdownActivation(index)}>
             {#if track.artists}
               {track.artists.map(x => x.name).join(", ")} - {track.name}
             {:else}
               {track.name}
             {/if}
           </div>
           <div class="column is-narrow">
             <div class="dropdown is-right is-up" class:is-active={dropdownActivate == index} >
               <div class="dropdown-trigger" role="button" tabindex="0" on:click={handleDropdownActivation(index)} on:keypress={handleDropdownActivation(index)}>
               {#if track.artists}
                 <span class="is-hidden-touch">{formatLength(track.length / 1000)}</span>
               {/if}
               {#if dropdownActivate == index}
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
                   <a  href="{null}" class="dropdown-item" on:click={addTrackNext(track.uri)}>
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
    <a href="{null}" class="list-item" >loading songs</a>
  {/each}
  {:else}
    <a href="{null}" class="list-item" >No tracks</a>
  {/if}
  {:catch error}
    <p class="list-item" style="color: red">{error.message}</p>
  {/await}
</div>

<script>
  import { onMount } from 'svelte';
  import { mopidy } from '../../../lib/tools/stores';
  import { clickOutside } from '../../../lib/tools/clickOutside';
  import { flip } from 'svelte/animate';
  import { base } from '$app/paths';
  import DeletePlaylist from '../../../lib/components/DeletePlaylist.svelte';
  import { playTrackSingle, addTrackNext, addTrackQueue, playPlaylist, shufflePlaylist, addToQueuePlaylists, loadAlbumImage, getTrackInfo, getPlaylistTracks } from '../../../lib/tools/mopidyTools';
  import FontAwesomeIcon from '../../../lib/components/FontAwesomeIcon.svelte'
  import {
    faArrowLeft,
    faArrowRight,
    faLevelDownAlt,
    faAngleDown,
    faAngleUp,
    faPlayCircle,
    faSpinner,
    faCheck,
    faMinus,
    faSave,
    faRandom
  } from '@fortawesome/free-solid-svg-icons';

	/** @type {import('./$types').PageData} */
	export let data;

  let deletePlaylistConfirmation = false;
  let showOptions = false;
  let playlistsTracks = {tracks: [], last_modified: undefined};
  //let selectedPlaylist;
  let savePlaylistPromise;
  let hovering = false;
  let key;
  let dropdownActivate;
  const getKey = item => (key ? item[key] : item);
  let promise
  let albumImage;

  onMount(() => {
    asyncLoadTracks(data.selectedPlaylist.uri)
  })


  const asyncLoadTracks = async (playlistUri) => {
    playlistsTracks = await getPlaylistTracks(playlistUri);
    await asyncloadAlbumImage(playlistsTracks.tracks)
    await addTracksInfo(playlistsTracks.tracks)
  }

  const asyncloadAlbumImage = async (tracks) => {
    let idx = 0
    // try to get album from 5 tracks
    while ((idx < 5) & !(albumImage)) {
      const trackInfo = await getTrackInfo(tracks[idx].uri)
      albumImage = await loadAlbumImage(trackInfo)
      idx += 1
    }
  }

  const addTracksInfo = async (tracks) => {
    const tracksInfo = await Promise.all(tracks.map((track) => {
      return getTrackInfo(track.uri)
    }))
    playlistsTracks.tracks = tracksInfo
  }

  function drop(event, i) {
		event.dataTransfer.dropEffect = 'move';
    let target = event.dataTransfer.getData("text/plain");
    let newPlaylist = playlistsTracks.tracks
    newPlaylist[i] = newPlaylist.splice(target, 1, newPlaylist[i])[0];
    playlistsTracks.tracks = newPlaylist
    hovering = null
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

  const handleDropdownActivation = (index) => {
    if (dropdownActivate === index) {
      dropdownActivate = null
    } else {
      dropdownActivate = index
    }
  }

  const getFormatedTime = (unixTime) => {
    const date = new Date(unixTime);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = "20" + `${date.getYear()}`.substring(1);
    const hours = date.getHours();
    const minutes = date.getMinutes() < 10 ? `0${date.getMinutes()}`.substring(-2) : `${date.getMinutes()}`.substring(-2)
    return `${day}-${month}-${year} ${hours}:${minutes}`;
  }

  const formatLength = (length) => {
    const seconds = Math.round(length%60) < 10 ? `0${Math.round(length%60)}` : `${Math.round(length%60)}`
    return `${Math.floor(length / 60)}:${seconds}`
  }

</script>
