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
