<script>
  import { onMount } from 'svelte';
  import Nav from './Nav.svelte';
  import NavBottom from '../lib/components/NavBottom.svelte';
  import SnapClients from '../lib/components/SnapClients.svelte';
  import { connectSnapcast } from '../lib/tools/snapcast';
  import { connectWS } from '../lib/tools/mopidyTools';
	import '../global.css';

  export let segment;

  onMount(() => {
    connectWS()
    connectSnapcast()
  })
</script>

<style>
  main {
    position: relative;
    max-width: 56em;
    background-color: white;
    padding: 2em;
    padding-bottom: 100px; 
    margin: 0 auto;
    box-sizing: border-box;
  }
</style>

<Nav {segment}/>

<main>
  <slot></slot>
  <SnapClients/>
</main>

<NavBottom/>
