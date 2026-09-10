import { trip } from './config';

/**
 * Det viktigste for turen, samlet på forsiden. Rediger her når priser eller
 * oppmøte endrer seg – skjemaet må oppdateres for seg.
 */
export type InfoCard = {
	emoji: string;
	title: string;
	/** Det ene folk må få med seg, i stor skrift. */
	lead: string;
	lines: string[];
	link?: { label: string; href: string };
};

export const practical: InfoCard[] = [
	{
		emoji: '📍',
		title: 'Oppmøte',
		lead: trip.meetup.label,
		lines: [trip.meetup.place, trip.meetup.address],
		link: {
			label: 'Veibeskrivelse',
			href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trip.meetup.address)}`
		}
	},
	{
		emoji: '🏠',
		title: 'Overnatting',
		lead: `${trip.base}, ${trip.location}`,
		lines: ['Sengetøy er inkludert. La soveposen ligge hjemme', 'Lite kjøkken. Vær grei med stedet og verten Pål'],
		link: { label: 'Vis på kartet', href: `/kart?sted=${encodeURIComponent(trip.base)}` }
	},
	{
		emoji: '💸',
		title: 'Kostnader',
		lead: '450 kr reise + 600 kr overnatting',
		lines: ['Overnattingen betales kontant eller med Vipps', 'Mat og drikke på egen regning. Grill lørdag 🔥']
	}
];

/** Varsler som skal være umulige å overse. */
export const warnings: { emoji: string; title: string; text: string }[] = [
	{
		emoji: '📸',
		title: 'Fotoboks før Ringebu',
		text: 'Senk farten på E6 før Ringebu. Boksen bryr seg ikke om at du er sent ute.'
	}
];
