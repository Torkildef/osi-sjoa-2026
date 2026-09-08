import { env } from '$env/dynamic/private';
import { parseCsvRecords } from './csv';
import { buildRoster, type Roster } from '$lib/roster';

export type SheetResult =
	| { status: 'ok'; roster: Roster; fetchedAt: string }
	| { status: 'unconfigured' }
	| { status: 'error'; message: string };

/**
 * Henter det publiserte regnearket og bygger tabellen.
 *
 * Hentingen skjer på serveren, ikke i nettleseren: da slipper vi CORS, og
 * regneark-URL-en blir ikke liggende synlig i frontend-koden.
 */
export async function loadSheet(): Promise<SheetResult> {
	const url = env.GOOGLE_SHEET_CSV_URL;
	if (!url) return { status: 'unconfigured' };

	let response: Response;
	try {
		// Google svarer med en omdirigering til googleusercontent, så den må følges.
		response = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(15_000) });
	} catch (cause) {
		const reason =
			cause instanceof Error && cause.name === 'TimeoutError'
				? 'tidsavbrudd etter 15 sekunder'
				: 'fikk ikke kontakt';
		return {
			status: 'error',
			message: `Klarte ikke å hente regnearket (${reason}). Sjekk at GOOGLE_SHEET_CSV_URL er riktig.`
		};
	}

	if (!response.ok) {
		return {
			status: 'error',
			message: `Regnearket svarte ${response.status}. Er arket fortsatt publisert på nettet?`
		};
	}

	const text = await response.text();

	// Den vanligste tabben er å lime inn den ordinære regneark-URL-en. Da får vi en
	// innloggingsside i HTML, og en tydelig beskjed er mer verdt enn en parsefeil.
	if (text.trimStart().startsWith('<')) {
		return {
			status: 'error',
			message:
				'URL-en ga HTML, ikke CSV. Bruk lenken fra Fil → Del → Publiser på nettet, med CSV som format.'
		};
	}

	const { headers, records } = parseCsvRecords(text);
	if (headers.length === 0) {
		return { status: 'error', message: 'Regnearket er tomt.' };
	}

	return {
		status: 'ok',
		roster: buildRoster(headers, records),
		fetchedAt: new Date().toISOString()
	};
}
