{#if $snapClientsVisibility}
  <div class="notification is-primary" id="notification">
    <a href="{null}" on:click={() => $snapClientsVisibility = !$snapClientsVisibility}>
      <FontAwesomeIcon icon={faTimesCircle} class="icon"/>
    </a>
    {#each $snapGroups as group}
      <header class="card-header">
        <p class="card-header-title is-centered">
          Group: {group.name ? group.name : group.id.substring(0,6)} &nbsp;&nbsp;
          <a class="navbar-item" href="{null}" on:click={muteGroup(group.id, group.muted)}>
            {#if group.muted}
              <FontAwesomeIcon icon={faVolumeMute} class="icon"/>
            {:else}
              <FontAwesomeIcon icon={faVolumeUp} class="icon"/>
            {/if}
          </a>
        </p>
      </header>
    {#each group.clients as client}
      <div class="columns is-mobile oneline">
        <div class="column is-narrow">
          <div class="navbar-item">
            {client.name}
          </div>
        </div>
        {#if client.connected}
          <div class="column is-narrow" on:click={muteClient(client.id, client.muted)}>
            <a class="navbar-item" href="{null}">
              {#if client.muted}
                <FontAwesomeIcon icon={faVolumeMute} class="icon"/>
              {:else}
                <FontAwesomeIcon icon={faVolumeUp} class="icon"/>
              {/if}
            </a>
          </div>
          <div class="column">
            <div class="navbar-item">
            <input 
              type="range"
              min="0" 
              max="100" 
              bind:value="{client.volume}" 
              on:change="{changeHandler(client.id, client.volume)}"
              class="slider">
            </div>
          </div>
        {:else}
          <div class="column">
            disconnected
          </div>
        {/if}
      </div>
    {/each}
    {/each}
  </div>
{/if}

<script charset="utf-8">
  import { onMount } from 'svelte';
  import { snapGroups, snapClientsVisibility, snapcast } from '../tools/stores';
  import FontAwesomeIcon from '../components/FontAwesomeIcon.svelte'
  import {
    faVolumeUp,
    faVolumeMute,
    faTimesCircle
  } from '@fortawesome/free-solid-svg-icons';
  import { muteGroup, muteClient, changeHandler } from '../tools/snapcast';

</script>

<style type="text/css" media="screen">
  .notification {
    bottom: 5rem;
    right: 1rem;
    position: fixed;
    width: 300px;
    background: #EFF0EB;
    padding: 1rem;
  }

  .slider {
    -webkit-appearance: none;
    width: 100%;
    height: 5px;
    border-radius: 5px;
    background: #d3d3d3;
    outline: none;
    opacity: 0.7;
    -webkit-transition: .2s;
    transition: opacity .2s;
  }

  .slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 25px;
    height: 25px;
    border-radius: 10%; 
    background: #DA9C20;
    cursor: pointer;
  }

  .slider::-moz-range-thumb {
    width: 25px;
    height: 25px;
    border-radius: 50%;
    background: #DA9C20;
    cursor: pointer;
  }

  .card-header {
    background-color: transparent;
    align-items: stretch;
    box-shadow: 0 0.125em 0.25em rgba(10, 10, 10, 0.1);
    display: flex;
  }

  .card-header-title {
    align-items: center;
    color: #363636;
    display: flex;
    flex-grow: 1;
    font-weight: 700;
    padding: 0;
  }

  .card-header-title.is-centered {
    justify-content: center;
  }

  .oneline {
    align-items: center;
    margin-left: 0;
    margin-right: 0;
    margin-top: 0;
  }

  .columns.oneline > .column {
    margin: 0;
    padding: 0 !important;
  }

  .columns.oneline:not(:last-child) {
    margin-bottom: 0;
  }

</style>
