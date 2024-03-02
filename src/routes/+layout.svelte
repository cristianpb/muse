<script>
  import { onMount } from 'svelte';
  import Nav from './Nav.svelte';
  import NavBottom from '../lib/components/NavBottom.svelte';
  import SnapClients from '../lib/components/SnapClients.svelte';
  import { snapcastHost, snapcastPort, snapcastSSL } from '../lib/tools/stores';
  import { connectSnapcast } from '../lib/tools/snapcast';
  import { connectWS } from '../lib/tools/mopidyTools';
	import '../global.css';

  export let segment;
  let config;

  onMount(async () => {
    connectWS()
    const res = await fetch('/muse/config')
    if (res.status === 200) {
      config = await res.json()
    }
    $snapcastHost = config && config.snapcast && config.snapcast.host ? config.snapcast.host : $snapcastHost ? $snapcastHost : document.defaultView.location.hostname;
    $snapcastPort = config && config.snapcast && config.snapcast.port ? config.snapcast.port : $snapcastPort ? $snapcastPort : 1780;
    $snapcastSSL = config && config.snapcast && config.snapcast.ssl ? Boolean(config.snapcast.ssl).toString() : $snapcastSSL ? $snapcastSSL : document.defaultView.location.protocol === 'https:' ? 'true' : 'false';
    try {
      await connectSnapcast()
    } catch(e) {
      console.log('[Snapcast]: catch error:', e);
    }
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
