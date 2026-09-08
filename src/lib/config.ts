/** Nøkkelinfo om turen. Rediger her når datoer eller pris endrer seg. */
export const trip = {
	title: 'Sjoa 2026',
	organiser: 'OSI Elvepadling',
	dates: '18.–21. juni 2026',
	location: 'Sjoa, Sel kommune',
	price: '1 450 kr per deltaker',
	contact: 'elvepadling@osi.no'
};

/** Påmeldingsskjemaet deltakerne fyller ut. Lenken finner du under «Send» i skjemaet. */
export const signupFormUrl =
	'https://docs.google.com/forms/d/19i0fHqvw2-G-bMH52c2bc6aKSgigdarxCiOeoCCIsiE/viewform';

/**
 * Kolonnegrupper – fargebåndene over tabellen.
 *
 * Hver kolonne i regnearket havner i den første gruppen som treffer et av
 * mønstrene sine. Kolonner som ikke treffer noen gruppe, vises først, uten
 * fargebånd (som Navn og Rolle).
 *
 * Dette er stedet å justere når du endrer spørsmålene i skjemaet. Mønstrene
 * dekker både norske og engelske varianter, så små omformuleringer går fint.
 */
export type ColumnGroup = {
	label: string;
	emoji: string;
	/** Fargetema, definert i app.css: 'warm' | 'cool' | 'neutral'. */
	tone: 'warm' | 'cool' | 'neutral';
	patterns: RegExp[];
};

export const columnGroups: ColumnGroup[] = [
	{
		label: 'Bil',
		emoji: '🚗',
		tone: 'warm',
		patterns: [
			/\bbil\b|\bcar\b|kj(ø|o)re|sj(å|a)f(ø|o)r|driv/i,
			/plass|sete|seat/i,
			/takstativ|takboks|roof/i,
			/hengerfeste|tilhenger|henger|hitch/i
		]
	},
	{
		label: 'Overnatting',
		emoji: '⛺',
		tone: 'cool',
		patterns: [
			/telt|camping|overnatt|hytte|sove|tent|hammock|hengek(ø|o)ye/i,
			/utstyr|gear|l(å|a)ne/i
		]
	}
];

/**
 * Kolonner som ikke vises. Siden ligger åpent på nettet, så kontaktopplysninger
 * holdes utenfor. Legg til flere mønstre her for å skjule andre kolonner.
 */
export const hiddenColumns: RegExp[] = [/e-?post|e-?mail/i, /telefon|mobil|\btlf\b|phone/i];

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
