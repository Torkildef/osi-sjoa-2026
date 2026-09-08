export type Reading = { time: string; value: number };

/**
 * Plukker observasjonene ut av svaret fra NVEs HydAPI.
 *
 * Ren funksjon uten nettverk eller SvelteKit-import, slik at den kan testes for seg.
 * Feltnavnene leses defensivt: kommer svaret i en annen form enn ventet, returnerer
 * vi null så kallstedet kan si tydelig fra, framfor å tegne en tom graf.
 */
export function extractReadings(payload: unknown): { readings: Reading[]; unit: string } | null {
	const series = (payload as { data?: unknown[] })?.data?.[0] as
		| { unit?: string; observations?: unknown[] }
		| undefined;
	if (!series || !Array.isArray(series.observations)) return null;

	const readings: Reading[] = [];
	for (const raw of series.observations) {
		const o = raw as Record<string, unknown>;
		const time = o.time ?? o.dateTime ?? o.timeStamp;
		const value = o.value ?? o.correction;
		if (typeof time === 'string' && typeof value === 'number' && Number.isFinite(value)) {
			readings.push({ time, value });
		}
	}

	readings.sort((a, b) => a.time.localeCompare(b.time));
	return { readings, unit: typeof series.unit === 'string' ? series.unit : 'm³/s' };
}
