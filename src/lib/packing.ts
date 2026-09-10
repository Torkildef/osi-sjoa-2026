/** Pakkelista på forsiden. Avkryssingen lagres i nettleseren til den som krysser av. */
export type PackingItem = { id: string; label: string; note?: string; emoji: string };

export const packing: PackingItem[] = [
	{ id: 'klaer', label: 'Vanlige klær', emoji: '👕' },
	{ id: 'varmt', label: 'Varme klær', emoji: '🧥' },
	{ id: 'handkle', label: 'Håndkle', emoji: '🧺' },
	{ id: 'toalett', label: 'Toalettsaker', emoji: '🪥' },
	{ id: 'badetoy', label: 'Badetøy', note: 'Om du vil i stampen', emoji: '🩳' },
	{ id: 'kajakk', label: 'Kajakkutstyr', emoji: '🛶' },
	{ id: 'sko', label: 'Skitne sko', note: 'Til booty', emoji: '👟' },
	{ id: 'humor', label: 'Godt humør', emoji: '😄' },
	{ id: 'mat', label: 'Mat og drikke', note: 'Kan også fikses på vei opp og lørdag', emoji: '🍔🍺' }
];

export const PACKING_KEY = 'sjoa:pakkeliste';
