import {
  snapcast,
  snapGroups,
  snapcastHost,
  snapcastPort,
  snapcastSSL,
} from "../tools/stores";

let snapcastWS;
let groupsLocal;
let snapcastHostLocal;
let snapcastPortLocal;
let snapcastSSLLocal;
let config;
let connecting = false;

snapGroups.subscribe((value) => {
  groupsLocal = value;
});
snapcastHost.subscribe((value) => {
  snapcastHostLocal = value;
});
snapcastPort.subscribe((value) => {
  snapcastPortLocal = value;
});
snapcastSSL.subscribe((value) => {
  snapcastSSLLocal = value;
});

const connectingFunction = (host, port, ssl) => {
  return new Promise((resolve, reject) => {
    snapcastWS = new WebSocket(
      `ws${ssl === "true" ? "s" : ""}://${host}:${port}/jsonrpc`,
    );

    /* Error Event Handler */
    snapcastWS.onerror = (e) => {
      console.log("[Snapcast]: error:", e);
      connecting = false;
      reject(new Error("error connecting to snapcast"));
    };

    snapcastWS.onopen = () => {
      console.log("[Snapcast]: Connected");
      let message = {
        jsonrpc: "2.0",
        id: 8,
        method: "Server.GetStatus",
      };
      snapcastWS.send(JSON.stringify(message));
      snapcast.set(snapcastWS);
      connecting = false;
      resolve("Connected");
    };

    snapcastWS.onmessage = (message) => {
      handleMessage(message);
    };
  });
};

const get_config = async () => {
  const res = await fetch("/muse/config");
  if (res.status === 200) {
    config = await res.json();
  }
};

export const connectSnapcast = async (reconnect) => {
  if (connecting) {
    while (connecting) {
      console.log("[Snapcast]: already connecting");
      await new Promise((r) => setTimeout(r, 200));
    }
    return "[Snapcast]: finish waiting connection";
  } else {
    if (snapcastWS === undefined || reconnect) {
      connecting = true;
      await get_config();
      const host =
        config && config.snapcast && config.snapcast.host
          ? config.snapcast.host
          : snapcastHostLocal
            ? snapcastHostLocal
            : document.defaultView.location.hostname;
      const port =
        config && config.snapcast && config.snapcast.port
          ? config.snapcast.port
          : snapcastPortLocal
            ? snapcastPortLocal
            : 1780;
      const ssl =
        config && config.snapcast && config.snapcast.ssl
          ? Boolean(config.snapcast.ssl).toString()
          : snapcastSSLLocal
            ? snapcastSSLLocal
            : document.defaultView.location.protocol === "https:"
              ? "true"
              : "false";
      snapcastHost.set(host);
      snapcastPort.set(port);
      snapcastSSL.set(ssl);
      const message = await connectingFunction(host, port, ssl);
      return `[Snapcast]: ${message}`;
    } else {
      return "[Snapcast]: already connected";
    }
  }
};

const updateServer = (groupsRaw) => {
  snapGroups.set(
    groupsRaw.map((group) => {
      return {
        id: group.id,
        name: group.name,
        muted: group.muted,
        clients: group.clients.map((client) => {
          return {
            id: client.id,
            host: client.host.name,
            name: client.config.name,
            volume: client.config.volume.percent,
            connected: client.connected,
            muted: client.config.volume.muted,
          };
        }),
      };
    }),
  );
};

export function handleMessage(message) {
  const data = JSON.parse(message.data);
  console.log("[Snapcast]: ", data);
  if (data.result && data.result.server && data.result.server.groups) {
    const groupsRaw = data.result.server.groups; //.map((x) => x.snapGroups.pop())
    updateServer(groupsRaw);
  }
  if (data && data.method) {
    if (data.method === "Client.OnDisconnect") {
      const id = data.params.client.id;
      snapGroups.set(
        groupsLocal.map((group) => {
          group.clients.forEach((client) => {
            if (client.id === id) client.connected = false;
          });
          return group;
        }),
      );
    } else if (data.method === "Client.OnConnect") {
      const id = data.params.client.id;
      snapGroups.set(
        groupsLocal.map((group) => {
          group.clients.forEach((client) => {
            if (client.id === id) client.connected = true;
          });
          return group;
        }),
      );
    } else if (data.method === "Client.OnNameChanged") {
      const id = data.params.id;
      snapGroups.set(
        groupsLocal.map((group) => {
          group.clients.forEach((client) => {
            if (client.id === id) client.name = data.params.name;
          });
          return group;
        }),
      );
    } else if (data.method === "GrClient.OnNameChanged") {
      const id = data.params.id;
      snapGroups.set(
        groupsLocal.map((group) => {
          if (group.id === id) group.client.name = data.params.name;
          return group;
        }),
      );
    } else if (data.method === "Client.OnVolumeChanged") {
      const id = data.params.id;
      snapGroups.set(
        groupsLocal.map((group) => {
          group.clients.forEach((client) => {
            if (client.id === id) client.volume = data.params.volume.percent;
          });
          return group;
        }),
      );
    } else if (data.method === "Server.OnUpdate") {
      const groupsRaw = data.params.server.groups; //.map((x) => x.snapGroups.pop())
      updateServer(groupsRaw);
    }
  }
}

export function muteClient(clientId, muted) {
  console.log(`[Snapcast]: ${muted ? "Unmute" : "Mute"} client ${clientId}`);
  let message = {
    id: 8,
    jsonrpc: "2.0",
    method: "Client.SetVolume",
    params: {
      id: clientId,
      volume: {
        muted: false,
        percent: muted ? 10 : 0,
      },
    },
  };
  snapcastWS.send(JSON.stringify(message));
  snapGroups.set(
    groupsLocal.map((group) => {
      group.clients.forEach((client) => {
        if (client.id == clientId) {
          client.volume = muted ? 10 : 0;
          client.muted = !muted;
        }
      });
      return group;
    }),
  );
}

export function muteGroup(groupId, muted) {
  console.log(`[Snapcast]: ${muted ? "Unmute" : "Mute"} group ${groupId}`);
  let message = {
    id: 8,
    jsonrpc: "2.0",
    method: "Group.SetMute",
    params: {
      id: groupId,
      mute: !muted,
    },
  };
  snapcastWS.send(JSON.stringify(message));
  snapGroups.set(
    groupsLocal.map((group) => {
      group.muted = !muted;
      if (group.id === groupId) {
        group.clients.forEach((client) => (client.muted = !muted));
      }
      return group;
    }),
  );
}

export function changeHandler(id, volume) {
  console.log(`Client ${id} - vol ${volume}`);
  let message = {
    id: 8,
    jsonrpc: "2.0",
    method: "Client.SetVolume",
    params: {
      id,
      volume: {
        muted: false,
        percent: volume,
      },
    },
  };
  snapcastWS.send(JSON.stringify(message));
}

export const editGroupName = (id, name) => {
  const message = {
    id: 8,
    jsonrpc: "2.0",
    method: "Group.SetName",
    params: {
      id,
      name,
    },
  };
  snapcastWS.send(JSON.stringify(message));
};

export const editClientName = (id, name) => {
  const message = {
    id: 8,
    jsonrpc: "2.0",
    method: "Client.SetName",
    params: {
      id,
      name,
    },
  };
  snapcastWS.send(JSON.stringify(message));
};

export const setGroupClients = (groupId, clientsList) => {
  const message = {
    id: 8,
    jsonrpc: "2.0",
    method: "Group.SetClients",
    params: {
      clients: clientsList,
      id: groupId,
    },
  };
  snapcastWS.send(JSON.stringify(message));
};

export const deleteClient = (id) => {
  const message = {
    id: 8,
    jsonrpc: "2.0",
    method: "Server.DeleteClient",
    params: { id },
  };
  snapcastWS.send(JSON.stringify(message));
};
