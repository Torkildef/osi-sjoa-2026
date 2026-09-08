import { SHEET_KEY } from '$lib/config';
import { loadSheet } from '$lib/server/sheet';
import { loadWater } from '$lib/server/water';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ depends, setHeaders }) => {
	depends(SHEET_KEY);

	// Google cacher det publiserte arket noen minutter uansett; en kort egen cache
	// hindrer at hver besøkende utløser en ny henting.
	setHeaders({ 'cache-control': 'public, max-age=30' });

	// De to kildene er uavhengige, så de hentes samtidig. Feiler den ene, viser
	// siden fortsatt den andre.
	const [sheet, water] = await Promise.all([loadSheet(), loadWater()]);
	return { sheet, water };
};
