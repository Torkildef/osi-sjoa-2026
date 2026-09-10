/**
 * Lørdag på elva. To runs. Hvert run er Bru-bru for alle, så Playrun for de
 * erfarne. Rookiene padler ett run hver og varmer opp ved put inn først. De
 * erfarne setter shuttlen imens. De som ikke padler venter på Kruke. Sidene under /runs leser herfra.
 *
 * Fornavn som på resten av siden. Endre her; siden følger med.
 *
 * Kajakker: de 11 erfarne har hver sin, rookiene deler på 6. Til sammen 17.
 * Hengeren tar 10, Wiktors bil 4, Carolines bil 2 – 16 om gangen. Får Tiril
 * tak i takstativ, tar hun 4 til.
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

/** Rookies som padler run 1 og kjører på run 2. */
export const rookiesRun1 = ['Anneke', 'Ludvig', 'Maren', 'Sindre', 'Ylva'];

/** Rookies som kjører på run 1 og padler run 2. */
export const rookiesRun2 = ['Martha', 'Malin F.', 'Tiril', 'Julia', 'Lene', 'Malin N.'];

export const rookies = [...rookiesRun1, ...rookiesRun2];

/** Er med, men padler ikke. */
export const nonPaddlers = ['Marie'];

export const everyone = [...experienced, ...rookies, ...nonPaddlers];

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
	own?: boolean;
	note?: string;
};

export type Run = {
	n: number;
	title: string;
	/** Bru-bru. Playrun padles uten faste grupper. */
	groups: Group[];
	/** Shuttlen de erfarne setter mens rookiene varmer opp. */
	before: Shuttle[];
	/** Etter Bru-bru: to biler til take out Playrun, resten videre. */
	after: Shuttle[];
	afterNote: string;
};

const LEIEBIL = 'Leiebilen + hengeren';
const WIKTOR = 'Wiktors bil';
const CAROLINE = 'Carolines bil';
const TIRIL = 'Tirils bil';
const HELENE = 'Helenes bil';

export const runs: Run[] = [
	{
		n: 1,
		title: 'Run 1',
		groups: [
			{ name: 'Gruppe 1', members: ['Dani', 'Caroline', 'Helene', 'Simon', 'Anneke', 'Sindre'] },
			{ name: 'Gruppe 2', members: ['Wiktor', 'Vegard', 'Eskil', 'Maja', 'Ludvig', 'Ylva'] },
			{ name: 'Gruppe 3', members: ['Torkild', 'Knut', 'Connor', 'Maren'] }
		],
		before: [
			{ car: WIKTOR, driver: 'Wiktor', own: true, note: 'Til take out' },
			{ car: CAROLINE, driver: 'Caroline', own: true, note: 'Til take out' },
			{ car: LEIEBIL, driver: 'Martha', note: 'Følger etter, kjører de to opp igjen. Til Kruke når run 1 er på vannet.' }
		],
		after: [
			{ car: LEIEBIL, driver: 'Anneke', note: 'Til take out Playrun' },
			{ car: WIKTOR, driver: 'Ludvig', note: 'Til take out Playrun' },
			{ car: TIRIL, driver: 'Tiril', own: true, note: 'Til put inn med rookies run 2 og kajakker' },
			{ car: CAROLINE, driver: 'Malin F.', note: 'Til put inn med rookies run 2 og kajakker' },
			{ car: HELENE, driver: 'Ylva', note: 'Til Kruke med Maren og Sindre' }
		],
		afterNote: 'Rookies run 2 kommer fra Kruke til take out i leiebilen, Tirils og Helenes bil. Avtal tid.'
	},
	{
		n: 2,
		title: 'Run 2',
		groups: [
			{ name: 'Gruppe 1', members: ['Dani', 'Caroline', 'Helene', 'Simon', 'Martha', 'Julia'] },
			{ name: 'Gruppe 2', members: ['Wiktor', 'Vegard', 'Eskil', 'Maja', 'Malin F.', 'Lene'] },
			{ name: 'Gruppe 3', members: ['Torkild', 'Knut', 'Connor', 'Malin N.', 'Tiril'] }
		],
		before: [
			{ car: WIKTOR, driver: 'Wiktor', own: true, note: 'Til take out' },
			{ car: CAROLINE, driver: 'Caroline', own: true, note: 'Til take out' },
			{ car: TIRIL, driver: 'Maja', note: 'Automat. Til take out' },
			{ car: LEIEBIL, driver: 'Anneke', note: 'Følger etter, kjører de tre opp igjen. Ludvig sitter på ned og blir på Kruke.' }
		],
		after: [
			{ car: LEIEBIL, driver: 'Anneke', note: 'Til take out Playrun' },
			{ car: WIKTOR, driver: 'Ludvig', note: 'Til take out Playrun' },
			{ car: TIRIL, driver: 'Tiril', own: true, note: 'Til Kruke med kajakker' },
			{ car: CAROLINE, driver: 'Martha', note: 'Til Kruke med kajakker' },
			{ car: HELENE, driver: 'Ylva', note: 'Til Kruke' }
		],
		afterNote: 'Rookies run 1 kommer fra Kruke til take out i leiebilen og Helenes bil. Avtal tid.'
	}
];

export type Step = {
	what: string;
	who?: string;
	/** Hvem steget gjelder. Brukes til «velg deg selv». */
	names: string[];
};

const run1 = [...experienced, ...rookiesRun1];
const run2 = [...experienced, ...rookiesRun2];

/** Hele dagen, steg for steg. */
export const steps = (rack: boolean): Step[] => [
	{
		what: 'Kruke → put inn: de erfarne, rookies run 1 og Martha. 16 kajakker, 3 biler.',
		who: 'Torkild (leiebil), Wiktor og Caroline kjører. Rookies run 2, Tirils og Helenes bil og kajakk 17 blir på Kruke.',
		names: [...run1, 'Martha']
	},
	{
		what: 'Oppvarming ved put inn: rookies run 1.',
		who: 'Bakevjer, ferging, rulle.',
		names: rookiesRun1
	},
	{
		what: 'Shuttle imens: Wiktor og Caroline kjører bilene sine til take out. Martha følger i leiebilen og kjører dem opp igjen.',
		names: ['Wiktor', 'Caroline', 'Martha']
	},
	{ what: 'Run 1: Bru-bru i tre grupper.', names: run1 },
	{
		what: 'Martha kjører leiebilen til Kruke. Rookies run 2 venter der.',
		names: rookiesRun2
	},
	{
		what: 'Rookies run 2 står på take out når run 1 lander.',
		who: 'Martha (leiebil), Tiril (egen), Malin F. (Helenes). Avtal tid før run 1 starter.',
		names: rookiesRun2
	},
	{
		what: 'Take out Bru-bru: rookies i land. De erfarne padler rett videre ned Playrun.',
		names: run1
	},
	{
		what: 'Anneke (leiebil) og Ludvig (Wiktors) til take out Playrun. Tiril (egen) og Malin F. (Carolines) til put inn med rookies run 2. Ylva (Helenes) til Kruke med Maren og Sindre.',
		who: rack
			? '6 rookie-kajakker: 4 på Tiril, 2 på Caroline. Carolines bil innom Kruke etter kajakk 17.'
			: '6 rookie-kajakker: 2 på Caroline, som kjører to turer og henter kajakk 17 på Kruke. 2 blir med hengeren.',
		names: rookies
	},
	{
		what: 'Playrun i land. 11 kajakker på henger og Wiktor. Anneke og Ludvig kjører de erfarne til put inn.',
		names: [...experienced, 'Anneke', 'Ludvig']
	},
	{
		what: 'Oppvarming ved put inn: rookies run 2.',
		who: 'Bakevjer, ferging, rulle.',
		names: rookiesRun2
	},
	{
		what: 'Shuttle imens: Wiktor, Caroline og Maja (Tirils) kjører til take out. Anneke følger i leiebilen og kjører dem opp igjen.',
		who: 'Ludvig sitter på ned og blir på Kruke.',
		names: ['Wiktor', 'Caroline', 'Maja', 'Anneke', 'Ludvig']
	},
	{ what: 'Run 2: Bru-bru i tre grupper.', names: run2 },
	{
		what: 'Anneke kjører leiebilen til Kruke. Rookies run 1 venter der.',
		names: rookiesRun1
	},
	{
		what: 'Rookies run 1 står på take out når run 2 lander.',
		who: 'Anneke (leiebil), Ylva (Helenes). Avtal tid før run 2 starter.',
		names: rookiesRun1
	},
	{
		what: 'Take out Bru-bru: rookies i land. De erfarne padler rett videre ned Playrun.',
		names: run2
	},
	{
		what: 'Anneke (leiebil) og Ludvig (Wiktors) til take out Playrun. Tiril (egen), Martha (Carolines) og Ylva (Helenes) til Kruke med resten.',
		who: rack
			? '6 rookie-kajakker: 4 på Tiril, 2 på Caroline.'
			: '6 rookie-kajakker: 2 på Caroline, som kjører to turer. Det er rett ved. 2 blir med hengeren.',
		names: rookies
	},
	{
		what: 'Playrun i land. 11 kajakker på henger og Wiktor. Alle til Kruke.',
		names: [...experienced, 'Anneke', 'Ludvig']
	}
];

/** Det vi vet. Regnestykket bygger på dette. */
export const facts = (rack: boolean): string[] => [
	'22 padler: 11 erfarne og 11 rookies. Marie padler ikke.',
	'17 kajakker: de erfarne har hver sin, rookiene deler på 6. Rookiene er aldri på vannet samtidig.',
	rack
		? 'Kajakkplass per tur: henger 10, Wiktor 4, Tiril 4, Caroline 2.'
		: 'Kajakkplass per tur: henger 10, Wiktor 4, Caroline 2. Carolines bil tar en ekstra tur der det trengs.',
	'Om morgenen: 17 personer i leiebilen (9), Wiktors (5) og Carolines (3). Akkurat nok.',
	'Rookies med lapp: Anneke, Ludvig, Martha, Malin F. og Ylva kjører manuell. Maren og Tiril kjører automat. Sindre, Malin N., Julia og Lene har ikke oppgitt lapp.',
	'Leiebilen kjøres opp igjen av en som ikke padler. Martha på run 1, Anneke på run 2.',
	'Kruke ligger rett ved take out Bru-bru. Ysteriet ligger rett ved put inn.',
	'Take out Bru-bru er put inn Playrun.'
];

/** Hvor man venter. */
export const waiting: string[] = [
	'De som ikke padler, venter på Kruke. Derfra til take out i leiebilen, Tirils og Helenes bil til avtalt tid.',
	'Ysteriet, kafé og bakeri rett ved put inn: for kaffe før oppvarming, eller for Marie.',
	'Parker på take out, ikke på Kruke, når run lander. Kajakkene skal på bilene der.',
	'Marie kan være på Kruke eller Ysteriet. Vil hun kjøre, er hun en ekstra sjåfør.'
];

/** Vurderingen. Kort. */
export const verdict: string[] = [
	'Hvert run er Bru-bru med rookies, så Playrun for de erfarne. Rookiene kjører bilene videre mens de erfarne padler Playrun.',
	'Rookiene varmer opp alene ved put inn. De erfarne setter shuttlen imens og kommer opp igjen i leiebilen, kjørt av en rookie som ikke padler.',
	'Ylva padler run 1 og Malin N. run 2, så begge shuttlene har nok sjåfører med lapp for manuell.',
	'Takstativ på Tirils bil fjerner alle ekstraturer. Uten tar Carolines bil to korte ekstraturer.',
	'Lang dag for de erfarne: to Bru-bru og to Playrun. Slitne står over Playrun på run 2 og kjører til Kruke med rookiene.'
];

/** Kort oppsummering for én person. */
export const summaryFor = (name: string): string[] => {
	const lines: string[] = [];
	const groupIn = (run: Run) => run.groups.find((g) => g.members.includes(name))?.name;
	if (experienced.includes(name)) {
		lines.push('Du padler Bru-bru og Playrun på begge runs.');
		for (const run of runs) lines.push(`${run.title}: ${groupIn(run)}.`);
	} else if (rookiesRun1.includes(name)) {
		lines.push(`Du padler run 1 (Bru-bru) i ${groupIn(runs[0])}. Oppvarming ved put inn først.`);
		lines.push('På run 2 venter du på Kruke og kjører når det lander.');
	} else if (rookiesRun2.includes(name)) {
		lines.push('På run 1 venter du på Kruke og kjører når det lander.');
		lines.push(`Du padler run 2 (Bru-bru) i ${groupIn(runs[1])}. Oppvarming ved put inn først.`);
	} else {
		lines.push('Du padler ikke. Kruke eller Ysteriet, som du vil.');
	}
	for (const run of runs) {
		for (const s of [...run.before, ...run.after]) {
			if (s.driver === name) {
				lines.push(`${run.title}: du kjører ${s.car.toLowerCase()}${s.note ? ` – ${s.note.toLowerCase()}` : ''}.`);
			}
		}
	}
	if (['Torkild', 'Wiktor', 'Caroline'].includes(name)) lines.push('Du kjører til put inn om morgenen.');
	if (name === 'Martha') lines.push('Du er med fra morgenen: du kjører leiebilen opp igjen etter shuttlen.');
	return [...new Set(lines)];
};
