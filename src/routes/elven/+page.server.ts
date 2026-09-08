import { loadWater } from '$lib/server/water';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ setHeaders }) => {
	// NVE oppdaterer timesverdier, så en kort cache sparer kall uten å bli gammel.
	setHeaders({ 'cache-control': 'public, max-age=120' });
	return { water: await loadWater() };
};
