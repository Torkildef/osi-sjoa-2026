/**
 * Lørdag på Bru-bru: to runs. De erfarne padler begge. Rookiene padler ett
 * run hver og kjører shuttle på det andre. Sidene under /runs leser herfra.
 *
 * Fornavn som på resten av siden. Endre her; siden regner ut tallene.
 *
 * Kajakker: de 11 erfarne har hver sin, rookiene deler på 6. Til sammen 17.
 * Hengeren tar 10, Wiktors bil 4, Carolines bil 2 – 16 om gangen.
 */
import { people, shortName, type Person } from './participants';

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

/** Rookies som padler run 1 og kjører shuttle på run 2. */
export const rookiesRun1 = ['Anneke', 'Ludvig', 'Maren', 'Sindre', 'Malin N.'];

/** Rookies som kjører shuttle på run 1 og padler run 2. */
export const rookiesRun2 = ['Martha', 'Malin F.', 'Ylva', 'Tiril', 'Julia', 'Lene'];

/** Fornavn slik de står i deltakerlista, der kortformen over avviker. */
const alias: Record<string, string> = { Dani: 'Danielle', Knut: 'Knut-Erik' };

export const personFor = (first: string): Person | undefined => {
	const wanted = alias[first] ?? first;
	return people.find((p) => shortName(p) === wanted || p.name.split(/\s+/)[0] === wanted);
};

export const isRookie = (first: string) => personFor(first)?.rookie === true;

export type Group = { name: string; members: string[] };

export type Shuttle = {
	car: string;
	driver: string;
	/** Kjører sin egen bil. */
	own: boolean;
	note?: string;
};

export type Run = {
	n: number;
	title: string;
	groups: Group[];
	shuttle: Shuttle[];
	/** Sitter på i shuttlen. */
	riders: string[];
	/** Biler som blir stående på put inn imens. */
	stays: string[];
};

export const runs: Run[] = [
	{
		n: 1,
		title: 'Run 1',
		groups: [
			{ name: 'Gruppe 1', members: ['Dani', 'Caroline', 'Helene', 'Simon', 'Anneke', 'Sindre'] },
			{ name: 'Gruppe 2', members: ['Wiktor', 'Vegard', 'Eskil', 'Maja', 'Ludvig', 'Malin N.'] },
			{ name: 'Gruppe 3', members: ['Torkild', 'Knut', 'Connor', 'Maren'] }
		],
		shuttle: [
			{ car: 'Leiebilen + hengeren', driver: 'Martha', own: false },
			{ car: 'Wiktors bil', driver: 'Ylva', own: false },
			{
				car: 'Carolines bil',
				driver: 'Malin F.',
				own: false,
				note: 'Innom Kruke først: henter kajakk 17 og setter den på put inn. Så til take out.'
			},
			{ car: 'Tirils bil', driver: 'Tiril', own: true }
		],
		riders: ['Julia', 'Lene'],
		stays: ['Helenes bil']
	},
	{
		n: 2,
		title: 'Run 2',
		groups: [
			{ name: 'Gruppe 1', members: ['Dani', 'Caroline', 'Helene', 'Simon', 'Martha', 'Julia'] },
			{ name: 'Gruppe 2', members: ['Wiktor', 'Vegard', 'Eskil', 'Maja', 'Malin F.', 'Lene'] },
			{ name: 'Gruppe 3', members: ['Torkild', 'Knut', 'Connor', 'Ylva', 'Tiril'] }
		],
		shuttle: [
			{ car: 'Leiebilen + hengeren', driver: 'Anneke', own: false },
			{ car: 'Carolines bil', driver: 'Ludvig', own: false },
			{ car: 'Tirils bil', driver: 'Maren', own: false, note: 'Automat' }
		],
		riders: ['Sindre', 'Malin N.'],
		stays: ['Wiktors bil', 'Helenes bil']
	}
];

export type Step = { what: string; who?: string };

/** Hele dagen, steg for steg. */
export const timeline: Step[] = [
	{
		what: 'Kruke → put inn. Alle 22, 16 kajakker, alle 5 biler. Én tur.',
		who: 'Henger 10 · Wiktor 4 · Caroline 2. Kajakk 17 blir igjen på Kruke.'
	},
	{ what: 'Run 1: 11 erfarne + 5 rookies.', who: rookiesRun1.join(', ') },
	{
		what: 'Shuttle 1: 4 biler til take out. Helenes bil står på put inn.',
		who: 'Martha (leiebil), Ylva (Wiktors), Malin F. (Carolines, innom Kruke etter kajakk 17 → put inn), Tiril (egen). Julia og Lene sitter på.'
	},
	{ what: 'Run 1 i land. 16 kajakker på henger, Wiktor og Caroline. Alle tilbake til put inn.' },
	{ what: 'Run 2: 11 erfarne + 6 rookies. 17 kajakker.', who: rookiesRun2.join(', ') },
	{
		what: 'Shuttle 2: 3 biler til take out. Wiktors og Helenes bil står på put inn.',
		who: 'Anneke (leiebil), Ludvig (Carolines), Maren (Tirils). Sindre og Malin N. sitter på.'
	},
	{ what: 'Run 2 i land. 12 kajakker på henger og Caroline.' },
	{ what: 'Maren kjører Wiktor og Helene til put inn i Tirils bil. De henter bilene og kommer til take out. 4 kajakker på Wiktor.' },
	{ what: 'Alle hjem til Kruke. Siste kajakk: Carolines bil tar en tur til – Kruke er rett ved.' }
];

/** Hvorfor. Kort. */
export const logic: string[] = [
	'De erfarne padler begge runs. Rookiene padler ett run og kjører shuttle på det andre.',
	'17 kajakker, plass til 16 om gangen. Derfor 5 rookies på run 1 og 6 på run 2: kajakk 17 hentes fra Kruke under run 1, og tar en ekstra tur hjem til slutt.',
	'Sjåførene er fordelt så hver shuttle har nok med lappen. Maren og Tiril har automat, så Maren kjører Tirils bil.',
	'Tre grupper per run, samme erfarne i hver gruppe begge ganger, 1–2 rookies i hver.',
	'Marie er ikke med i regnestykket. Si fra hvis hun padler.'
];
