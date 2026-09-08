/** Nøkkelinfo om turen. Rediger her når datoer eller pris endrer seg. */
export const trip = {
	title: 'Sjoa 2026',
	organiser: 'OSI Elvepadling',
	dates: '11.–13. september 2026',
	/** ISO-dato for første og siste dag. Brukes til nedtellingen på forsiden. */
	start: '2026-09-11',
	end: '2026-09-13',
	location: 'Heidal',
	base: 'Kruke gård',
	contact: 'elvepadling@osi.no'
};

/** Påmeldingsskjemaet deltakerne fyller ut. Lenken finner du under «Send» i skjemaet. */
export const signupFormUrl =
	'https://docs.google.com/forms/d/19i0fHqvw2-G-bMH52c2bc6aKSgigdarxCiOeoCCIsiE/viewform';

/**
 * Kolonner som ikke vises noe sted. Kontaktopplysninger holdes utenfor fordi siden
 * ligger åpent på nettet; tidsmerke og medlemsspørsmål er støy i en oversikt.
 */
export const hiddenColumns: RegExp[] = [
	/e-?post|e-?mail/i,
	/telefon|mobil|\btlf\b|phone/i,
	/tidsmerke|timestamp/i,
	/member of the club|medlem i klubben|er du medlem/i
];

/**
 * Kolonner om å ikke rekke det planlagte tidspunktet.
 *
 * Står for seg fordi både rollevalget og merkelappen må bruke nøyaktig samme
 * mønster. «Can you not make the planned departure?» inneholder ordet «departure»,
 * og ville ellers blitt lest som spørsmålet om når man drar.
 */
const ABSENCE =
	/kan(\s+\w+)?\s+ikke|ikke m(ø|o)te|not (make|meet|come|able)|unable to|cannot|can.?not|annet tidspunkt|different time|avvik/i;

/**
 * Hvilken kolonne i regnearket som fyller hvilken rolle i oversikten.
 *
 * Hver rolle tar den første kolonnen som treffer et av mønstrene sine, og en kolonne
 * kan bare fylle én rolle. Rekkefølgen under er derfor viktig: de presise rollene
 * plukker først, slik at «Antall plasser i bilen» blir seter og ikke havner på den
 * mer generelle bil-rollen.
 *
 * Treffer ingen kolonne en rolle, faller den bare bort fra tabellen. Ingenting
 * forsvinner – alle kolonner ligger fortsatt i detaljene til hver deltaker.
 */
export const fieldPatterns: { role: string; patterns: RegExp[] }[] = [
	{ role: 'name', patterns: [/^navn$|^name$|\bfullt navn\b|full name|ditt navn|your name/i] },
	{ role: 'towHitch', patterns: [/hengerfeste|tilhenger|\bhenger\b|tow.?hitch|\bhitch\b/i] },
	{ role: 'roofRack', patterns: [/takstativ|takboks|roof.?rack|\broof\b/i] },
	{ role: 'seats', patterns: [/plass|sete|seat/i] },
	{
		role: 'borrowedGear',
		patterns: [/l(å|a)ne|borrow|\butstyr\b|\bgear\b|equipment|trenger.*(kajakk|padle|drakt)/i]
	},
	{ role: 'absence', patterns: [ABSENCE] },
	{
		role: 'carDeparture',
		patterns: [/(bil|car).*(drar|reis|leav|depart)|(drar|leav|depart).*(bil|car)/i]
	},
	{
		role: 'departure',
		patterns: [/n(å|a)r.*(drar|reis)|when.*(leav|depart)|departure|avreise|drar du/i]
	},
	{ role: 'professional', patterns: [/\bprof/i, /instrukt|instructor|guide|kursleder/i] },
	{
		role: 'licence',
		patterns: [/lappen|f(ø|o)rerkort|driv(er|ing)?.?s?.?licen[cs]e|\bsertifikat\b/i]
	},
	{ role: 'hasCar', patterns: [/\bbil\b|\bcar\b|kj(ø|o)re|driv/i] }
];

/**
 * Norske merkelapper for kolonner i skjemaet.
 *
 * Skjemaet er på engelsk, men siden skal være på norsk. Første mønster som treffer
 * gir merkelappen; treffer ingen, brukes spørsmålsteksten slik den står i regnearket.
 */
export const columnLabels: { pattern: RegExp; label: string }[] = [
	{ pattern: /l(å|a)ne|borrow|\butstyr\b|\bgear\b|equipment/i, label: 'Låner utstyr' },
	{ pattern: ABSENCE, label: 'Kan ikke møte til planlagt tid' },
	{ pattern: /n(å|a)r.*(drar|reis)|when.*(leav|depart)|departure|avreise/i, label: 'Drar' },
	{ pattern: /\bprof|instrukt|instructor/i, label: 'Proff' },
	{ pattern: /lappen|f(ø|o)rerkort|licen[cs]e/i, label: 'Lappen' },
	{ pattern: /plass|sete|seat/i, label: 'Plasser' },
	{ pattern: /hengerfeste|tilhenger|hitch/i, label: 'Hengerfeste' },
	{ pattern: /takstativ|takboks|roof/i, label: 'Takstativ' },
	{ pattern: /\bbil\b|\bcar\b/i, label: 'Bil' },
	{ pattern: /kommentar|anything else|annet|other/i, label: 'Kommentar' },
	{ pattern: /erfaring|experience|niv(å|a)|level/i, label: 'Erfaring' },
	{ pattern: /allergi|allerg|kost|diet/i, label: 'Allergier og kost' }
];

/** Merkelappen for en kolonne, eller spørsmålsteksten om ingen passer. */
export function labelFor(column: string): string {
	return columnLabels.find((l) => l.pattern.test(column))?.label ?? column;
}

/**
 * Rader som skal utheves – arrangører og instruktører. Sjekkes mot alle celler
 * i raden, så det treffer uansett hvilken kolonne rollen står i.
 */
export const highlightRow = /instrukt(ø|o)r|assistent|arrang(ø|o)r|leder|logistikk|instructor|assistant/i;

/** Hvor ofte siden henter regnearket på nytt, i sekunder. */
export const refreshSeconds = 60;

/** Cache-nøkkel: server-load registrerer den, klienten kaller invalidate() med den. */
export const SHEET_KEY = 'sjoa:sheet';

/**
 * Vannføring fra NVE, vist som graf over de siste 48 timene.
 *
 * `parameter` er NVEs parameterkode: 1001 er vannføring (m³/s), 1000 er vannstand
 * (meter). Vi bruker vannføring fordi «perfekt mellom 25 og 60» bare gir mening i
 * m³/s – vannstanden på Sjoa ligger på et par meter. Bytt til 1000 om det likevel
 * er vannstanden dere går etter, og juster `perfect` tilsvarende.
 */
export const water = {
	stationId: '2.595.0',
	parameter: 1001,
	/** Nedre og øvre grense for det som regnes som fine forhold. */
	perfect: [25, 60] as [number, number],
	hours: 48,
	stationUrl: 'https://sildre.nve.no/station/2.595.0'
};

/** Antall hele dager fra `now` til turen starter. Negativt når turen er i gang eller over. */
export function daysUntilTrip(now = new Date()): number {
	const start = new Date(`${trip.start}T00:00:00+02:00`).getTime();
	const today = new Date(now);
	today.setHours(0, 0, 0, 0);
	return Math.round((start - today.getTime()) / 86_400_000);
}

/** Er turen i gang akkurat nå? */
export function tripIsOn(now = new Date()): boolean {
	const start = new Date(`${trip.start}T00:00:00+02:00`).getTime();
	const end = new Date(`${trip.end}T23:59:59+02:00`).getTime();
	const t = now.getTime();
	return t >= start && t <= end;
}
