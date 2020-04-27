{#if $snapClientsVisibility}
  <div class="notification is-primary" id="notification">
    {#each $clients as client}
      <div class="columns is-mobile">
        <div class="column is-narrow">
          {client.name}
        </div>
        {#if client.connected}
          <div class="column is-narrow" on:click={muteGroup(client.group,client.muted)}>
            {#if client.muted}
              <FontAwesomeIcon icon={faVolumeMute} class="icon"/>
            {:else}
              <FontAwesomeIcon icon={faVolumeUp} class="icon"/>
            {/if}
          </div>
          <div class="column">
            <input 
              type="range"
              min="0" 
              max="100" 
              bind:value="{client.volume}" 
              on:change="{changeHandler(client.id, client.volume)}"
              class="slider">
          </div>
        {:else}
          <div class="column">
            disconnected
          </div>
        {/if}
      </div>
    {/each}
  </div>
{/if}

<script charset="utf-8">
  import { onMount } from 'svelte';
  import { clients, snapClientsVisibility, snapcast } from '../tools/stores';
  import FontAwesomeIcon from '../components/FontAwesomeIcon.svelte'
  import {
    faVolumeUp,
    faVolumeMute
  } from '@fortawesome/free-solid-svg-icons';
  import { connectSnapcast } from '../tools/snapcast';

  onMount(async () => {
    $snapcast = await connectSnapcast()
  })

  function volumeSetSnapcast(name, volumeLevel) {
    let id = $clients.find((x)=> x.name == name) ? $clients.find((x)=> x.name == name).id : null
    if (id) {
      let message = { 
        id:8,
        jsonrpc:"2.0",
        method:"Client.SetVolume",
        params:{
          id,
          volume:{"muted":false,"percent":volumeLevel}
        }
      }
      $snapcast.send(JSON.stringify(message));
      console.log(`[Handler snapcast]: volumen set to ${name}`);
    } else {
      console.log("[Snapcast]: No client with this name");
    }
  }

  function changeHandler(id, volume) {
    console.log(`client ${id} - vol ${volume}`);
    let message = {
      id:8,
      jsonrpc:"2.0",
      method:"Client.SetVolume",
      params:{
        id,
        volume:{
        muted:false,
        percent:volume
        }
      }
    }
    $snapcast.send(JSON.stringify(message));
  }

  function muteGroup(groupId, muted) {
    console.log($clients);
    console.log(`Muted ${groupId} - ${muted}`);
    let message = {
      id:8,
      jsonrpc:"2.0",
      method:"Group.SetMute",
      params:{
        id: groupId,
        mute: !muted
      }
    }
    $snapcast.send(JSON.stringify(message));
    $clients = $clients.map(group => {
      if (group.group === groupId) {
        group.muted = !muted
      }
      return group
    });
  }



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
</style>
