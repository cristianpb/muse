import Mopidy from "mopidy";
import { mopidy, playlists, currentTrack, currentPlaytime, currentState, currentVolume, currentMute, totalPlaytime, currentRandom } from './stores';
import { loadAlbumImage }  from './lastfm';

let mopidyWS;
let playlistsLocal;
let currentPlaytimeLocal;
let totalPlaytimeLocal;
let interval;
let connecting = false

const c = mopidy.subscribe((value) => { mopidyWS = value });
const l = playlists.subscribe((value) => { playlistsLocal = value });
const p = currentPlaytime.subscribe((value) => { currentPlaytimeLocal = value });
const tt = totalPlaytime.subscribe((value) => { totalPlaytimeLocal = value });

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

export function connectWS() {
  return new Promise(function(resolve, reject) {
    if (mopidyWS) {
      if (connecting) {
        console.log('Waiting for connection');
        setTimeout(() => {
          console.log('mopidy:already connected');
          resolve(mopidyWS)
        }, 1000)
      } else {
        resolve(mopidyWS)
      }
    } else {
      connecting = true;
      mopidyWS = new Mopidy({
        webSocketUrl: `ws://${window.location.hostname}:6680/mopidy/ws/`,
      });
      mopidyWS.on("state:online", async () => {
        console.log('mopidy: connected');

        const currentTrackTL = await upgradeCurrentTrack()
        currentPlaytimeLocal = await mopidyWS.playback.getTimePosition()
        const currentStateLocal = await mopidyWS.playback.getState()
        const currentVolumeLocal = await mopidyWS.mixer.getVolume()
        const currentMuteLocal = await mopidyWS.mixer.getMute()
        const currentRandomLocal = await mopidyWS.tracklist.getRandom()

        currentPlaytime.set(currentPlaytimeLocal);
        currentState.set(currentStateLocal);
        currentVolume.set(currentVolumeLocal);
        currentMute.set(currentMuteLocal);
        currentRandom.set(currentRandomLocal);

        if (currentTrackTL) {
          const totalPlaytimeLocal = currentTrackTL.track.length
          totalPlaytime.set(currentTrackTL.track.length)
          if (currentStateLocal === 'playing') {
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
        resolve(mopidyWS);
      })

      mopidyWS.on("state", console.log);
      mopidyWS.on("event", console.log);

      mopidyWS.on("event:trackPlaybackEnded", (event) => {
        let { tl_track, time_position } = event
        clearInterval(interval);
        currentPlaytime.set(time_position)
      })

      mopidyWS.on("event:trackPlaybackPaused", (event) => {
        let { time_position, tl_track } = event
        clearInterval(interval);
        currentPlaytime.set(time_position)
      })


      mopidyWS.on("event:playbackStateChanged", (event) => {
        let { old_state, new_state } = event
        currentState.set(new_state)
        if (new_state == 'paused') {
          clearInterval(interval);
        } if (new_state == 'playing') {
          interval = setInterval(() => {
            if (currentPlaytimeLocal >= totalPlaytimeLocal) {
              clearInterval(interval)
            } else {
              currentPlaytime.update(v => v + 1000)
            }
          }, 1000);
        }
      })

      mopidyWS.on("event:trackPlaybackStarted", async (_) => {
        currentPlaytime.set(0)
        const currentTrackTL = await upgradeCurrentTrack()
        const totalPlaytimeLocal = currentTrackTL.track.length
        totalPlaytime.set(currentTrackTL.track.length)
        loadAlbumImage()
        if (!interval) {
          interval = setInterval(() => {
            if (currentPlaytimeLocal >= totalPlaytimeLocal) clearInterval(interval)
            currentPlaytime.update(v => v + 1000)
          }, 1000);
        }
      });

      mopidyWS.on("error", (err) => {
        reject(err);
      });

    }

  });
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
  mopidyWS = await connectWS()
  const playlistsRaw = await mopidyWS.playlists.asList()
  playlistsLocal = playlistsRaw.map(playlistRaw => {
    playlistRaw.slug = playlistRaw.name
    playlistRaw.visibility = false
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
    return currentTrackList.map(x => {
      x.visibility = false
      return x
    })
  } else {
    throw new Error("Error reading tracklist")
  }
}

export async function getCurrentTlTrackList() {
  const currentTrackList = await mopidyWS.tracklist.getTlTracks()
  if (currentTrackList) {
    return currentTrackList.map(x => {
      x.visibility = false
      return x
    })
  } else {
    throw new Error("Error reading tracklist")
  }
}

export async function getRandomMode() {
  mopidyWS = await connectWS()
  const randomMode = await mopidyWS.tracklist.getRandom()
    return randomMode
}


export function playTrackSingle(uri) {
  mopidyWS.tracklist.clear()
  mopidyWS.tracklist.add({uris:[uri]})
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
