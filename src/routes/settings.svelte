<h1 class="title">Settings</h1>

<br>
<h2 class="subtitle">Snapcast server</h2>

<div class="columns is-multiline">
  <div class="column is-12-mobile is-4-desktop">
    <div class="field">
      <label class="label">Hostname</label>
      <div class="control">
        <input class="input is-rounded"
               type="text" 
               bind:value="{snapcastHost}" 
               placeholder="Hostname">
      </div>
    </div>
  </div>

  <div class="column is-12-mobile is-4-desktop">
    <div class="field">
      <label class="label">Port</label>
      <div class="control">
        <input class="input is-rounded"
               type="text" 
               bind:value="{snapcastPort}" 
               placeholder="Port">
      </div>
    </div>
  </div>

  <div class="column is-12-mobile is-4-desktop">
    <label class="label">SSL</label>
    <div class="control">
      <div class="select">
        <select bind:value={snapcastSSL}>
          <option value="">http</option>
          <option value="1">https</option>
        </select>
      </div>
    </div>
  </div>

  <div class="column is-12-mobile is-6-desktop">
    <div class="field is-grouped is-grouped-multiline">
      <p class="control">
        <a class="button" href="{null}" on:click={() => promise = connectSnapcast({host: snapcastHost, port: snapcastPort, ssl: snapcastSSL})}>Connect</a>
      </p>
      <p class="control">
    {#if promise}
      {#await promise}
        <button class="button">
          <FontAwesomeIcon icon={faSpinner} spin={true} class="icon"/>
        </button>
      {:then _}
        <button class="button is-success" disabled>
          Connected
        </button>
      {:catch error}
        <button class="button is-danger" disabled>
          {error.message}
        </button>
      {/await}
    {/if}
      </p>
    </div>
  </div>
</div>

<script>
  import { onMount } from 'svelte';
  import { connectSnapcast } from '../tools/snapcast';
  import FontAwesomeIcon from '../components/FontAwesomeIcon.svelte'
  import {
    faSpinner
  } from '@fortawesome/free-solid-svg-icons';
  let promise;
  let snapcastHost = 'localhost'
  let snapcastPort = '1780'
  let snapcastSSL = ''

  onMount(() => {
    snapcastHost = window.location.hostname
  })

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

  .field:not(:last-child) {
    margin-bottom: 0.75rem;
  }

  .label {
    color: #363636;
    display: block;
    font-size: 1rem;
    font-weight: 700;
  }

  .label:not(:last-child) {
    margin-bottom: 0.5em;
  }

  .control {
    box-sizing: border-box;
    clear: both;
    font-size: 1rem;
    position: relative;
    text-align: left;
  }

  .select:not(.is-multiple):not(.is-loading)::after {
    border: 3px solid transparent;
    border-radius: 2px;
    border-right: 0;
    border-top: 0;
    content: " ";
    display: block;
    height: 0.625em;
    margin-top: -0.4375em;
    pointer-events: none;
    position: absolute;
    top: 50%;
    transform: rotate(-45deg);
    transform-origin: center;
    width: 0.625em;
  }

  .select select {
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

  .field.is-grouped {
    display: flex;
    justify-content: flex-start;
  }

  .field.is-grouped > .control {
    flex-shrink: 0;
  }

  .field.is-grouped > .control:not(:last-child) {
    margin-bottom: 0;
    margin-right: 0.75rem;
  }

  .field.is-grouped.is-grouped-multiline {
    flex-wrap: wrap;
  }

  .field.is-grouped.is-grouped-multiline > .control:last-child, .field.is-grouped.is-grouped-multiline > .control:not(:last-child) {
    margin-bottom: 0.75rem;
  }

  .field.is-grouped.is-grouped-multiline:last-child {
    margin-bottom: -0.75rem;
  }

  .field.is-grouped.is-grouped-multiline:not(:last-child) {
    margin-bottom: 0;
  }

</style>
