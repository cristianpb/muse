<EditClients />

{#if $snapClientsVisibility}
  <div class="notification is-primary" id="notification">
    <a href="{null}" on:click={() => $snapClientsVisibility = !$snapClientsVisibility}>
      <FontAwesomeIcon icon={faTimesCircle} class="icon"/>
    </a>
    <a href="{null}" on:click={() => $snapClientsEditVisibility = !$snapClientsEditVisibility} class="to-the-right">
      <FontAwesomeIcon icon={faEdit} class="icon"/>
    </a>
    {#each $snapGroups as group}
      <header class="card-header">
        <div class="card-header-title is-centered">
          <a class="navbar-item" href="{null}" on:click={muteGroup(group.id, group.muted)}>
            {#if group.muted}
              <FontAwesomeIcon icon={faVolumeMute} class="icon"/>
            {:else}
              <FontAwesomeIcon icon={faVolumeUp} class="icon"/>
            {/if}
          </a>
          <p class="expand-on-hover">
            Group: {group.name ? group.name : group.id}
          </p>
        </div>
      </header>
    {#each group.clients as client, idx}
      <div class="columns is-mobile oneline">
        <div class="column is-narrow">
          <div class="navbar-item expand-on-hover-name">
            {group.clients[idx].name ? client.name : client.host}
          </div>
        </div>
        {#if client.connected}
          <div class="column is-narrow" on:click={muteClient(client.id, client.muted)} on:keypress={muteClient(client.id, client.muted)}>
            <a class="navbar-item" href="{null}">
              {#if client.muted}
                <FontAwesomeIcon icon={faVolumeMute} class="icon"/>
              {:else}
                <FontAwesomeIcon icon={faVolumeUp} class="icon"/>
              {/if}
            </a>
          </div>
          <div class="column">
            <div
              title="Volume: {client.volume}"
              data-toggle="tooltip"
              class="navbar-item">
            <input 
              type="range"
              min="0" 
              max="100" 
              bind:value="{group.clients[idx].volume}" 
              on:change="{changeHandler(group.clients[idx].id, group.clients[idx].volume)}"
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
  import { snapGroups, snapClientsVisibility, snapClientsEditVisibility } from '../tools/stores';
  import FontAwesomeIcon from '../components/FontAwesomeIcon.svelte'
  import {
    faVolumeUp,
    faVolumeMute,
    faTimesCircle,
    faEdit
  } from '@fortawesome/free-solid-svg-icons';
  import { muteGroup, muteClient, changeHandler } from '../tools/snapcast';
  import EditClients from './EditClients.svelte';

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


  .expand-on-hover {
    display: inline-block;
    position: relative;
    width: 200px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 2px 5px;
  }

  .expand-on-hover-name {
    display: inline-block;
    position: relative;
    width: 80px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 2px 5px;
  }

  .expand-on-hover:hover, .expand-on-hover-name:hover {
    z-index: 1;
    width: auto;
    background-color: #FFFFCC;
  }

  .to-the-right {
    right: 1rem;
    position: absolute;
  }

</style>
