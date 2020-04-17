import { writable } from 'svelte/store';

export const clients = writable([]);

export const currentTrack = writable({});

export const currentPlaytime = writable(0);

export const totalPlaytime = writable(0);

export const snapClientsVisibility = writable(false);
