<svelte:head>
	<title>Search</title>
  <style src="../scss/global.scss"></style>
</svelte:head>

<h1 class="title">Search</h1>

<div class="columns is-mobile">
  <div class="column">
    <input class="input is-rounded" type="text" placeholder="Rounded input" bind:value={searchTerm}>
  </div>
  <div class="column is-narrow">
    <button on:click={handleSearch} class="button">
      Go
    </button>
  </div>
</div>

{#if promise}
{#await promise}
  <p>...waiting</p>
{:then tracks}
  <div class="list is-hoverable">
  {#each tracks as track}
    <a class="list-item" href="{null}">{track.artists.pop().name} - {track.name}</a>
  {/each}
  </div>
{:catch error}
  <p style="color: red">{error.message}</p>
{/await}
{/if}

<script>
  import { mopidy } from '../tools/stores';

  let searchTerm = "maluma"
  let promise

  async function searchFunction() {
    if ($mopidy) {
      const res = await $mopidy.library.search({'query': {'any': [searchTerm]}, 'uris': ['local:']})
      let text = res.pop().tracks
      console.log(text);
      if (res) {
        return text;
      } else {
        throw new Error(text);
      }
    }
  }

  function handleSearch() {
    promise = searchFunction()
  }
  
</script>
