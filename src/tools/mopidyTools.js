import Mopidy from "mopidy";
import { mopidy, playlists, currentTrack, currentPlaytime, currentState, currentVolume, currentMute, totalPlaytime, currentRandom } from '../tools/stores';

let mopidyWS;
let playlistsLocal;
//let currentTrackLocal;
let currentPlaytimeLocal;
let totalPlaytimeLocal;
//let currentStateLocal;
//let currentVolumeLocal;
//let currentMuteLocal;
let interval;

const c = mopidy.subscribe((value) => { mopidyWS = value });
const l = playlists.subscribe((value) => { playlistsLocal = value });
//const t = currentTrack.subscribe((value) => { currentTrackLocal = value });
const p = currentPlaytime.subscribe((value) => { currentPlaytimeLocal = value });
const tt = totalPlaytime.subscribe((value) => { totalPlaytimeLocal = value });
//const s = currentState.subscribe((value) => { currentStateLocal = value });
//const v = currentVolume.subscribe((value) => { currentVolumeLocal = value });
//const m = currentMute.subscribe((value) => { currentMuteLocal = value });

export function convertSencondsToString(ms) {
  let minutes = ~~(ms / 60000)
  let seconds = `${~~((ms / 1000) % 60)}`
  return `${minutes}:${seconds.padStart(2, '0')}`
}

export function normalizeTime(current, total) {
  let norm = ((current / total ) * 100)
  return norm
}

export function connectWS() {
  return new Promise(function(resolve, reject) {
    if (mopidyWS) {
      console.log('already con');
      resolve(mopidyWS)
    } else {
      mopidyWS = new Mopidy({
        webSocketUrl: "ws://10.3.141.129:6680/mopidy/ws/",
        //webSocketUrl: "ws://localhost:6680/mopidy/ws/",
      });
      mopidyWS.on("state:online", async () => {
        console.log('CONECTED');

        const currentTrackTL = await mopidyWS.playback.getCurrentTrack()
        const currentTrackRaw = await mopidyWS.library.lookup([[currentTrackTL.uri]])
        const currentTrackLocal = Object.values(currentTrackRaw)[0][0]
        //const currentPlaytimeLocal = await mopidyWS.playback.getTimePosition()
        currentPlaytimeLocal = await mopidyWS.playback.getTimePosition()
        const currentStateLocal = await mopidyWS.playback.getState()
        const currentVolumeLocal = await mopidyWS.mixer.getVolume()
        const currentMuteLocal = await mopidyWS.mixer.getMute()
        const currentRandomLocal = await mopidyWS.tracklist.getRandom()

        currentTrack.set(currentTrackLocal);
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
              if (currentPlaytimeLocal > totalPlaytimeLocal) clearInterval(interval)
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
        console.log("Ended", event);
        let { tl_track, time_position } = event
        clearInterval(interval);
        //$currentPlaytime = 0
        currentPlaytime.set(time_position)
      })

      mopidyWS.on("event:trackPlaybackPaused", (event) => {
        console.log("Pauseed", event);
        let { time_position, tl_track } = event
        clearInterval(interval);
        console.log("Setting to", time_position);
        currentPlaytime.set(time_position)
        //$currentPlaytime = 0
        //currentPlaytime.set(0)
      })


      mopidyWS.on("event:playbackStateChanged", (event) => {
        let { old_state, new_state } = event
        //$currentState = new_state
        currentState.set(new_state)
        if (new_state == 'paused') {
          clearInterval(interval);
        } if (new_state == 'playing') {
          interval = setInterval(() => {
            //if ($currentPlaytime > $totalPlaytime) clearInterval(interval)
            if (currentPlaytimeLocal > totalPlaytimeLocal) clearInterval(interval)
            //$currentPlaytime = $currentPlaytime + 1000
            currentPlaytime.update(v => v + 1000)
          }, 1000);
        }
      })

      mopidyWS.on("event:trackPlaybackStarted", (event) => {
        console.log("Start", event);
        let { tl_track } = event
        //$currentTrack = tl_track.track
        currentTrack.set(tl_track.track)
        //BROKEN
        //$totalPlaytime = tl_track.track.length
        //totalPlaytime.set(tl_track.track.length)

        //$currentPlaytime = 0
        currentPlaytime.set(0)
        //interval = setInterval(() => {
        //  //if ($currentPlaytime > $totalPlaytime) clearInterval(interval)

        //  if (currentPlaytimeLocal > totalPlaytimeLocal) clearInterval(interval)
        //  //$currentPlaytime = $currentPlaytime + 1000
        //  currentPlaytime.update(v => v + 1000)
        //}, 1000);
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
