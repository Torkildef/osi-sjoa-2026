import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

/** Kartsiden het Heidal før. Lenker som er delt ut skal fortsatt virke. */
export const load: PageServerLoad = ({ url }) => {
	redirect(301, `/kart${url.search}`);
};
