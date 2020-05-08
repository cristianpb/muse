import { writable } from 'svelte/store';

export const mopidy = writable(null);

export const snapcast = writable(null);

export const snapGroups = writable([]);

export const currentTrack = writable({});

export const currentPlaytime = writable(0);

export const currentState = writable(null);

export const currentVolume = writable(null);

export const currentMute = writable(false);

export const currentRandom = writable(false);

export const totalPlaytime = writable(0);

export const snapClientsVisibility = writable(false);

export const albumImage = writable({});

export const playlists = writable([]);
