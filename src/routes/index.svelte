<style>
	h1 {
		text-align: center;
		margin: 0 auto;
	}

	h1 {
		font-size: 2.8em;
		text-transform: uppercase;
		font-weight: 700;
		margin: 0 0 0.5em 0;
	}

	@media (min-width: 480px) {
		h1 {
			font-size: 4em;
		}
	}
</style>

<svelte:head>
	<title>Sapper project template</title>
</svelte:head>

<h1>Great success!</h1>

<div>
  My clients
  <ul>
	{#each $clients as client}
    <li>{client.name} x {client.id} x {client.volume}</li>
	{/each}
</ul>

</div>

<script>
  import { onMount } from 'svelte';
  import { clients } from '../tools/stores';

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
        clientsRaw.forEach(x => $clients = [...$clients, {id: x.id, name: x.host.name, volume: x.config.volume.percent, muted: x.config.volume.muted}]);
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

