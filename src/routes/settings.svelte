<h1 class="title">Settings</h1>

<br>
<h2 class="subtitle">Snapcast server</h2>
<div class="columns is-multiline">
  <div class="column is-12-mobile is-6-desktop">
    <p>
      Hostname: 
    </p>
    <input class="input is-rounded"
           type="text" 
           bind:value="{snapcastHost}" 
           placeholder="host:port">

  </div>
  <div class="column is-12-mobile is-6-desktop">
    <p>
      Port: 
    </p>
    <input class="input is-rounded"
           type="text" 
           bind:value="{snapcastPort}" 
           placeholder="host:port">
  </div>
  <div class="column is-6-mobile is-3-desktop">
    <a class="button" href="{null}" on:click={handleClick}>Connect</a>
    {#if connecting}
      <FontAwesomeIcon icon={faSpinner} spin={true} class="icon"/>
    {/if}
  </div>
</div>

<script>
  import { connectSnapcast } from '../tools/snapcast';
  import FontAwesomeIcon from '../components/FontAwesomeIcon.svelte'
  import {
    faSpinner
  } from '@fortawesome/free-solid-svg-icons';
  let snapcastHost = window.location.hostname
  let snapcastPort = '1780'
  let connecting;

  const handleClick = async () => {
    connecting = true;
    await connectSnapcast({host: snapcastHost, port: snapcastPort})
    connecting = false;
  }
  
</script>
