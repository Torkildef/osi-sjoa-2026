import { error } from '@sveltejs/kit';
import { runs } from '$lib/runs';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	const run = runs.find((r) => String(r.n) === params.n);
	if (!run) error(404, 'Det finnes ikke noe run med det nummeret.');
	return { run };
};
