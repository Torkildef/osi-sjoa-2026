/**
 * Lørdagens runs på Bru-bru: hvem som padler når, i hvilke grupper, og hvem
 * som kjører shuttle imens. Sidene under /runs leser herfra.
 *
 * Alt er fornavn, som på resten av siden. Endre lagene og gruppene her; tallene
 * og merkene regnes ut av siden.
 */
import { people, shortName, type Person } from './participants';

/** De erfarne, fra mest til minst erfaren. Rekkefølgen styrer fordelingen. */
export const experienced = [
	'Dani',
	'Wiktor',
	'Torkild',
	'Knut',
	'Vegard',
	'Caroline',
	'Helene',
	'Eskil',
	'Connor',
	'Maja',
	'Simon'
];

/** Fornavn slik de står i deltakerlista, der kortformen over avviker. */
const alias: Record<string, string> = { Dani: 'Danielle', Knut: 'Knut-Erik' };

export const personFor = (first: string): Person | undefined => {
	const wanted = alias[first] ?? first;
	return people.find((p) => shortName(p) === wanted || p.name.split(/\s+/)[0] === wanted);
};

export const isRookie = (first: string) => personFor(first)?.rookie === true;

export const rank = (first: string) => {
	const i = experienced.indexOf(first);
	return i === -1 ? null : i + 1;
};

export type Group = {
	name: string;
	/** Den som leder gruppa og går først. */
	lead: string;
	/** Resten, erfarne og rookies om hverandre. Sistemann i lista går bakerst. */
	members: string[];
};

export type Shuttle = {
	car: string;
	driver: string;
	/** Kjører sin egen bil. */
	own: boolean;
	note?: string;
};

export type Run = {
	n: number;
	team: 'A' | 'B';
	title: string;
	/** Hvem som padler, i tre grupper. */
	groups: Group[];
	/** Hvem som kjører hva mens de andre padler. */
	shuttle: Shuttle[];
	/** Hva som skjer, i rekkefølge. */
	steps: string[];
};

/** Lag A padler run 1 og shuttler run 2. Lag B gjør det motsatt. */
export const teams: Record<'A' | 'B', string[]> = {
	A: ['Dani', 'Knut', 'Vegard', 'Caroline', 'Connor', 'Anneke', 'Ludvig', 'Martha', 'Malin F.', 'Ylva', 'Maren'],
	B: ['Wiktor', 'Torkild', 'Helene', 'Eskil', 'Maja', 'Simon', 'Tiril', 'Sindre', 'Malin N.', 'Julia', 'Lene']
};

export const runs: Run[] = [
	{
		n: 1,
		team: 'A',
		title: 'Run 1 · Bru-bru',
		groups: [
			{ name: 'Gruppe 1', lead: 'Dani', members: ['Anneke', 'Ludvig', 'Connor'] },
			{ name: 'Gruppe 2', lead: 'Knut', members: ['Martha', 'Malin F.', 'Caroline'] },
			{ name: 'Gruppe 3', lead: 'Vegard', members: ['Ylva', 'Maren'] }
		],
		shuttle: [
			{ car: 'Leiebilen + hengeren', driver: 'Torkild', own: true, note: 'Tom henger ned, 11 kajakker opp igjen.' },
			{ car: 'Wiktors bil', driver: 'Wiktor', own: true },
			{ car: 'Helenes bil', driver: 'Helene', own: true },
			{ car: 'Tirils bil', driver: 'Tiril', own: true },
			{ car: 'Carolines bil', driver: 'Eskil', own: false, note: 'Caroline padler. Manuell.' }
		],
		steps: [
			'Alle 22 kajakker til put inn. Hengeren tar 8–10, så det blir to turer fra Kruke – det er tre kilometer.',
			'Lag A går på elva i tre grupper. Lag B kjører alle bilene til take out og venter der.',
			'Lag A kommer i land. Deres 11 kajakker på hengeren og takstativene, og alle 22 kjører tilbake til put inn.'
		]
	},
	{
		n: 2,
		team: 'B',
		title: 'Run 2 · Bru-bru',
		groups: [
			{ name: 'Gruppe 1', lead: 'Wiktor', members: ['Sindre', 'Julia', 'Simon'] },
			{ name: 'Gruppe 2', lead: 'Torkild', members: ['Malin N.', 'Lene', 'Maja'] },
			{ name: 'Gruppe 3', lead: 'Helene', members: ['Tiril', 'Eskil'] }
		],
		shuttle: [
			{ car: 'Leiebilen + hengeren', driver: 'Knut', own: false, note: 'Torkild padler. Lag A sine kajakker settes av på Kruke på veien – det er samme vei.' },
			{ car: 'Carolines bil', driver: 'Caroline', own: true },
			{ car: 'Wiktors bil', driver: 'Vegard', own: false, note: 'Manuell.' },
			{ car: 'Helenes bil', driver: 'Anneke', own: false, note: 'Manuell.' },
			{ car: 'Tirils bil', driver: 'Malin F.', own: false, note: 'Sjekk om den er automat eller manuell.' }
		],
		steps: [
			'Lag B går på elva i tre grupper. Lag A laster sine kajakker på hengeren og kjører alle bilene til take out, innom Kruke for å sette av kajakkene.',
			'Lag B kommer i land. Deres 11 kajakker på hengeren og takstativene.',
			'Alle biler og alle folk er på take out. Hjem til Kruke og fyr opp grillen.'
		]
	}
];

/** Hvorfor det ble som det ble. Vises på /runs. */
export const logic: string[] = [
	'22 padler: 11 rookies og 11 erfarne. Halvparten padler run 1 mens resten ordner shuttle, så bytter vi. Alle får ett run, ingen venter på en parkeringsplass hele dagen.',
	'De erfarne er fordelt annenhver etter erfaring, som i en snake draft: 1, 4, 5, 6, 9 til lag A og 2, 3, 7, 8, 10, 11 til lag B. Da er begge lag omtrent like sterke, og hvert lag har to av de fire sterkeste.',
	'Torkild kjører leiebilen med hengeren under run 1, så han padler run 2. Knut har manuelt førerkort og kjører leiebilen under run 2, så han padler run 1.',
	'Bileierne kjører helst sin egen bil. Wiktor, Helene og Tiril er derfor på lag B og kjører under run 1. Caroline er på lag A og kjører under run 2. De andre bilene kjøres av folk med riktig førerkort.',
	'Rookies med førerkort er satt på lag A, så det er nok sjåfører til run 2-shuttlen. Rookies uten førerkort er på lag B.',
	'Tre grupper per run, fire–fire–tre. Den mest erfarne i hver gruppe leder og går først. Rookiene i midten, en erfaren bakerst. Gruppa på tre har én erfaren, men det er Bru-bru.',
	'Kajakkene: hengeren tar 8–10 og takstativene noen til, så 22 kajakker til put inn om morgenen blir to turer. Det er tre kilometer fra Kruke.',
	'Marie står ikke på lista over erfarne og er ikke rookie, så hun er ikke med i regnestykket. Si fra hvis hun skal padle.'
];
