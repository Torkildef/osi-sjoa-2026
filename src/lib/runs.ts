/**
 * Lørdag på elva. To runs. Hvert run er Bru-bru for alle, så Playrun for de
 * erfarne. Rookiene padler ett run hver, varmer opp ved put inn først, og
 * kjører bilene når de ikke padler. Sidene under /runs leser herfra.
 *
 * Fornavn som på resten av siden. Endre her; siden følger med.
 *
 * Kajakker: de 11 erfarne har hver sin, rookiene deler på 6. Til sammen 17.
 * Hengeren tar 10, Wiktors bil 4, Carolines bil 2 – 16 om gangen. Får Tiril
 * tak i takstativ, tar hun 4 til. Helenes bil står på Kruke hele dagen.
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
export const rookiesRun1 = ['Anneke', 'Ludvig', 'Maren', 'Sindre', 'Malin N.'];

/** Rookies som kjører på run 1 og padler run 2. */
export const rookiesRun2 = ['Martha', 'Malin F.', 'Ylva', 'Tiril', 'Julia', 'Lene'];

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
	/** Bru-bru. Playrun er de samme gruppene uten rookiene. */
	groups: Group[];
	/** Kjøres til Kruke mens rookiene varmer opp. */
	before: Shuttle[];
	/** Etter Bru-bru: to biler til take out Playrun, resten videre. */
	after: Shuttle[];
	afterNote: string;
};

const LEIEBIL = 'Leiebilen + hengeren';
const WIKTOR = 'Wiktors bil';
const CAROLINE = 'Carolines bil';
const TIRIL = 'Tirils bil';

export const runs: Run[] = [
	{
		n: 1,
		title: 'Run 1',
		groups: [
			{ name: 'Gruppe 1', members: ['Dani', 'Caroline', 'Helene', 'Simon', 'Anneke', 'Sindre'] },
			{ name: 'Gruppe 2', members: ['Wiktor', 'Vegard', 'Eskil', 'Maja', 'Ludvig', 'Malin N.'] },
			{ name: 'Gruppe 3', members: ['Torkild', 'Knut', 'Connor', 'Maren'] }
		],
		before: [
			{ car: LEIEBIL, driver: 'Martha' },
			{ car: WIKTOR, driver: 'Malin F.' },
			{ car: CAROLINE, driver: 'Ylva', note: 'Automat' },
			{ car: TIRIL, driver: 'Tiril', own: true }
		],
		after: [
			{ car: LEIEBIL, driver: 'Anneke', note: 'Til take out Playrun' },
			{ car: WIKTOR, driver: 'Ludvig', note: 'Til take out Playrun' },
			{ car: TIRIL, driver: 'Tiril', own: true, note: 'Til put inn med rookie-kajakker' },
			{ car: CAROLINE, driver: 'Ylva', note: 'Til put inn med rookie-kajakker' }
		],
		afterNote: 'Julia, Lene, Martha, Malin F., Maren, Sindre og Malin N. sitter på til put inn. Én sitter på til take out Playrun.'
	},
	{
		n: 2,
		title: 'Run 2',
		groups: [
			{ name: 'Gruppe 1', members: ['Dani', 'Caroline', 'Helene', 'Simon', 'Martha', 'Julia'] },
			{ name: 'Gruppe 2', members: ['Wiktor', 'Vegard', 'Eskil', 'Maja', 'Malin F.', 'Lene'] },
			{ name: 'Gruppe 3', members: ['Torkild', 'Knut', 'Connor', 'Ylva', 'Tiril'] }
		],
		before: [
			{ car: LEIEBIL, driver: 'Anneke' },
			{ car: WIKTOR, driver: 'Ludvig' },
			{ car: TIRIL, driver: 'Maren', note: 'Automat' },
			{
				car: CAROLINE,
				driver: 'Sindre, Malin N., Julia eller Lene',
				note: 'Den som har lapp. Har ingen: Caroline kjører ned, Maren henter henne i Tirils bil.'
			}
		],
		after: [
			{ car: LEIEBIL, driver: 'Anneke', note: 'Til take out Playrun' },
			{ car: WIKTOR, driver: 'Ludvig', note: 'Til take out Playrun' },
			{ car: TIRIL, driver: 'Maren', note: 'Til Kruke med rookie-kajakker' },
			{ car: CAROLINE, driver: 'Martha', note: 'Til Kruke med rookie-kajakker' }
		],
		afterNote: 'Alle andre rookies sitter på til Kruke.'
	}
];

/** Playrun-gruppene: samme grupper, uten rookiene. */
export const playrunGroups = (run: Run): Group[] =>
	run.groups.map((g) => ({ name: g.name, members: g.members.filter((m) => !isRookie(m)) }));

export type Step = {
	what: string;
	who?: string;
	/** Hvem steget gjelder. Brukes til «velg deg selv». */
	names: string[];
};

const all = [...experienced, ...rookies];
const run1 = [...experienced, ...rookiesRun1];
const run2 = [...experienced, ...rookiesRun2];

/** Hele dagen, steg for steg. */
export const steps = (rack: boolean): Step[] => [
	{
		what: rack
			? 'Kruke → put inn. Alle 22, 17 kajakker, 4 biler.'
			: 'Kruke → put inn. Alle 22, 16 kajakker, 4 biler. Kajakk 17 blir igjen på Kruke.',
		who: 'Torkild (leiebil), Wiktor, Caroline og Tiril kjører. Helenes bil står på Kruke hele dagen.',
		names: all
	},
	{
		what: 'Oppvarming ved put inn: rookies run 1 og alle erfarne.',
		who: 'Bakevjer, ferging, rulle. Ingen rookie på vannet uten en erfaren.',
		names: run1
	},
	{
		what: 'Rookies run 2 kjører bilene til Kruke imens.',
		who: 'Martha (leiebil), Malin F. (Wiktors), Ylva (Carolines), Tiril (egen). Julia og Lene sitter på. Vil dere ha kaffe først: Ysteriet ligger rett ved put inn.',
		names: rookiesRun2
	},
	{ what: 'Run 1: Bru-bru i tre grupper.', names: run1 },
	{
		what: 'Rookies run 2 står på take out Bru-bru når run 1 lander.',
		who: 'Avtal tid før run 1 starter. Ikke stol på mobildekning.',
		names: rookiesRun2
	},
	{
		what: 'Take out Bru-bru: rookies i land. De erfarne padler rett videre ned Playrun.',
		names: run1
	},
	{
		what: 'Anneke (leiebil) og Ludvig (Wiktors) til take out Playrun. Resten til put inn.',
		who: rack
			? 'Tiril (egen, 4 kajakker) og Ylva (Carolines, 2 kajakker). Én rookie sitter på til take out Playrun.'
			: 'Tiril (egen) og Ylva (Carolines, 2 kajakker, to turer, henter kajakk 17 på Kruke). 2 rookie-kajakker blir med hengeren.',
		names: rookies
	},
	{
		what: 'Playrun i land. 11 kajakker på henger og Wiktor. De erfarne til put inn.',
		names: [...experienced, 'Anneke', 'Ludvig']
	},
	{
		what: 'Oppvarming ved put inn: rookies run 2 og alle erfarne.',
		names: run2
	},
	{
		what: 'Rookies run 1 kjører bilene til Kruke imens. Venter der.',
		who: 'Anneke (leiebil), Ludvig (Wiktors), Maren (Tirils). Carolines bil: Sindre, Malin N., Julia eller Lene, den som har lapp. Har ingen: Caroline kjører ned, Maren henter henne i Tirils bil.',
		names: rookiesRun1
	},
	{ what: 'Run 2: Bru-bru i tre grupper.', names: run2 },
	{
		what: 'Rookies run 1 står på take out Bru-bru når run 2 lander.',
		who: 'Avtal tid før run 2 starter.',
		names: rookiesRun1
	},
	{
		what: 'Take out Bru-bru: rookies i land. De erfarne padler rett videre ned Playrun.',
		names: run2
	},
	{
		what: 'Anneke (leiebil) og Ludvig (Wiktors) til take out Playrun. Resten til Kruke.',
		who: rack
			? 'Maren (Tirils, 4 kajakker) og Martha (Carolines, 2 kajakker).'
			: 'Maren (Tirils) og Martha (Carolines, 2 kajakker, to turer, det er rett ved). 2 rookie-kajakker blir med hengeren.',
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
	'17 kajakker: de erfarne har hver sin, rookiene deler på 6. Rookiene er aldri på vannet samtidig, så det trengs aldri mer enn 17 på ett sted.',
	rack
		? 'Kajakkplass per tur: henger 10, Wiktor 4, Tiril 4, Caroline 2. 20 plasser.'
		: 'Kajakkplass per tur: henger 10, Wiktor 4, Caroline 2. 16 plasser. Carolines bil tar en ekstra tur der det trengs.',
	'Seter i de fire bilene: leiebilen 9, Wiktor 5, Tiril 5, Caroline 3. 22, akkurat nok. Helenes bil står på Kruke.',
	'Rookies med lapp: Anneke, Ludvig, Martha, Malin F. og Ylva kjører manuell. Maren og Tiril kjører automat, altså Carolines eller Tirils bil. Sindre, Malin N., Julia og Lene har ikke oppgitt lapp.',
	'Kruke ligger rett ved take out Bru-bru. Ysteriet ligger rett ved put inn.',
	'Take out Bru-bru er put inn Playrun.'
];

/** Hvor man venter. */
export const waiting: string[] = [
	'Ved put inn: Ysteriet. Kafé og bakeri, rett ved. For rookies run 2 mens run 1 varmer opp, og for Marie.',
	'Ved take out: Kruke. Parker bilene på take out, ta én bil hjem, og vær tilbake til avtalt tid.',
	'De som ikke padler, kjører. Da trengs ingen returbil, og alle erfarne kan varme opp med rookiene.',
	'Marie kan være på Kruke eller Ysteriet. Vil hun kjøre, er hun en ekstra sjåfør.'
];

/** Vurderingen. Kort. */
export const verdict: string[] = [
	'Hvert run er Bru-bru med rookies, så Playrun for de erfarne. Rookiene kjører bilene videre mens de erfarne padler Playrun.',
	'Rookiene varmer opp ved put inn med alle de erfarne før hvert run. Bilene flyttes av rookiene som ikke padler, så ingen erfaren trenger å kjøre.',
	'Shuttle før run 2 mangler én sjåfør: en av Sindre, Malin N., Julia eller Lene må ha lapp. Ellers kjører Caroline ned selv og Maren henter henne.',
	'Takstativ på Tirils bil fjerner alle ekstraturer. Uten går det også, med to korte ekstraturer for Carolines bil.',
	'Lang dag for de erfarne: to Bru-bru og to Playrun. Er noen slitne, står de over Playrun på run 2 og kjører til Kruke med rookiene.'
];

/** Kort oppsummering for én person. */
export const summaryFor = (name: string): string[] => {
	const lines: string[] = [];
	const groupIn = (run: Run) => run.groups.find((g) => g.members.includes(name))?.name;
	if (experienced.includes(name)) {
		lines.push('Du padler Bru-bru og Playrun på begge runs.');
		for (const run of runs) lines.push(`${run.title}: ${groupIn(run)}.`);
		lines.push('Du varmer opp med rookiene ved put inn før hvert run.');
	} else if (rookiesRun1.includes(name)) {
		lines.push(`Du padler run 1 (Bru-bru) i ${groupIn(runs[0])}. Oppvarming ved put inn først.`);
		lines.push('På run 2 kjører du bil og venter på Kruke.');
	} else if (rookiesRun2.includes(name)) {
		lines.push('På run 1 kjører du bil og venter på Kruke. Kaffe på Ysteriet først om du vil.');
		lines.push(`Du padler run 2 (Bru-bru) i ${groupIn(runs[1])}. Oppvarming ved put inn først.`);
	} else {
		lines.push('Du padler ikke. Kruke eller Ysteriet, som du vil.');
	}
	for (const run of runs) {
		for (const s of [...run.before, ...run.after]) {
			if (s.driver === name || s.driver.includes(name)) {
				lines.push(`Du kjører ${s.car}${s.note ? ` – ${s.note.toLowerCase()}` : ''}.`);
			}
		}
	}
	if (['Torkild', 'Wiktor', 'Caroline', 'Tiril'].includes(name)) {
		lines.push('Du kjører til put inn om morgenen.');
	}
	return [...new Set(lines)];
};
