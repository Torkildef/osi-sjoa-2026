/**
 * Alle tidspunkter på turen er norsk tid, uansett hvor de blir formatert.
 *
 * Uten dette ville serveren (Vercel kjører i UTC) og nettleseren vist forskjellig
 * klokkeslett for samme avreise, og et tidspunkt skrevet inn i admin ville blitt
 * lagret to timer feil om sommeren.
 */
export const TRIP_TIMEZONE = 'Europe/Oslo';

const parts = new Intl.DateTimeFormat('en-US', {
	timeZone: TRIP_TIMEZONE,
	hour12: false,
	year: 'numeric',
	month: '2-digit',
	day: '2-digit',
	hour: '2-digit',
	minute: '2-digit',
	second: '2-digit'
});

/** Hvor mange millisekunder norsk tid ligger foran UTC på et gitt tidspunkt. */
function offsetMs(instant: Date): number {
	const p = Object.fromEntries(parts.formatToParts(instant).map((x) => [x.type, x.value]));
	const wallClock = Date.UTC(
		Number(p.year),
		Number(p.month) - 1,
		Number(p.day),
		Number(p.hour) % 24,
		Number(p.minute),
		Number(p.second)
	);
	return wallClock - instant.getTime();
}

/**
 * Gjør «2026-06-18T09:00» fra <input type="datetime-local"> om til et UTC-tidspunkt,
 * tolket som norsk tid. Returnerer null for tom eller ugyldig input.
 *
 * Vi regner offset to ganger fordi offsetet avhenger av tidspunktet vi leter etter:
 * første runde gir et godt nok anslag til at andre runde treffer riktig side av en
 * sommertidsovergang.
 */
export function localInputToIso(value: string): string | null {
	if (!value) return null;
	const guess = new Date(`${value.length === 16 ? `${value}:00` : value}Z`);
	if (Number.isNaN(guess.getTime())) return null;
	const firstPass = new Date(guess.getTime() - offsetMs(guess));
	const result = new Date(guess.getTime() - offsetMs(firstPass));
	return Number.isNaN(result.getTime()) ? null : result.toISOString();
}

/** Motsatt vei: et lagret tidspunkt som norsk veggklokke, «2026-06-18T09:00». */
export function isoToLocalInput(value: string | null): string {
	if (!value) return '';
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return '';
	const p = Object.fromEntries(parts.formatToParts(date).map((x) => [x.type, x.value]));
	return `${p.year}-${p.month}-${p.day}T${String(Number(p.hour) % 24).padStart(2, '0')}:${p.minute}`;
}
