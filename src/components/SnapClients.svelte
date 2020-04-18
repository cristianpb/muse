{#if $snapClientsVisibility}
  <div class="notification is-primary" id="notification">
    {#each $clients as client}
      <div class="columns is-mobile">
        <div class="column is-narrow">
          {client.name}
        </div>
        <div class="column is-narrow" on:click={muteGroup(client.group,client.muted)}>
          {client.muted ? 'Mut' : 'Ply' }
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
      </div>
    {/each}
  </div>
{/if}

<script charset="utf-8">
  import { onMount } from 'svelte';
  import { clients, snapClientsVisibility } from '../tools/stores';

  let ws;
  onMount(async () => {
    try {
      ws = new WebSocket('ws://10.3.141.129:1780/jsonrpc');

    } catch (exception) {
      console.error(exception);
    }

    /* Error Event Handler */
    ws.onerror = (e) => {
      // need to get both the statusCode and the reason phrase
      console.log('[Snapcast]: error:', e);
    };

    ws.onopen = () => {
      console.log('[Snapcast]: Connected')
      let message = {
        jsonrpc: '2.0',
        id: 8,
        method: 'Server.GetStatus',
      }
      ws.send(JSON.stringify(message));
    };

    ws.onmessage = (message) => {
      handleMessage(message);
    };

  })

  function handleMessage (message) {
    console.log('[Snapcast]: ', message)
    let { result } = JSON.parse(message.data)
    if (result && result.server && result.server.groups) {
      let clientsRaw = result.server.groups //.map((x) => x.clients.pop())
      console.log(clientsRaw);
      $clients = clientsRaw.map(group => {
        return {id: group.clients[0].id, name: group.clients[0].host.name, volume: group.clients[0].config.volume.percent, muted: group.clients[0].config.volume.muted, group: group.id}
      })
    }
  }

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
      ws.send(JSON.stringify(message));
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
    ws.send(JSON.stringify(message));
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
    ws.send(JSON.stringify(message));
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
