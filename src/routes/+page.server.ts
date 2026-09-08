import { SHEET_KEY } from '$lib/config';
import { loadSheet } from '$lib/server/sheet';
import { loadWater } from '$lib/server/water';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ depends, setHeaders }) => {
	depends(SHEET_KEY);
	setHeaders({ 'cache-control': 'public, max-age=30' });
	// Begge kildene hentes samtidig; forsiden skal ikke vente på NVE før den viser påmeldte.
	const [sheet, water] = await Promise.all([loadSheet(), loadWater()]);
	return { sheet, water };
};
