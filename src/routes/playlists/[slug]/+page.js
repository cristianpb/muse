// import { playlists } from '../../../lib/tools/stores';
import { error } from "@sveltejs/kit";
import { getPlaylists } from "../../../lib/tools/mopidyTools";

const selectPlaylist = async (slug) => {
  try {
    const playlists = await getPlaylists();
    if (playlists !== undefined && playlists.length > 0) {
      const selectedPlaylist = playlists.find(
        (playlist) => playlist.name === slug,
      );
      return selectedPlaylist;
    }
  } catch (e) {
    return "";
  }
};

/** @type {import('./$types').PageLoad} */
export async function load({ params }) {
  const selectedPlaylist = await selectPlaylist(params.slug);
  if (selectedPlaylist != "") {
    return {
      selectedPlaylist,
      slug: params.slug,
    };
  }

  error(404, "Page not found");
}
