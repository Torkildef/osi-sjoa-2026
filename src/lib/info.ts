import { trip } from './config';

/**
 * Det viktigste fra påmeldingsskjemaet, samlet på forsiden. Rediger her når
 * priser eller oppmøte endrer seg – skjemaet må oppdateres for seg.
 */
export type InfoCard = {
	emoji: string;
	title: string;
	lines: string[];
	link?: { label: string; href: string };
};

export const practical: InfoCard[] = [
	{
		emoji: '📍',
		title: 'Oppmøte',
		lines: [
			`${trip.meetup.label} ved ${trip.meetup.place.toLowerCase()}`,
			trip.meetup.address
		],
		link: {
			label: 'Veibeskrivelse',
			href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trip.meetup.address)}`
		}
	},
	{
		emoji: '🏠',
		title: 'Overnatting',
		lines: [
			`${trip.base} i ${trip.location}`,
			'Sengetøy er inkludert, så la soveposen ligge hjemme. Det er et lite kjøkken',
			'Vær grei med stedet og verten vår, Pål'
		],
		link: { label: 'Vis på kartet', href: `/kart?sted=${encodeURIComponent(trip.base)}` }
	},
	{
		emoji: '💸',
		title: 'Kostnader',
		lines: [
			'450 kr for reisen',
			'600 kr for overnatting – kontant eller Vipps',
			'Mat og drikke på egen regning. Vi fyrer opp grillen lørdag 🔥'
		]
	}
];
