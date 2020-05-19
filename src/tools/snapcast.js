import { snapcast, snapGroups } from '../tools/stores';

let snapcastWS;
let groupsLocal

const c = snapGroups.subscribe((value) => { groupsLocal = value })
const s = snapcast.subscribe((value) => { snapcastWS = value });

export function connectSnapcast(options) {
  return new Promise(function(resolve, reject) {
    if (snapcastWS && !options && !option.reconnect) {
      resolve(snapcastWS)
    } else {
      const host = options && options.host ? options.host : window.location.hostname;
      const port = options && options.port ? options.port : '1780';
      const ssl = options && options.ssl ? 's' : '';
      snapcastWS = new WebSocket(`ws${ssl}://${host}:${port}/jsonrpc`);

      /* Error Event Handler */
      snapcastWS.onerror = (e) => {
        // need to get both the statusCode and the reason phrase
        console.log('[Snapcast]: error:', e);
        reject(new Error("error connecting to snapcast"));
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
    const groupsRaw = data.result.server.groups //.map((x) => x.snapGroups.pop())
    snapGroups.update(v => {
      return groupsRaw.map(group => {
        return { 
          id: group.id,
          name: group.name,
          muted: group.muted,
          clients: group.clients.map(client => {
            return {
              id: client.id,
              host: client.host.name,
              name: client.config.name,
              volume: client.config.volume.percent,
              connected: client.connected,
              muted: client.config.volume.muted,
            }
          })
        }
      })
    })
  } 
  if (data && data.method) {
    if (data.method === 'Client.OnDisconnect') {
      const id = data.params.client.id
      snapGroups.update(v => {
        return groupsLocal.map(group => {
          group.clients.forEach(client => {
            if (client.id === id) client.connected = false
          })
          return group
        });
      })
    } else if (data.method === 'Client.OnConnect') {
      const id = data.params.client.id
      snapGroups.update(v => {
        return groupsLocal.map(group => {
          group.clients.forEach(client => {
            if (client.id === id) client.connected = true
          })
          return group
        });
      })
    } else if (data.method === 'Client.OnNameChanged') {
      const id = data.params.id
      snapGroups.update(v => {
        return groupsLocal.map(group => {
          group.clients.forEach(client => {
            if (client.id === id) client.name = data.params.name
          })
          return group
        });
      })
    } else if (data.method === 'GrClient.OnNameChanged') {
      const id = data.params.id
      snapGroups.update(v => {
        return groupsLocal.map(group => {
          if (group.id === id) client.name = data.params.name
          return group
        });
      })
    } else if (data.method === 'Client.OnVolumeChanged') {
      const id = data.params.id
      snapGroups.update(v => {
        return groupsLocal.map(group => {
          group.clients.forEach(client => {
            if (client.id === id) client.volume = data.params.volume.percent
          })
          return group
        });
      })
    }
  }
}

export function muteClient(clientId, muted) {
  console.log(`Muted ${clientId} - ${muted}`);
  let message = {
    id:8,
    jsonrpc:"2.0",
    method:"Client.SetVolume",
    params:{
      id: clientId,
      volume: {
        muted: false,
        percent: muted ? 10 : 0
      }
    }
  }
  snapcastWS.send(JSON.stringify(message));
  snapGroups.update(v => {
    return groupsLocal.map(group => {
      group.clients.forEach(client => {
        if (client.id == clientId) client.muted = !muted
      })
      return group
    });
  })
}

export function muteGroup(groupId, muted) {
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
  snapcastWS.send(JSON.stringify(message));
  snapGroups.update(v => {
    return groupsLocal.map(group => {
      group.muted = !muted
      if (group.id === groupId) {
        group.clients.forEach(client => client.muted = !muted)
      }
      return group
    });
  })
}

export function changeHandler(id, volume) {
  console.log(`Client ${id} - vol ${volume}`);
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
  snapcastWS.send(JSON.stringify(message));
}

export const editGroupName = (id, name) => {
  const message = {
    id:8,
    jsonrpc:"2.0",
    method:"Group.SetName",
    params:{
      id,
      name
    }
  }
  snapcastWS.send(JSON.stringify(message));
}

export const editClientName = (id, name) => {
  const message = {
    id:8,
    jsonrpc:"2.0",
    method:"Client.SetName",
    params:{
      id,
      name
    }
  }
  snapcastWS.send(JSON.stringify(message));
}
