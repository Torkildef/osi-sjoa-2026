import { loadWater } from '$lib/server/water';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ setHeaders }) => {
	setHeaders({ 'cache-control': 'public, max-age=120' });
	return { water: await loadWater() };
};
