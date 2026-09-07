import { env } from '$env/dynamic/private';
import { formColumns } from '$lib/config';
import { parseCsvRecords } from './csv';
import { supabaseAdmin } from './supabase';

/** Hvor lenge et hentet regneark regnes som ferskt nok. */
const MIN_INTERVAL_MS = 60_000;

export type SyncResult = {
	status: 'ok' | 'skipped' | 'error';
	message: string;
	rows?: number;
	added?: number;
	updated?: number;
};

/** Finner første kolonne som treffer mønsteret. */
function matchColumn(headers: string[], pattern: RegExp): string | undefined {
	return headers.find((h) => pattern.test(h));
}

/**
 * Stabil tekstform av et svar, uavhengig av nøkkelrekkefølge.
 *
 * Postgres lagrer jsonb med sin egen nøkkelsortering, så et svar som kommer tilbake
 * fra basen har sjelden samme rekkefølge som det vi nettopp leste fra regnearket.
 * Sammenligner vi rå JSON-tekst, ser hver eneste rad endret ut ved hver synk.
 */
function canonical(value: Record<string, string> | null | undefined): string {
	if (!value) return '';
	return JSON.stringify(
		Object.keys(value)
			.sort()
			.map((key) => [key, value[key]])
	);
}

function nonEmpty(value: string | undefined): string | null {
	const trimmed = value?.trim();
	return trimmed ? trimmed : null;
}

async function fetchCsv(url: string): Promise<string> {
	let response: Response;
	try {
		response = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(15_000) });
	} catch (cause) {
		// Rå nettverksfeil fra fetch heter bare «fetch failed», som ikke hjelper noen.
		const reason = cause instanceof Error && cause.name === 'TimeoutError'
			? 'tidsavbrudd etter 15 sekunder'
			: 'fikk ikke kontakt';
		throw new Error(`Klarte ikke å hente regnearket (${reason}). Sjekk at GOOGLE_SHEET_CSV_URL er riktig.`);
	}

	if (!response.ok) {
		throw new Error(
			`Regnearket svarte ${response.status}. Er arket fortsatt publisert på nettet?`
		);
	}

	const text = await response.text();

	// Den vanligste feilen er å lime inn den ordinære regneark-URL-en. Da får vi en
	// HTML-side i stedet for CSV, og en tydelig beskjed er mer verdt enn en parsefeil.
	if (text.trimStart().startsWith('<')) {
		throw new Error(
			'URL-en ga HTML, ikke CSV. Bruk lenken fra Fil → Del → Publiser på nettet, med CSV som format.'
		);
	}

	return text;
}

/**
 * Henter svarene fra regnearket og speiler dem inn i participants.
 *
 * Skjemaet eier hvem som har meldt seg på; appen eier logistikken oppå. Derfor rører
 * synken aldri status, betalt eller notater på en deltaker som allerede finnes – ellers
 * ville en avmelding eller en betalingshake blitt overskrevet ved neste henting.
 */
export async function syncNow(): Promise<SyncResult> {
	const url = env.GOOGLE_SHEET_CSV_URL;
	if (!url) {
		return { status: 'skipped', message: 'GOOGLE_SHEET_CSV_URL er ikke satt.' };
	}

	try {
		const { headers, records } = parseCsvRecords(await fetchCsv(url));
		if (headers.length === 0) return { status: 'ok', message: 'Regnearket er tomt.', rows: 0 };

		const nameCol = matchColumn(headers, formColumns.name);
		const emailCol = matchColumn(headers, formColumns.email);
		const phoneCol = matchColumn(headers, formColumns.phone);
		const accommodationCol = matchColumn(headers, formColumns.accommodation);

		if (!nameCol && !emailCol) {
			throw new Error(
				`Fant verken navn- eller e-postkolonne blant: ${headers.join(', ')}. Juster formColumns i src/lib/config.ts.`
			);
		}

		// Nøkkelen holder synken idempotent. E-post er mest pålitelig; finnes den ikke,
		// er navnet det beste vi har.
		const wanted = new Map<string, Record<string, unknown>>();
		for (const record of records) {
			const email = emailCol ? nonEmpty(record[emailCol]) : null;
			const name = nameCol ? nonEmpty(record[nameCol]) : null;
			const key = (email ?? name)?.toLowerCase();
			if (!key) continue;

			// Svarer noen to ganger, gjelder det siste svaret.
			wanted.set(key, {
				form_key: key,
				name: name ?? email ?? 'Uten navn',
				email,
				phone: phoneCol ? nonEmpty(record[phoneCol]) : null,
				accommodation_preference: accommodationCol ? nonEmpty(record[accommodationCol]) : null,
				form_answers: record,
				source: 'skjema'
			});
		}

		const { data: existing, error: readError } = await supabaseAdmin
			.from('participants')
			.select('id, form_key, name, email, phone, accommodation_preference, form_answers')
			.not('form_key', 'is', null);
		if (readError) throw new Error(readError.message);

		const byKey = new Map((existing ?? []).map((p) => [p.form_key as string, p]));

		const toInsert = [...wanted.values()].filter((row) => !byKey.has(row.form_key as string));

		// Bare rader som faktisk har endret seg skrives tilbake. Uten dette ville hver
		// synk trigget Realtime og fått alle åpne nettlesere til å hente data på nytt.
		const toUpdate = [...wanted.values()].filter((row) => {
			const current = byKey.get(row.form_key as string);
			if (!current) return false;
			return (
				current.name !== row.name ||
				current.email !== row.email ||
				current.phone !== row.phone ||
				current.accommodation_preference !== row.accommodation_preference ||
				canonical(current.form_answers as Record<string, string>) !==
					canonical(row.form_answers as Record<string, string>)
			);
		});

		if (toInsert.length > 0) {
			const { error } = await supabaseAdmin.from('participants').insert(toInsert);
			if (error) throw new Error(error.message);
		}

		for (const row of toUpdate) {
			const current = byKey.get(row.form_key as string)!;
			const { error } = await supabaseAdmin
				.from('participants')
				.update({
					name: row.name,
					email: row.email,
					phone: row.phone,
					accommodation_preference: row.accommodation_preference,
					form_answers: row.form_answers
				})
				.eq('id', current.id);
			if (error) throw new Error(error.message);
		}

		await supabaseAdmin
			.from('form_sync_state')
			.update({
				last_synced_at: new Date().toISOString(),
				last_error: null,
				last_row_count: wanted.size,
				last_added: toInsert.length,
				columns: headers
			})
			.eq('id', true);

		return {
			status: 'ok',
			message: `Hentet ${wanted.size} svar.`,
			rows: wanted.size,
			added: toInsert.length,
			updated: toUpdate.length
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		// Feilen lagres så arrangørene ser den på adminsiden i stedet for i serverloggen.
		await supabaseAdmin
			.from('form_sync_state')
			.update({ last_error: message, last_synced_at: new Date().toISOString() })
			.eq('id', true);
		return { status: 'error', message };
	}
}

/** Hindrer at samtidige forespørsler i samme instans henter regnearket flere ganger. */
let inFlight: Promise<SyncResult> | null = null;

/**
 * Henter nye svar dersom det er en stund siden sist. Kalles ved sidevisning, så
 * oversikten holder seg fersk uten at vi trenger en planlagt jobb.
 *
 * Kaster aldri: en utilgjengelig Google-tjeneste skal ikke ta ned forsiden.
 */
export async function syncIfStale(): Promise<void> {
	if (!env.GOOGLE_SHEET_CSV_URL) return;

	try {
		const { data, error } = await supabaseAdmin
			.from('form_sync_state')
			.select('last_synced_at')
			.eq('id', true)
			.maybeSingle();

		// Klarer vi ikke lese tidsstempelet, synker vi heller én gang for mye: da havner
		// en eventuell feil i form_sync_state der arrangørene ser den, i stedet for å
		// forsvinne i stillhet slik at det ser ut som ingenting er galt.
		if (!error && data?.last_synced_at) {
			if (Date.now() - new Date(data.last_synced_at).getTime() < MIN_INTERVAL_MS) return;
		}

		inFlight ??= syncNow().finally(() => {
			inFlight = null;
		});
		await inFlight;
	} catch {
		// Bevisst stille: syncNow har allerede lagret feilen der arrangørene ser den.
	}
}
