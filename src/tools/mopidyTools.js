import Mopidy from "mopidy";
import { mopidy, playlists, currentTrack, currentPlaytime, currentState, currentVolume, currentMute, totalPlaytime, currentRandom, currentConsume, currentRepeat, currentSingle, mopidyHost, mopidyPort, mopidySSL } from './stores';

let mopidyWS;
let mopidyHostLocal;
let mopidyPortLocal;
let mopidySSLLocal;
let playlistsLocal;
let currentPlaytimeLocal;
let totalPlaytimeLocal;
let interval;
let connecting = false

mopidy.subscribe((value) => { mopidyWS = value });
mopidyHost.subscribe((value) => { mopidyHostLocal = value });
mopidyPort.subscribe((value) => { mopidyPortLocal = value });
mopidySSL.subscribe((value) => { mopidySSLLocal = value });
playlists.subscribe((value) => { playlistsLocal = value });
currentPlaytime.subscribe((value) => { currentPlaytimeLocal = value });
totalPlaytime.subscribe((value) => { totalPlaytimeLocal = value });

export function convertSencondsToString(ms) {
  let minutes = ~~(ms / 60000)
  let seconds = `${~~((ms / 1000) % 60)}`
  return `${minutes}:${seconds.padStart(2, '0')}`
}

export function normalizeTime(current, total) {
  let norm = ((current / total ) * 100)
  return norm
}

export function convertPercentToSeconds(percent, total) {
  return ~~((total * percent) / 100)
}

let promiseConnecting;

const connectingFunction = () => {
  return new Promise((resolve, reject) => {
    connecting = true;
    const host = mopidyHostLocal ? mopidyHostLocal : window.location.hostname;
    const port = mopidyPortLocal ? mopidyPortLocal : window.location.port;
    const protocol = mopidySSLLocal ? mopidySSLLocal : window.location.protocol === 'https:' ? 'true' : 'false';
    mopidyWS = new Mopidy({
      webSocketUrl: `ws${ protocol === 'true' ? 's' : '' }://${host}:${port}/mopidy/ws/`,
    });
    mopidyWS.on("state:online", async () => {
      console.log('[Mopidy]: Connected', mopidyWS);

      const currentTrackTL = await upgradeCurrentTrack()
      currentPlaytimeLocal = await mopidyWS.playback.getTimePosition()
      const currentStateLocal = await mopidyWS.playback.getState()
      const currentVolumeLocal = await mopidyWS.mixer.getVolume()
      const currentMuteLocal = await mopidyWS.mixer.getMute()
      const currentRandomLocal = await mopidyWS.tracklist.getRandom()
      const currentConsumeLocal = await mopidyWS.tracklist.getConsume()
      const currentRepeatLocal = await mopidyWS.tracklist.getRepeat()
      const currentSingleLocal = await mopidyWS.tracklist.getSingle()

      currentPlaytime.set(currentPlaytimeLocal);
      currentState.set(currentStateLocal);
      currentVolume.set(currentVolumeLocal);
      currentMute.set(currentMuteLocal);
      currentRandom.set(currentRandomLocal);
      currentConsume.set(currentConsumeLocal);
      currentRepeat.set(currentRepeatLocal);
      currentSingle.set(currentSingleLocal);

      if (currentTrackTL) {
        const totalPlaytimeLocal = currentTrackTL.track.length
        totalPlaytime.set(currentTrackTL.track.length)
        if (currentStateLocal === 'playing') {
          if (interval) {
            clearInterval(interval)
          }
          interval = setInterval(() => {
            if (currentPlaytimeLocal >= totalPlaytimeLocal) {
              clearInterval(interval)
            } else {
              currentPlaytime.update(v => v + 1000)
            }
          }, 1000);
        }
      }
      connecting = false
      mopidy.set(mopidyWS)
      resolve('Connected')
      //resolve(mopidyWS);
    })

      mopidyWS.on("state", (x) => console.log('[Mopidy]:', x));
      mopidyWS.on("event", (x) => console.log('[Mopidy]:', x));

      mopidyWS.on("event:trackPlaybackEnded", (event) => {
        let { time_position } = event
        clearInterval(interval);
        currentPlaytime.set(time_position)
      })

      mopidyWS.on("event:trackPlaybackPaused", (event) => {
        let { time_position } = event
        clearInterval(interval);
        currentPlaytime.set(time_position)
      })

      mopidyWS.on("event:trackPlaybackResumed", (event) => {
        let { time_position } = event
        currentPlaytime.set(time_position)
        if (interval) {
          clearInterval(interval)
        }
        interval = setInterval(() => {
          if (currentPlaytimeLocal >= totalPlaytimeLocal) {
            clearInterval(interval)
          } else {
            currentPlaytime.update(v => v + 1000)
          }
        }, 1000);
      })

      mopidyWS.on("event:volumeChanged", (event) => {
        currentVolume.set(event.volume);
      })

      mopidyWS.on("event:playbackStateChanged", (event) => {
        let { new_state } = event
        currentPlaytime.set(0)
        currentState.set(new_state)
        if (new_state == 'paused') {
          clearInterval(interval);
        } if (new_state == 'playing') {
          if (interval) {
            clearInterval(interval)
          }
          interval = setInterval(() => {
            if (currentPlaytimeLocal >= totalPlaytimeLocal) {
              clearInterval(interval)
            } else {
              currentPlaytime.update(v => v + 1000)
            }
          }, 1000);
        }
      })

      mopidyWS.on("event:trackPlaybackStarted", async () => {
        currentPlaytime.set(0)
        const currentTrackTL = await upgradeCurrentTrack()
        const totalPlaytimeLocal = currentTrackTL.track.length
        totalPlaytime.set(currentTrackTL.track.length)
        if (interval) {
          clearInterval(interval)
        }
        interval = setInterval(() => {
          if (currentPlaytimeLocal >= totalPlaytimeLocal) {
            clearInterval(interval) 
          } else {
            currentPlaytime.update(v => v + 1000)
          }
        }, 1000);
      });

      mopidyWS.on("error", (err) => {
        console.log('[Mopidy]: error:', err);
        reject(err);
      });
  })
}

export function connectWS(reconnect) {
  // return new Promise(function(resolve, reject) {
    if (mopidyWS && !reconnect) {
      if (connecting) {
        console.log("connecting", promiseConnecting);
        // resolve('Connecting')
        return promiseConnecting
        // console.log('[Mopidy]: Waiting for connection');
        //setTimeout(() => {
        //  console.log('[Mopidy]: Already connected');
        //  resolve(mopidyWS)
        //}, 1000)
      } else {
        // resolve('Connected')
        console.log("already connected");
        return promiseConnecting
        // resolve('Connected')
        //resolve(mopidyWS)
      }
    } else {
      promiseConnecting = connectingFunction()
      return promiseConnecting
    }
  // });
}

export const upgradeCurrentTrack = async () => {
  const currentTrackTL = await mopidyWS.playback.getCurrentTlTrack()
  if (currentTrackTL) {
    const currentTrackRaw = await mopidyWS.library.lookup([[currentTrackTL.track.uri]])
    const currentIndex = await mopidyWS.tracklist.index()
    currentTrackTL.track = Object.values(currentTrackRaw)[0][0]
    currentTrackTL.index = currentIndex
    currentTrack.set(currentTrackTL);
    return currentTrackTL
  }
}

export async function getPlaylists() {
  // mopidyWS = await connectWS()
  const message = await connectWS()
  console.log("getting playlists", message);
  const playlistsRaw = await mopidyWS.playlists.asList()
  playlistsLocal = playlistsRaw.map(playlistRaw => {
    playlistRaw.slug = playlistRaw.name
    return playlistRaw
  })
  return playlistsLocal
}

export async function getPlaylistTracks(uri) {
  const playlistsTracks = await mopidyWS.playlists.lookup([uri]) 
  if (playlistsTracks) {
    return playlistsTracks
  } else {
    throw new Error("error reading playlists tracks")
  }
}

export async function getCurrentTrackList() {
  const currentTrackList = await mopidyWS.tracklist.getTracks()
  if (currentTrackList) {
    return currentTrackList
  } else {
    throw new Error("Error reading tracklist")
  }
}

export async function getCurrentTlTrackList() {
  // mopidyWS = await connectWS()
  const message = await connectWS()
  console.log("get curren tracklist", message);
  const currentTrackList = await mopidyWS.tracklist.getTlTracks()
  if (currentTrackList) {
    return currentTrackList
  } else {
    throw new Error("Error reading tracklist")
  }
}

export function playTrackSingle(uri) {
  mopidyWS.tracklist.clear()
  if (Array.isArray(uri)) {
    mopidyWS.tracklist.add({tracks: uri})
  } else { 
    mopidyWS.tracklist.add({uris:[uri]})
  }
  mopidyWS.playback.play()
}

export async function addTrackNext(uri) {
  const index = await mopidyWS.tracklist.index()
  mopidyWS.tracklist.add({at_position: index + 1, uris:[uri]})
}

export async function addTrackQueue(uri) {
  mopidyWS.tracklist.add({uris:[uri]})
}

export async function playPlaylist(uri) {
  const playlistInfo = await getPlaylistTracks(uri)
  mopidyWS.tracklist.clear()
  mopidyWS.tracklist.add([playlistInfo.tracks])
  mopidyWS.playback.play()
}

export async function shufflePlaylist(uri) {
  const playlistInfo = await getPlaylistTracks(uri)
  mopidyWS.tracklist.clear()
  mopidyWS.tracklist.add([playlistInfo.tracks])
  mopidyWS.tracklist.shuffle()
  mopidyWS.playback.play()
}

export async function addToQueuePlaylists(uri) {
  const playlistInfo = await getPlaylistTracks(uri)
  mopidyWS.tracklist.add([playlistInfo.tracks])
}

export const setTrackTime = async (currentPlaytimePercent) => {
  const ms = convertPercentToSeconds(currentPlaytimePercent, totalPlaytimeLocal)
  const changed = await mopidyWS.playback.seek([ms])
  if (changed) {
    console.log("[Mopidy]: Set track time", currentPlaytimePercent)
    currentPlaytime.set(ms);
  } else {
    console.log('[Mopidy]: Failed tracktime change', changed, ms)
  }
}

export const playTracklist = (tlTrack) => {
  mopidyWS.playback.play([tlTrack])
}

export const playAllTracks = (uris) => {
  mopidyWS.tracklist.clear()
  mopidyWS.tracklist.add({ uris })
  mopidyWS.playback.play()
}

export const shufflePlayAllTracks = (Tracks, uris) => {
  mopidyWS.tracklist.clear()
  if (Tracks) {
    mopidyWS.tracklist.add([Tracks])
  } else if (uris) {
    mopidyWS.tracklist.add({ uris })
  }
  mopidyWS.tracklist.shuffle()
  mopidyWS.playback.play()
}

export const addTracksQueue = (Tracks, uris) => {
  if (Tracks) {
    mopidyWS.tracklist.add([Tracks])
  } else if (uris) {
    mopidyWS.tracklist.add({ uris })
  }
}

export const loadAlbumImageLocal = async (track) => {
  const host = mopidyHostLocal ? mopidyHostLocal : window.location.hostname;
  const port = mopidyPortLocal ? mopidyPortLocal : window.location.port;
  const protocol = mopidySSLLocal ? mopidySSLLocal : window.location.protocol === 'https:' ? true : false;
  console.log("[Mopidy]: Local searching for ", track);
  const resultsSearch = await mopidyWS.library.search({'query': {'album': [track.album.name]}, 'uris': ['local:']})
  if (resultsSearch.length > 0 && resultsSearch[0].tracks) {
    const images = await mopidyWS.library.getImages({uris: resultsSearch[0].tracks.map(x => x.album.uri)});
    console.log("[Mopidy]: Result ", Object.values(images));
    if (images && Object.values(images) && Object.values(images).length > 0 && Object.values(images)[0].length > 0 && Object.values(images)[0][0].uri) {
      return `http${protocol ? 's' : ''}://${host}:${port}${Object.values(images)[0][0].uri}`
    }
  }
}
