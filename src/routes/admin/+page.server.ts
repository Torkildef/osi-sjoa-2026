import { createHmac, timingSafeEqual } from 'node:crypto';
import { env } from '$env/dynamic/private';
import { fail, type Actions } from '@sveltejs/kit';
import {
	createPromptIssue,
	githubConfigured,
	listPromptIssues,
	promptsLastHour
} from '$lib/server/github';
import type { PageServerLoad } from './$types';

/**
 * /admin: ett tekstfelt der arrangørene skriver prompter til Claude.
 *
 * Passordet sjekkes her på serveren. Den som har det, får en signert cookie og
 * kan sende inn prompter. Hver prompt blir et GitHub-issue med merkelappen
 * «prompt», som en Routine i Claude Code tar hver time.
 *
 * Grensene under er bremser, ikke sikkerhet: den som har passordet, kan be om
 * hva som helst. Det er Claudes regler og CI-vakten som avgjør hva som slipper inn.
 */

const COOKIE = 'sjoa_admin';
const MAX_PROMPT = 2000;
const MAX_PER_HOUR = 5;

/** Cookie-verdien: HMAC av en fast streng med passordet som nøkkel. */
const token = () => createHmac('sha256', env.ADMIN_PASSWORD ?? '').update('sjoa-admin-v1').digest('hex');

function safeEqual(a: string, b: string): boolean {
	const x = Buffer.from(a);
	const y = Buffer.from(b);
	return x.length === y.length && timingSafeEqual(x, y);
}

const configured = () => Boolean(env.ADMIN_PASSWORD) && githubConfigured();

const loggedIn = (cookie: string | undefined) =>
	Boolean(env.ADMIN_PASSWORD) && cookie !== undefined && safeEqual(cookie, token());

export const load: PageServerLoad = async ({ cookies, setHeaders }) => {
	setHeaders({ 'cache-control': 'no-store' });
	const ok = loggedIn(cookies.get(COOKIE));
	let recent: Awaited<ReturnType<typeof listPromptIssues>> = [];
	let listError: string | null = null;
	if (ok) {
		try {
			recent = await listPromptIssues();
		} catch (e) {
			listError = e instanceof Error ? e.message : 'Klarte ikke å hente promptene.';
		}
	}
	return { configured: configured(), loggedIn: ok, recent, listError };
};

export const actions: Actions = {
	login: async ({ request, cookies }) => {
		if (!configured()) return fail(503, { error: 'Admin er ikke satt opp ennå.', name: '', prompt: '' });
		const form = await request.formData();
		const password = String(form.get('password') ?? '');
		if (!password || !safeEqual(password, env.ADMIN_PASSWORD ?? '')) {
			return fail(401, { error: 'Feil passord.', name: '', prompt: '' });
		}
		cookies.set(COOKIE, token(), {
			path: '/admin',
			httpOnly: true,
			secure: true,
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 30
		});
		return { ok: true };
	},

	logout: async ({ cookies }) => {
		cookies.delete(COOKIE, { path: '/admin' });
		return { ok: true };
	},

	submit: async ({ request, cookies }) => {
		if (!loggedIn(cookies.get(COOKIE))) return fail(401, { error: 'Logg inn først.', name: '', prompt: '' });

		const form = await request.formData();
		const name = String(form.get('name') ?? '').trim().slice(0, 60);
		const prompt = String(form.get('prompt') ?? '').trim();

		if (!name) {
			return fail(400, { error: 'Skriv hvem du er, så vi vet hvem som ba om hva.', name, prompt });
		}
		if (prompt.length < 10) return fail(400, { error: 'Skriv litt mer – minst ti tegn.', name, prompt });
		if (prompt.length > MAX_PROMPT) {
			return fail(400, { error: `Maks ${MAX_PROMPT} tegn. Del den opp.`, name, prompt });
		}

		try {
			if ((await promptsLastHour()) >= MAX_PER_HOUR) {
				return fail(429, {
					error: `Maks ${MAX_PER_HOUR} prompter i timen. Prøv igjen litt senere.`,
					name,
					prompt
				});
			}
			const issue = await createPromptIssue(name, prompt);
			return { ok: true, issue, name };
		} catch (e) {
			return fail(502, { error: e instanceof Error ? e.message : 'Noe gikk galt mot GitHub.', name, prompt });
		}
	}
};
