import { snapcast, clients } from '../tools/stores';

let snapcastWS;

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
  console.log('[Snapcast]: ', message)
  let { result } = JSON.parse(message.data)
  if (result && result.server && result.server.groups) {
    let clientsRaw = result.server.groups //.map((x) => x.clients.pop())
    console.log(clientsRaw);
    clients.update(v => {
      return clientsRaw.map(group => {
        return {id: group.clients[0].id, name: group.clients[0].host.name, volume: group.clients[0].config.volume.percent, muted: group.clients[0].config.volume.muted, group: group.id}
      })
    })
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

