/** Nøkkelinfo om turen. Rediger her når datoer eller pris endrer seg. */
export const trip = {
	title: 'Sjoa 2026',
	organiser: 'OSI Elvepadling',
	dates: '18.–21. juni 2026',
	location: 'Sjoa, Sel kommune',
	price: '1 450 kr per deltaker',
	priceIncludes: 'Inkluderer overnatting og felles middag. Transport spleises i bilene.',
	paymentInfo: 'Betales til klubbkontoen, merk med navn.',
	contact: 'elvepadling@osi.no'
};

/**
 * Påmelding skjer i et Google-skjema. Lenken deles ut til deltakerne, og appen
 * leser svarene fra regnearket skjemaet skriver til (se GOOGLE_SHEET_CSV_URL).
 *
 * MÅ SJEKKES: denne er utledet av redigeringslenken. Den ekte delingslenken finner
 * du under «Send» i skjemaet, og den ser gjerne ut som .../forms/d/e/<lang-id>/viewform.
 * Lim inn den her, ellers sender du deltakerne til en side de ikke får åpne.
 */
export const signupFormUrl =
	'https://docs.google.com/forms/d/19i0fHqvw2-G-bMH52c2bc6aKSgigdarxCiOeoCCIsiE/viewform';

/**
 * Hvordan kolonnene i regnearket kobles til feltene appen kjenner.
 *
 * Skjemaet eier spørsmålsteksten, så vi gjenkjenner kolonnene på mønster framfor
 * eksakt navn. Første kolonne som treffer vinner. Endrer du spørsmålene, er det
 * her du justerer.
 */
export const formColumns = {
	name: /\bnavn\b|name/i,
	email: /e-?post|e-?mail/i,
	phone: /telefon|mobil|\btlf\b|phone/i,
	accommodation: /overnatting|hytte|sove/i,
	timestamp: /tidsmerke|timestamp/i
};

/**
 * Kolonner som ikke vises på den offentlige forsiden. Siden ligger åpent på nettet,
 * så kontaktopplysninger holdes til adminsiden. Tøm lista for å vise alt offentlig.
 */
export const privateFormColumns = [formColumns.email, formColumns.phone];
