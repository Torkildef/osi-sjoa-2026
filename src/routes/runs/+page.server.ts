import { fail, type Actions } from '@sveltejs/kit';
import { everyone } from '$lib/runs';
import { cookieOk, cookieToken, passwordConfigured, passwordOk } from '$lib/server/adminAuth';
import {
	LOGISTICS_LABEL,
	createLogisticsIssue,
	githubConfigured,
	promptsLastHour
} from '$lib/server/github';
import type { PageServerLoad } from './$types';

/**
 * /runs: deltakerne velger seg selv og skriver hva som bør endres i
 * lørdagsplanen. Hvert ønske blir et GitHub-issue med merkelappen
 * «logistikk», som Routinen tar hver time og legger inn i src/lib/runs.ts
 * hvis det ikke er noe åpenbart galt med det.
 *
 * Samme passord som /admin. Den som har det, kan også be om endringer på
 * vegne av andre. Passordet huskes i en cookie for /runs i 30 dager.
 */

const COOKIE = 'sjoa_runs';
const SCOPE = 'runs';
const MAX_TEXT = 500;
const MAX_PER_HOUR = 10;

const configured = () => passwordConfigured() && githubConfigured();

export const load: PageServerLoad = async ({ cookies, setHeaders }) => {
	setHeaders({ 'cache-control': 'no-store' });
	return { configured: configured(), loggedIn: cookieOk(SCOPE, cookies.get(COOKIE)) };
};

export const actions: Actions = {
	submit: async ({ request, cookies }) => {
		if (!configured()) {
			return fail(503, { error: 'Innsending er ikke satt opp ennå.', name: '', text: '' });
		}

		const form = await request.formData();
		const name = String(form.get('name') ?? '').trim();
		const text = String(form.get('text') ?? '').trim();
		const password = String(form.get('password') ?? '');
		// Honningkrukke: feltet er skjult for folk, bare roboter fyller det ut.
		if (String(form.get('nettside') ?? '')) return { ok: true, name, issue: null };

		if (!everyone.includes(name)) {
			return fail(400, { error: 'Velg deg selv først.', name, text });
		}
		if (text.length < 10) return fail(400, { error: 'Skriv litt mer – minst ti tegn.', name, text });
		if (text.length > MAX_TEXT) {
			return fail(400, { error: `Maks ${MAX_TEXT} tegn. Hold det kort.`, name, text });
		}

		const hasCookie = cookieOk(SCOPE, cookies.get(COOKIE));
		if (!hasCookie) {
			if (!password) return fail(401, { error: 'Skriv passordet. Spør arrangørene hvis du ikke har det.', name, text });
			if (!passwordOk(password)) return fail(401, { error: 'Feil passord.', name, text });
			cookies.set(COOKIE, cookieToken(SCOPE), {
				path: '/runs',
				httpOnly: true,
				secure: true,
				sameSite: 'lax',
				maxAge: 60 * 60 * 24 * 30
			});
		}

		try {
			if ((await promptsLastHour(LOGISTICS_LABEL)) >= MAX_PER_HOUR) {
				return fail(429, {
					error: `Maks ${MAX_PER_HOUR} ønsker i timen. Prøv igjen litt senere.`,
					name,
					text
				});
			}
			const issue = await createLogisticsIssue(name, text);
			return { ok: true, issue, name };
		} catch (e) {
			return fail(502, {
				error: e instanceof Error ? e.message : 'Noe gikk galt mot GitHub.',
				name,
				text
			});
		}
	}
};
