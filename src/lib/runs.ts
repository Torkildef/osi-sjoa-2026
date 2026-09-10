/**
 * Lørdag på Bru-bru: to runs. De erfarne padler begge. Rookiene padler ett
 * run hver og kjører shuttle på det andre. Sidene under /runs leser herfra.
 *
 * Fornavn som på resten av siden. Endre her; siden regner ut tallene.
 */
import { people, shortName, type Person } from './participants';

/** De erfarne, fra mest til minst erfaren. */
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
export const rookiesRun1 = ['Ylva', 'Anneke', 'Tiril', 'Sindre', 'Malin N.', 'Julia'];

/** Rookies som kjører shuttle på run 1 og padler run 2. */
export const rookiesRun2 = ['Ludvig', 'Martha', 'Malin F.', 'Maren', 'Lene'];

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
	/** Går først. */
	lead: string;
	/** Rookiene i midten. Sistemann går bakerst. */
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
	title: string;
	time: string;
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
		time: '09:30',
		groups: [
			{ name: 'Gruppe 1', lead: 'Dani', members: ['Ylva', 'Sindre', 'Caroline', 'Simon', 'Helene'] },
			{ name: 'Gruppe 2', lead: 'Wiktor', members: ['Anneke', 'Malin N.', 'Vegard', 'Maja', 'Eskil'] },
			{ name: 'Gruppe 3', lead: 'Torkild', members: ['Tiril', 'Julia', 'Connor', 'Knut'] }
		],
		shuttle: [
			{ car: 'Leiebilen + hengeren', driver: 'Ludvig', own: false },
			{ car: 'Wiktors bil', driver: 'Martha', own: false },
			{ car: 'Helenes bil', driver: 'Malin F.', own: false },
			{ car: 'Tirils bil', driver: 'Maren', own: false, note: 'Automat' }
		],
		riders: ['Lene'],
		stays: ['Carolines bil']
	},
	{
		n: 2,
		title: 'Run 2',
		time: '12:30',
		groups: [
			{ name: 'Gruppe 1', lead: 'Dani', members: ['Ludvig', 'Martha', 'Caroline', 'Simon', 'Helene'] },
			{ name: 'Gruppe 2', lead: 'Wiktor', members: ['Malin F.', 'Maren', 'Vegard', 'Maja', 'Eskil'] },
			{ name: 'Gruppe 3', lead: 'Torkild', members: ['Lene', 'Connor', 'Knut'] }
		],
		shuttle: [
			{ car: 'Leiebilen + hengeren', driver: 'Ylva', own: false, note: 'Setter av 6 kajakker på Kruke på veien' },
			{ car: 'Tirils bil', driver: 'Tiril', own: true },
			{ car: 'Wiktors bil', driver: 'Anneke', own: false }
		],
		riders: ['Sindre', 'Malin N.', 'Julia'],
		stays: ['Carolines bil', 'Helenes bil']
	}
];

export type Step = { time: string; what: string; who?: string };

/** Hele dagen, kort og konkret. */
export const timeline: Step[] = [
	{ time: '09:00', what: 'Kruke → put inn. Alle 22, alle 22 kajakker, alle 5 biler. Én tur.', who: 'Henger 10 · Wiktor 3 · Caroline 3 · Helene 2 · Tiril 2 · leiebiltak 2' },
	{ time: '09:30', what: 'Run 1 på elva: 11 erfarne + 6 rookies.', who: rookiesRun1.join(', ') },
	{ time: '09:30', what: 'Shuttle 1: 4 biler til take out.', who: 'Ludvig (leiebil), Martha (Wiktors), Malin F. (Helenes), Maren (Tirils), Lene sitter på' },
	{ time: '11:30', what: 'Run 1 i land. 17 kajakker på henger og tak. Alle tilbake til put inn.' },
	{ time: '12:30', what: 'Run 2 på elva: 11 erfarne + 5 rookies.', who: rookiesRun2.join(', ') },
	{ time: '12:30', what: 'Shuttle 2: 3 biler til take out, innom Kruke og setter av 6 kajakker.', who: 'Ylva (leiebil), Tiril (egen), Anneke (Wiktors). Sindre, Malin N., Julia sitter på' },
	{ time: '14:30', what: 'Run 2 i land. 16 kajakker på henger og tak.' },
	{ time: '14:45', what: 'Anneke kjører Caroline og Helene til put inn i Wiktors bil. De henter bilene.' },
	{ time: '15:00', what: 'Alle hjem til Kruke.' }
];

/** Hvorfor. Kort. */
export const logic: string[] = [
	'De erfarne padler begge runs. Rookiene padler ett run og kjører shuttle på det andre.',
	'6 rookies padler run 1, 5 padler run 2. Sjåførene er fordelt så begge shuttlene har nok folk med lappen.',
	'Tre grupper per run: samme ledere begge ganger, 2 rookies i hver.',
	'Kajakkene fordeles på henger og tak, så det holder med én tur om morgenen.',
	'Marie er ikke med i regnestykket. Si fra hvis hun padler.'
];
