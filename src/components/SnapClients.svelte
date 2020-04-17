{#if $snapClientsVisibility}
  <div class="notification is-primary" id="notification">
    {#each $clients as client}
      <div class="columns is-mobile">
        <div class="column is-narrow">
          {client.name}
        </div>
        <div class="column is-narrow">
          {client.muted ? 'Mut' : 'Ply' }
        </div>
        <div class="column">
          <progress class="progress" value="{client.volume}" max="100">{client.volume}%</progress>
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

    function handleMessage (message) {
      console.log('[Snapcast]: ', message)
      let { result } = JSON.parse(message.data)
      if (result && result.server && result.server.groups) {
        let clientsRaw = result.server.groups.map((x) => x.clients.pop())
        console.log(clientsRaw);
        $clients = clientsRaw.map(x => {
          return {id: x.id, name: x.host.name, volume: x.config.volume.percent, muted: x.config.volume.muted}
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

  })


</script>

<style type="text/css" media="screen">

.notification {
  bottom: 5rem;
  right: 1rem;
  position: fixed;
  width: 300px;
}
  
</style>
