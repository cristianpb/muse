// import { playlists } from '../../../lib/tools/stores';
import { error } from "@sveltejs/kit";
import {
  getPlaylists,
  getPlaylistTracks,
} from "../../../lib/tools/mopidyTools";

const loadTracks = async (slug) => {
  try {
    const playlists = await getPlaylists();
    if (playlists !== undefined && playlists.length > 0) {
      const selectedPlaylist = playlists.find(
        (playlist) => playlist.name === slug,
      );
      if (selectedPlaylist) {
        const playlistsTracks = await getPlaylistTracks(selectedPlaylist.uri);
        return {
          playlistsTracks,
          selectedPlaylist,
        };
      }
    }
  } catch (e) {
    return {
      playlistsTracks: [],
      selectedPlaylist: "",
    };
  }
};

/** @type {import('./$types').PageLoad} */
export async function load({ params }) {
  const res = await loadTracks(params.slug);
  if ("tracks" in res.playlistsTracks) {
    return {
      playlistsTracks: res.playlistsTracks,
      selectedPlaylist: res.selectedPlaylist,
      slug: params.slug,
    };
  }

  error(404, "Page not found");
}
