import { snapcast, clients } from '../tools/stores';

let snapcastWS;
let clientsLocal

const c = clients.subscribe((value) => { clientsLocal = value })
const s = snapcast.subscribe((value) => { snapcastWS = value });

export function connectSnapcast() {
  return new Promise(function(resolve, reject) {
    if (snapcastWS) {
      resolve(snapcastWS)
    } else {
      snapcastWS = new WebSocket(`ws://${window.location.hostname}:1780/jsonrpc`);

      /* Error Event Handler */
      snapcastWS.onerror = (e) => {
        // need to get both the statusCode and the reason phrase
        console.log('[Snapcast]: error:', e);
        reject(e);
      };

      snapcastWS.onopen = () => {
        console.log('[Snapcast]: Connected')
        let message = {
          jsonrpc: '2.0',
          id: 8,
          method: 'Server.GetStatus',
        }
        snapcastWS.send(JSON.stringify(message));
        resolve(snapcastWS)
      };

      snapcastWS.onmessage = (message) => {
        handleMessage(message);
      };
    }

  });
}

export function handleMessage (message) {
  const data = JSON.parse(message.data)
  console.log('[Snapcast]: ', data)
  if (data.result && data.result.server && data.result.server.groups) {
    const clientsRaw = data.result.server.groups //.map((x) => x.clients.pop())
    clients.update(v => {
      return clientsRaw.map(group => {
        return {
          id: group.clients[0].id,
          name: group.clients[0].host.name,
          volume: group.clients[0].config.volume.percent,
          connected: group.clients[0].connected,
          muted: group.clients[0].config.volume.muted,
          group: group.id}
      })
    })
  } 
  if (data && data.method) {
    if (data.method === 'Client.OnDisconnect') {
      const id = data.params.client.id
      const filteredClients = clientsLocal.map(x => {
        if (x.id === id) {
          x.connected = false
        }
        return x
      })
      clients.set(filteredClients)
    } else if (data.method === 'Client.OnConnect') {
      const id = data.params.client.id
      const filteredClients = clientsLocal.map(x => {
        if (x.id === id) {
          x.connected = true
        }
        return x
      })
      clients.set(filteredClients)
    }
  }
}

//
//export function changeHandler(id, volume) {
//  console.log(`client ${id} - vol ${volume}`);
//  let message = {
//    id:8,
//    jsonrpc:"2.0",
//    method:"Client.SetVolume",
//    params:{
//      id,
//      volume:{
//        muted:false,
//        percent:volume
//      }
//    }
//  }
//  snapcastWS.send(JSON.stringify(message));
//}
//
//export function muteGroup(groupId, muted) {
//  console.log($clients);
//  console.log(`Muted ${groupId} - ${muted}`);
//  let message = {
//    id:8,
//    jsonrpc:"2.0",
//    method:"Group.SetMute",
//    params:{
//      id: groupId,
//      mute: !muted
//    }
//  }
//  ws.send(JSON.stringify(message));
//  $clients = $clients.map(group => {
//    if (group.group === groupId) {
//      group.muted = !muted
//    }
//    return group
//  });
//}

