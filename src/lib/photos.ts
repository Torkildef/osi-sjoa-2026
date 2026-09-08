/**
 * Bildene siden bruker. Filene ligger i static/bilder/ og serveres fra roten.
 *
 * Mangler en fil, skjuler <Photo> seg selv i stedet for å vise et brukket
 * bildeikon – da ser siden hel ut både før og etter at bildene er lagt inn.
 */
export const photos = {
	logo: {
		src: '/bilder/osi-logo.png',
		alt: 'OSI-logoen'
	},
	kruke: {
		src: '/bilder/kruke.jpg',
		alt: 'Kruke gård en sommerkveld, med biler og kajakker på takstativene foran tømmerhusene'
	}
};
