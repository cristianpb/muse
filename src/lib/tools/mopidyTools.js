import Mopidy from "mopidy";
import {
  mopidy,
  playlists,
  currentTrack,
  currentPlaytime,
  currentState,
  currentVolume,
  currentMute,
  totalPlaytime,
  currentRandom,
  currentConsume,
  currentRepeat,
  currentSingle,
  mopidyHost,
  mopidyPort,
  mopidySSL,
} from "./stores";

let mopidyWS;
let mopidyHostLocal;
let mopidyPortLocal;
let mopidySSLLocal;
let playlistsLocal;
let currentPlaytimeLocal;
let totalPlaytimeLocal;
let interval;
let connecting = false;
let config;

mopidyHost.subscribe((value) => {
  mopidyHostLocal = value;
});
mopidyPort.subscribe((value) => {
  mopidyPortLocal = value;
});
mopidySSL.subscribe((value) => {
  mopidySSLLocal = value;
});
playlists.subscribe((value) => {
  playlistsLocal = value;
});
currentPlaytime.subscribe((value) => {
  currentPlaytimeLocal = value;
});
totalPlaytime.subscribe((value) => {
  totalPlaytimeLocal = value;
});

export function convertSencondsToString(ms) {
  let minutes = ~~(ms / 60000);
  let seconds = `${~~((ms / 1000) % 60)}`;
  return `${minutes}:${seconds.padStart(2, "0")}`;
}

export function normalizeTime(current, total) {
  let norm = (current / total) * 100;
  return norm;
}

export function convertPercentToSeconds(percent, total) {
  return ~~((total * percent) / 100);
}

const connectingFunction = (host, port, ssl) => {
  return new Promise((resolve, reject) => {
    mopidyWS = new Mopidy({
      webSocketUrl: `ws${ssl === "true" ? "s" : ""}://${host}:${port}/mopidy/ws/`,
    });
    mopidyWS.on("state:online", async () => {
      console.log("[Mopidy]: Connected");

      const currentTrackTL = await upgradeCurrentTrack();
      currentPlaytimeLocal = await mopidyWS.playback.getTimePosition();
      const currentStateLocal = await mopidyWS.playback.getState();
      const currentVolumeLocal = await mopidyWS.mixer.getVolume();
      const currentMuteLocal = await mopidyWS.mixer.getMute();
      const currentRandomLocal = await mopidyWS.tracklist.getRandom();
      const currentConsumeLocal = await mopidyWS.tracklist.getConsume();
      const currentRepeatLocal = await mopidyWS.tracklist.getRepeat();
      const currentSingleLocal = await mopidyWS.tracklist.getSingle();

      currentPlaytime.set(currentPlaytimeLocal);
      currentState.set(currentStateLocal);
      currentVolume.set(currentVolumeLocal);
      currentMute.set(currentMuteLocal);
      currentRandom.set(currentRandomLocal);
      currentConsume.set(currentConsumeLocal);
      currentRepeat.set(currentRepeatLocal);
      currentSingle.set(currentSingleLocal);

      if (currentTrackTL) {
        const totalPlaytimeLocal = currentTrackTL.track.length;
        totalPlaytime.set(currentTrackTL.track.length);
        if (currentStateLocal === "playing") {
          if (interval) {
            clearInterval(interval);
          }
          interval = setInterval(() => {
            if (currentPlaytimeLocal >= totalPlaytimeLocal) {
              clearInterval(interval);
            } else {
              currentPlaytime.update((v) => v + 1000);
            }
          }, 1000);
        }
      }
      connecting = false;
      mopidy.set(mopidyWS);
      resolve("Connected");
    });

    mopidyWS.on("state", (x) => console.log("[Mopidy]:", x));
    mopidyWS.on("event", (x) => console.log("[Mopidy]:", x));

    mopidyWS.on("state:offline", (_) => {
      connecting = false;
      reject(new Error("error connecting to mopidy"));
    });

    mopidyWS.on("event:trackPlaybackEnded", (event) => {
      let { time_position } = event;
      clearInterval(interval);
      currentPlaytime.set(time_position);
    });

    mopidyWS.on("event:trackPlaybackPaused", (event) => {
      let { time_position } = event;
      clearInterval(interval);
      currentPlaytime.set(time_position);
    });

    mopidyWS.on("event:trackPlaybackResumed", (event) => {
      let { time_position } = event;
      currentPlaytime.set(time_position);
      if (interval) {
        clearInterval(interval);
      }
      interval = setInterval(() => {
        if (currentPlaytimeLocal >= totalPlaytimeLocal) {
          clearInterval(interval);
        } else {
          currentPlaytime.update((v) => v + 1000);
        }
      }, 1000);
    });

    mopidyWS.on("event:volumeChanged", (event) => {
      currentVolume.set(event.volume);
    });

    mopidyWS.on("event:playbackStateChanged", (event) => {
      let { new_state } = event;
      currentPlaytime.set(0);
      currentState.set(new_state);
      if (new_state == "paused") {
        clearInterval(interval);
      }
      if (new_state == "playing") {
        if (interval) {
          clearInterval(interval);
        }
        interval = setInterval(() => {
          if (currentPlaytimeLocal >= totalPlaytimeLocal) {
            clearInterval(interval);
          } else {
            currentPlaytime.update((v) => v + 1000);
          }
        }, 1000);
      }
    });

    mopidyWS.on("event:trackPlaybackStarted", async () => {
      currentPlaytime.set(0);
      const currentTrackTL = await upgradeCurrentTrack();
      const totalPlaytimeLocal = currentTrackTL.track.length;
      totalPlaytime.set(currentTrackTL.track.length);
      if (interval) {
        clearInterval(interval);
      }
      interval = setInterval(() => {
        if (currentPlaytimeLocal >= totalPlaytimeLocal) {
          clearInterval(interval);
        } else {
          currentPlaytime.update((v) => v + 1000);
        }
      }, 1000);
    });

    mopidyWS.on("error", (err) => {
      console.log("[Mopidy]: error:", err);
      connecting = false;
      reject(new Error("error connecting to mopidy"));
    });
  });
};

const get_config = async () => {
  const res = await fetch("/muse/config");
  if (res.status === 200) {
    config = await res.json();
  }
};

export const connectWS = async (reconnect) => {
  if (connecting) {
    const maxTimeout = 5;
    let n = 0;
    while (connecting && n < maxTimeout) {
      console.log("[Mopidy]: already connecting");
      n += 1;
      await new Promise((r) => setTimeout(r, 200));
    }
    return "[Mopidy]: finish waiting connection";
  } else {
    if (mopidyWS === undefined || reconnect) {
      connecting = true;
      console.log("[Mopidy]: try to connect");
      await get_config();
      const host =
        config && config.mopidy && config.mopidy.host
          ? config.mopidy.host
          : mopidyHostLocal
            ? mopidyHostLocal
            : document.defaultView.location.hostname;
      const port =
        config && config.mopidy && config.mopidy.port
          ? config.mopidy.port
          : mopidyPortLocal
            ? mopidyPortLocal
            : document.defaultView.location.port;
      const ssl =
        config && config.mopidy && config.mopidy.ssl
          ? Boolean(config.mopidy.ssl).toString()
          : mopidySSLLocal
            ? mopidySSLLocal
            : document.defaultView.location.protocol === "https:"
              ? "true"
              : "false";
      mopidyHost.set(host);
      mopidyPort.set(port);
      mopidySSL.set(ssl);
      await connectingFunction(host, port, ssl);
      return "[Mopidy]: first connection connected";
    } else {
      return "[Mopidy]: already connected";
    }
  }
};

export const upgradeCurrentTrack = async () => {
  const currentTrackTL = await mopidyWS.playback.getCurrentTlTrack();
  if (currentTrackTL) {
    const currentTrackRaw = await mopidyWS.library.lookup([
      [currentTrackTL.track.uri],
    ]);
    const currentIndex = await mopidyWS.tracklist.index();
    currentTrackTL.track = Object.values(currentTrackRaw)[0][0];
    currentTrackTL.index = currentIndex;
    currentTrack.set(currentTrackTL);
    return currentTrackTL;
  }
};

export const loadUris = async () => {
  await connectWS();
  return await mopidyWS.library.browse({ uri: null });
};

export const loadUrisResults = async (selectedUris, hideUris) => {
  await connectWS();
  const urisResult = await mopidyWS.getUriSchemes();
  if (urisResult) {
    const uris = urisResult.filter((x) => hideUris.indexOf(x) === -1);
    uris.forEach((uri) => (selectedUris[uri] = true));
    return uris;
  }
};

export const searchFunction = async (selectedUris, searchTerm) => {
  const urisRequest = Object.entries(selectedUris)
    .filter((x) => x[1])
    .map((x) => `${x[0]}:`);
  const res = await mopidyWS.library.search({
    query: { any: [searchTerm] },
    uris: [`${urisRequest}`],
  });
  if (res && res.length > 0) {
    let { tracks } = res.pop();
    if (tracks) {
      return tracks;
    }
  }
  return [];
};

export const getPlaylists = async () => {
  await connectWS();
  const playlistsRaw = await mopidyWS.playlists.asList();
  playlistsLocal = playlistsRaw.map((playlistRaw) => {
    playlistRaw.slug = playlistRaw.name;
    return playlistRaw;
  });
  return playlistsLocal;
};

export async function getPlaylistTracks(uri) {
  const playlistsTracks = await mopidyWS.playlists.lookup([uri]);
  if (playlistsTracks) {
    return playlistsTracks;
  } else {
    throw new Error("error reading playlists tracks");
  }
}

export async function getCurrentTrackList() {
  const currentTrackList = await mopidyWS.tracklist.getTracks();
  if (currentTrackList) {
    return currentTrackList;
  } else {
    throw new Error("Error reading tracklist");
  }
}

export async function getCurrentTlTrackList() {
  await connectWS();
  const currentTrackList = await mopidyWS.tracklist.getTlTracks();
  if (currentTrackList) {
    return currentTrackList;
  } else {
    throw new Error("Error reading tracklist");
  }
}

export function playTrackSingle(uri) {
  mopidyWS.tracklist.clear();
  if (Array.isArray(uri)) {
    mopidyWS.tracklist.add({ tracks: uri });
  } else {
    mopidyWS.tracklist.add({ uris: [uri] });
  }
  mopidyWS.playback.play();
}

export async function addTrackNext(uri) {
  const index = await mopidyWS.tracklist.index();
  mopidyWS.tracklist.add({ at_position: index + 1, uris: [uri] });
}

export async function addTrackQueue(uri) {
  mopidyWS.tracklist.add({ uris: [uri] });
}

export async function playPlaylist(uri) {
  const playlistInfo = await getPlaylistTracks(uri);
  mopidyWS.tracklist.clear();
  mopidyWS.tracklist.add([playlistInfo.tracks]);
  mopidyWS.playback.play();
}

export async function shufflePlaylist(uri) {
  const playlistInfo = await getPlaylistTracks(uri);
  mopidyWS.tracklist.clear();
  mopidyWS.tracklist.add([playlistInfo.tracks]);
  mopidyWS.tracklist.shuffle();
  mopidyWS.playback.play();
}

export async function addToQueuePlaylists(uri) {
  const playlistInfo = await getPlaylistTracks(uri);
  mopidyWS.tracklist.add([playlistInfo.tracks]);
}

export const setTrackTime = async (currentPlaytimePercent) => {
  const ms = convertPercentToSeconds(
    currentPlaytimePercent,
    totalPlaytimeLocal,
  );
  const changed = await mopidyWS.playback.seek([ms]);
  if (changed) {
    console.log("[Mopidy]: Set track time", currentPlaytimePercent);
    currentPlaytime.set(ms);
  } else {
    console.log("[Mopidy]: Failed tracktime change", changed, ms);
  }
};

export const playTracklist = (tlTrack) => {
  mopidyWS.playback.play([tlTrack]);
};

export const playAllTracks = (uris) => {
  mopidyWS.tracklist.clear();
  mopidyWS.tracklist.add({ uris });
  mopidyWS.playback.play();
};

export const shufflePlayAllTracks = (Tracks, uris) => {
  mopidyWS.tracklist.clear();
  if (Tracks) {
    mopidyWS.tracklist.add([Tracks]);
  } else if (uris) {
    mopidyWS.tracklist.add({ uris });
  }
  mopidyWS.tracklist.shuffle();
  mopidyWS.playback.play();
};

export const addTracksQueue = (Tracks, uris) => {
  if (Tracks) {
    mopidyWS.tracklist.add([Tracks]);
  } else if (uris) {
    mopidyWS.tracklist.add({ uris });
  }
};

export const loadAlbumImage = async (track) => {
  console.log("[Mopidy]: Searching images for ", track.uri);
  const trackImages = await mopidyWS.library.getImages({ uris: [track.uri] });
  if (Object.values(trackImages)[0].length > 0) {
    const image = Object.values(trackImages)[0].find(
      (x) => x.__model__ == "Image",
    ).uri;
    return image;
  } else if (track && track.album) {
    const res = await fetch(
      `https://ws.audioscrobbler.com/2.0/?format=json&method=album.getInfo&album=${track.album.name.replace(/[^\w\s]/gi, "")}&artist=${track.artists[0].name.replace(/[^\w\s]/gi, "")}&api_key=12bbc4850d7cb77e2842f0a2f7bcc2e3&&autocorrect=1`,
    );
    const lastfm = await res.json();
    console.log("[Lastfm]: Result information", lastfm);
    if (lastfm && lastfm.album) {
      const image = lastfm.album.image.find((x) => x.size === "extralarge");
      if (image["#text"]) {
        return image["#text"];
      }
    }
  }
};
