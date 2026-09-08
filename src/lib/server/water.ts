import { env } from '$env/dynamic/private';
import { water } from '$lib/config';
import { extractReadings, type Reading } from '$lib/nve';

export type { Reading };

export type WaterResult =
	| { status: 'ok'; readings: Reading[]; unit: string; fetchedAt: string }
	| { status: 'unconfigured' }
	| { status: 'error'; message: string };

/** Henter vannføringen for de siste `water.hours` timene fra NVEs HydAPI. */
export async function loadWater(): Promise<WaterResult> {
	const key = env.NVE_API_KEY;
	if (!key) return { status: 'unconfigured' };

	const url = new URL('https://hydapi.nve.no/api/v1/Observations');
	url.searchParams.set('StationId', water.stationId);
	url.searchParams.set('Parameter', String(water.parameter));
	url.searchParams.set('ResolutionTime', '60'); // timesoppløsning
	url.searchParams.set('ReferenceTime', `P${Math.ceil(water.hours / 24)}D/`);

	let response: Response;
	try {
		response = await fetch(url, {
			headers: { 'X-API-Key': key, Accept: 'application/json' },
			signal: AbortSignal.timeout(12_000)
		});
	} catch (cause) {
		const reason =
			cause instanceof Error && cause.name === 'TimeoutError' ? 'tidsavbrudd' : 'fikk ikke kontakt';
		return { status: 'error', message: `Nådde ikke NVE (${reason}).` };
	}

	if (response.status === 401 || response.status === 403) {
		return { status: 'error', message: 'NVE avviste API-nøkkelen. Sjekk NVE_API_KEY.' };
	}
	if (!response.ok) {
		return { status: 'error', message: `NVE svarte ${response.status}.` };
	}

	let payload: unknown;
	try {
		payload = await response.json();
	} catch {
		return { status: 'error', message: 'NVE svarte med noe annet enn JSON.' };
	}

	const extracted = extractReadings(payload);
	if (!extracted) {
		return { status: 'error', message: 'Fant ingen observasjoner i svaret fra NVE.' };
	}

	// Serien kan strekke seg litt lenger tilbake enn vi vil vise, siden ReferenceTime
	// bare tar hele døgn.
	const cutoff = Date.now() - water.hours * 3600_000;
	const readings = extracted.readings.filter((r) => new Date(r.time).getTime() >= cutoff);

	if (readings.length === 0) {
		return { status: 'error', message: 'NVE har ingen målinger for de siste døgnene.' };
	}

	return {
		status: 'ok',
		readings,
		unit: extracted.unit,
		fetchedAt: new Date().toISOString()
	};
}
