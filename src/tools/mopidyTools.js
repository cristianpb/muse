import Mopidy from "mopidy";
import { mopidy, playlists, currentTrack, currentPlaytime, currentState, currentVolume, currentMute, totalPlaytime, currentRandom } from '../tools/stores';

let mopidyWS;
let playlistsLocal;
let currentPlaytimeLocal;
let totalPlaytimeLocal;
let interval;
let currentTrackLocal

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
      console.log('mopidy:already connected');
      resolve(mopidyWS)
    } else {
      mopidyWS = new Mopidy({
        webSocketUrl: `ws://${window.location.hostname}:6680/mopidy/ws/`,
      });
      mopidyWS.on("state:online", async () => {
        console.log('mopidy: connected');

        const currentTrackTL = await mopidyWS.playback.getCurrentTrack()
        if (currentTrackTL) {
          const currentTrackRaw = await mopidyWS.library.lookup([[currentTrackTL.uri]])
          currentTrackLocal = Object.values(currentTrackRaw)[0][0]
          currentTrack.set(currentTrackLocal);
        }

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

        if (currentTrackLocal) {
          const totalPlaytimeLocal = currentTrackLocal.length
          totalPlaytime.set(currentTrackLocal.length)
          if (currentStateLocal === 'playing') {
            interval = setInterval(() => {
              if (currentPlaytimeLocal >= totalPlaytimeLocal) clearInterval(interval)
              //currentPlaytimeLocal = currentPlaytimeLocal + 1000
              currentPlaytime.update(v => v + 1000)
            }, 1000);
          }
        }
        resolve(mopidyWS);
      })

      mopidyWS.on("state", console.log);
      mopidyWS.on("event", console.log);

      mopidyWS.on("event:trackPlaybackEnded", (event) => {
        console.log(`mopidy:event:trackPlaybackEnded: ${event}`);
        let { tl_track, time_position } = event
        clearInterval(interval);
        currentPlaytime.set(time_position)
      })

      mopidyWS.on("event:trackPlaybackPaused", (event) => {
        console.log(`mopidy:event:trackPlaybackPaused: ${event}`);
        let { time_position, tl_track } = event
        clearInterval(interval);
        currentPlaytime.set(time_position)
      })


      mopidyWS.on("event:playbackStateChanged", (event) => {
        console.log(`mopidy:event:playbackStateChanged: ${event}`);
        let { old_state, new_state } = event
        currentState.set(new_state)
        if (new_state == 'paused') {
          clearInterval(interval);
        } if (new_state == 'playing') {
          interval = setInterval(() => {
            if (currentPlaytimeLocal >= totalPlaytimeLocal) clearInterval(interval)
            currentPlaytime.update(v => v + 1000)
          }, 1000);
        }
      })

      mopidyWS.on("event:trackPlaybackStarted", (event) => {
        console.log(`mopidy:event:trackPlaybackStarted: ${event}`);
        let { tl_track } = event
        currentTrack.set(tl_track.track)
        currentPlaytime.set(0)
        if (tl_track.track.length) {
          totalPlaytime.set(tl_track.track.length)
        }
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

export async function getPlaylists() {
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
    return currentTrackList
  } else {
    throw new Error("Error reading tracklist")
  }
}

export async function getRandomMode() {
  const mopidyWS = await connectWS()
  const randomMode = await mopidyWS.tracklist.getRandom()
    return randomMode
}
