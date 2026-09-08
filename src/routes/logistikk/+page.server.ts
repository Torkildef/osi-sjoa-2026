import { SHEET_KEY } from '$lib/config';
import { loadSheet } from '$lib/server/sheet';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ depends, setHeaders }) => {
	depends(SHEET_KEY);
	setHeaders({ 'cache-control': 'public, max-age=30' });
	return { sheet: await loadSheet() };
};
