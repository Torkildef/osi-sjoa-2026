import { redirect } from '@sveltejs/kit';
import { signupFormUrl } from '$lib/config';
import type { PageServerLoad } from './$types';

/**
 * Påmelding skjer i Google-skjemaet. Ruten beholdes som viderekobling, slik at
 * lenker som allerede er delt ut i klubben fortsatt lander riktig sted.
 */
export const load: PageServerLoad = () => {
	redirect(307, signupFormUrl);
};
