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
	contact: 'elvepadling@osi.no',
	/** Felles avreise fra Oslo. Nedtellingen på forsiden går mot dette. */
	meetup: {
		time: '2026-09-11T16:00:00+02:00',
		label: 'Fredag 16:00',
		place: 'Kajakkrommet (klubbhuset)',
		address: 'Rolf E. Stenersens allé 21, Sogn studentby, 0858 Oslo'
	}
};

/** Påmeldingsskjemaet deltakerne fyller ut. Lenken finner du under «Send» i skjemaet. */
export const signupFormUrl =
	'https://docs.google.com/forms/d/19i0fHqvw2-G-bMH52c2bc6aKSgigdarxCiOeoCCIsiE/viewform';

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
	/**
	 * Sonene, i m³/s: under `good` er det lavt, mellom good og perfect er det bra,
	 * innenfor perfect er det perfekt, og over perfect blir det spennende.
	 */
	good: [20, 25] as [number, number],
	perfect: [25, 60] as [number, number],
	hours: 48,
	stationUrl: 'https://sildre.nve.no/station/2.595.0'
};

/** Er turen i gang akkurat nå? */
export function tripIsOn(now = new Date()): boolean {
	const start = new Date(`${trip.start}T00:00:00+02:00`).getTime();
	const end = new Date(`${trip.end}T23:59:59+02:00`).getTime();
	const t = now.getTime();
	return t >= start && t <= end;
}

/** Tid igjen til felles avreise, som «2 d 17 t» eller «45 min». Null når den er passert. */
export function untilMeetup(now = new Date()): string | null {
	const ms = new Date(trip.meetup.time).getTime() - now.getTime();
	if (ms <= 0) return null;
	const minutes = Math.floor(ms / 60_000);
	const d = Math.floor(minutes / 1440);
	const h = Math.floor((minutes % 1440) / 60);
	const m = minutes % 60;
	if (d > 0) return `${d} d ${h} t`;
	if (h > 0) return `${h} t ${m} min`;
	return `${m} min`;
}
