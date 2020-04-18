<h1 class="title">Playlists</h1>

<div class="list is-hoverable">
  {#each playlists as playlist}
    <a class="list-item" href="{null}">{playlist.name}</a>
  {:else}
    <p>loading playlits</p>
  {/each}
</div>

<script>

  import { mopidy } from '../tools/stores';
  import { connectWS } from '../tools/mopidyTools';
  import { onMount } from 'svelte';

  let playlists = []

  onMount(async () => {
    $mopidy = await connectWS()
    getPlaylists()
  })

  async function getPlaylists() {
    playlists = await $mopidy.playlists.asList()
    console.log(playlists);
  }

  
</script>
