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
  <div class="column is-12-mobile is-6-desktop">
    <a class="button" href="{null}" on:click={handleClick}>Connect</a>
    {#if connecting}
      <button class="button">
        <FontAwesomeIcon icon={faSpinner} spin={true} class="icon"/>
      </button>
    {/if}
    {#if error}
      <button class="button is-danger" disabled>
        {error}
      </button>
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
  let error;

  const handleClick = async () => {
    connecting = true;
    try {
      await connectSnapcast({host: snapcastHost, port: snapcastPort})
      error = null;
    } catch(e) {
      error = "Error connecting"
    }
    connecting = false;
  }
  
</script>

<style>

  .input {
    -moz-appearance: none;
    -webkit-appearance: none;
    align-items: center;
    border: 1px solid transparent;
    border-radius: 4px;
    box-shadow: none;
    display: inline-flex;
    font-size: 1rem;
    height: 2.5em;
    justify-content: flex-start;
    line-height: 1.5;
    padding-bottom: calc(0.5em - 1px);
    padding-left: calc(0.75em - 1px);
    padding-right: calc(0.75em - 1px);
    padding-top: calc(0.5em - 1px);
    position: relative;
    vertical-align: top;
  }

  .input.is-rounded {
    border-radius: 290486px;
    padding-left: calc(calc(0.75em - 1px) + 0.375em);
    padding-right: calc(calc(0.75em - 1px) + 0.375em);
  }

  .input {
    background-color: white;
    border-color: #dbdbdb;
    border-radius: 4px;
    color: #363636;
  }

  .input::-moz-placeholder {
    color: rgba(54, 54, 54, 0.3);
  }

  .input::-webkit-input-placeholder {
    color: rgba(54, 54, 54, 0.3);
  }

  .input:-moz-placeholder {
    color: rgba(54, 54, 54, 0.3);
  }

  .input:-ms-input-placeholder {
    color: rgba(54, 54, 54, 0.3);
  }

  .input:hover {
    border-color: #b5b5b5;
  }

  .input:focus {
    border-color: #3273dc;
    box-shadow: 0 0 0 0.125em rgba(50, 115, 220, 0.25);
  }

  .input {
    box-shadow: inset 0 0.0625em 0.125em rgba(10, 10, 10, 0.05);
    max-width: 100%;
    width: 100%;
  }
</style>
