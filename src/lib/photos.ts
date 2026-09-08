/**
 * Bildene siden bruker. Filene ligger i static/bilder/ og serveres fra roten.
 *
 * Mangler en fil, skjuler bildet seg selv i stedet for å vise et brukket bildeikon –
 * da ser siden hel ut både før og etter at bildene er lagt inn.
 */
export const photos = {
	logo: {
		src: '/bilder/osi-logo.jpeg',
		alt: 'OSI-logoen'
	},
	kruke: {
		src: '/bilder/kruke.jpg',
		alt: 'Kruke gård en sommerkveld, med biler og kajakker på takstativene foran tømmerhusene'
	},
	strie: {
		src: '/bilder/strie-strommer.png',
		alt: 'Logoen til Strie Strømmer'
	},
	ysteri: {
		src: '/bilder/heidal-ysteri.webp',
		alt: 'Logoen til Heidal Ysteri'
	},
	kiwi: {
		src: '/bilder/kiwi.jpg',
		alt: 'Kiwi-logoen'
	}
} satisfies Record<string, { src: string; alt: string }>;

export type PhotoKey = keyof typeof photos;
