import { writable } from 'svelte/store';
import { PUBLIC_MOPIDY_HOST, PUBLIC_MOPIDY_PORT } from '$env/static/public';

export const mopidy = writable(null);

export const snapcast = writable(null);

export const snapGroups = writable([]);

export const currentTrack = writable({});

export const currentPlaytime = writable(0);

export const currentState = writable(null);

export const currentVolume = writable(null);

export const currentMute = writable(false);

export const currentRandom = writable(false);

export const currentConsume = writable(false);

export const currentRepeat = writable(false);

export const currentSingle = writable(false);

export const totalPlaytime = writable(0);

export const snapClientsVisibility = writable(false);

export const snapClientsEditVisibility = writable(false);

export const albumImage = writable('');

export const playlists = writable([]);

export const mopidyHost = writable(PUBLIC_MOPIDY_HOST ? PUBLIC_MOPIDY_HOST : '');

export const mopidyPort = writable(PUBLIC_MOPIDY_PORT ? PUBLIC_MOPIDY_PORT : '');

export const mopidySSL = writable('');

export const snapcastHost = writable('');

export const snapcastPort = writable('');

export const snapcastSSL = writable('');
