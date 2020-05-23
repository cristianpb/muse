import { currentTrack, albumImage } from './stores';

let currentTrackLocal

const t = currentTrack.subscribe((value) => { currentTrackLocal = value });

export const loadAlbumImage = async () => {
  console.log("[Lastfm]: Searching album for ", currentTrackLocal.track);
  if (currentTrackLocal.track && currentTrackLocal.track.album) {
    const res = await fetch(`https://ws.audioscrobbler.com/2.0/?format=json&method=album.getInfo&album=${currentTrackLocal.track.album.name}&artist=${currentTrackLocal.track.artists[0].name}&api_key=12bbc4850d7cb77e2842f0a2f7bcc2e3`)
    const lastfm = await res.json()
    console.log("[Lastfm]: Result information", lastfm);
    if (lastfm && lastfm.album) {
      const image = lastfm.album.image.find(x => x.size === 'extralarge')
      albumImage.set(image);
    }
  }
}
