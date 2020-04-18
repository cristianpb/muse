import Mopidy from "mopidy";
import { mopidy, playlists } from '../tools/stores';

let mopidyWS;
let playlistsLocal;

let c = mopidy.subscribe((value) => { mopidyWS = value });

let l = playlists.subscribe((value) => { playlistsLocal = value });

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
      console.log('aLREADY EXISTS', mopidyWS);
      resolve(mopidyWS)
    } else {
      console.log('DONT exist', mopidyWS);
      mopidyWS = new Mopidy({
        webSocketUrl: "ws://10.3.141.129:6680/mopidy/ws/",
        //webSocketUrl: "ws://localhost:6680/mopidy/ws/",
      });
      mopidyWS.on("state:online", () => {
        console.log('CONECTED');
        resolve(mopidyWS);
      })
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
    return playlistRaw
  })
  return playlistsLocal
}

export async function getPlaylistTracks(uri) {
  const playlistsTracks = await mopidyWS.playlists.lookup([uri]) 
  if (playlistsTracks) {
    return playlistsTracks
  } else {
    throw new Error("ii")
  }
}
