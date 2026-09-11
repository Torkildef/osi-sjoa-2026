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

export const everyone = [...experienced, ...rookies];

/** Pynt ved navnet, om noen har bedt om det. F.eks. { Caroline: '🌸' }. */
export const flair: Record<string, string> = {};

/** Navn med eventuell pynt. */
export const shown = (first: string) => (flair[first] ? `${first} ${flair[first]}` : first);

/** Fornavn slik de står i deltakerlista, der kortformen over avviker. */
const alias: Record<string, string> = { Dani: 'Danielle', Knut: 'Knut-Erik' };

export const personFor = (first: string): Person | undefined => {
	const wanted = alias[first] ?? first;
	return people.find((p) => shortName(p) === wanted || p.name.split(/\s+/)[0] === wanted);
};

export const isRookie = (first: string) => personFor(first)?.rookie === true;

export type Team = 'exp' | 'rookie1' | 'rookie2' | 'none';

/** Hvilket lag et navn hører til. Styrer fargen. */
export const teamOf = (first: string): Team =>
	experienced.includes(first)
		? 'exp'
		: rookiesRun1.includes(first)
			? 'rookie1'
			: rookiesRun2.includes(first)
				? 'rookie2'
				: 'none';

export const teamLabel: Record<Team, string> = {
	exp: 'Erfaren',
	rookie1: 'Rookie · run 1',
	rookie2: 'Rookie · run 2',
	none: 'Med'
};

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
	/** Bare run 1: fra Kruke til put inn Bru-bru om morgenen. */
	morning?: Shuttle[];
	/** Mens rookiene varmer opp: de erfarne setter shuttlen. */
	before: Shuttle[];
	/** Når runnet er på vannet: 9-seteren til Kruke. */
	launch: Shuttle[];
	/** De som venter på Kruke kjører til take out til avtalt tid. */
	toTakeOut: Shuttle[];
	/** Etter Bru-bru: rookiene kjører videre. */
	after: Shuttle[];
	/** Fra take out Playrun. */
	home: Shuttle[];
	/** Rookies som padlet og ikke kjører: hvor de sitter på etterpå. */
	paddlerRide: string;
	/** Rookies som ventet og ikke kjører: hvor de sitter på etterpå. */
	waiterRide: string;
};

const LEIEBIL = '9-seteren + hengeren';
const WIKTOR = 'Wiktors bil';
const CAROLINE = 'Carolines bil';
const TIRIL = 'Tirils bil';
const HELENE = 'Helenes bil';

export const runs: Run[] = [
	{
		n: 1,
		title: 'Run 1',
		groups: [
			{ name: 'Gruppe 1', members: ['Dani', 'Caroline', 'Vegard', 'Simon', 'Anneke', 'Sindre'] },
			{ name: 'Gruppe 2', members: ['Wiktor', 'Helene', 'Eskil', 'Maja', 'Ludvig', 'Ylva'] },
			{ name: 'Gruppe 3', members: ['Torkild', 'Knut', 'Connor', 'Maren'] }
		],
		morning: [
			{ car: LEIEBIL, driver: 'Torkild', note: 'Til put inn Bru-bru med 10 kajakker' },
			{ car: WIKTOR, driver: 'Wiktor', own: true, note: 'Til put inn Bru-bru med 4 kajakker' },
			{ car: CAROLINE, driver: 'Caroline', own: true, note: 'Til put inn Bru-bru med 2 kajakker' }
		],
		before: [
			{ car: WIKTOR, driver: 'Wiktor', own: true, note: 'Til take out Playrun' },
			{ car: CAROLINE, driver: 'Caroline', own: true, note: 'Til take out Bru-bru' },
			{ car: LEIEBIL, driver: 'Torkild', note: 'Henter de to opp igjen' }
		],
		launch: [{ car: LEIEBIL, driver: 'Martha', note: 'Til Kruke' }],
		toTakeOut: [
			{ car: LEIEBIL, driver: 'Martha' },
			{ car: TIRIL, driver: 'Tiril', own: true },
			{ car: HELENE, driver: 'Malin F.' }
		],
		after: [
			{ car: LEIEBIL, driver: 'Ludvig', note: 'Til take out Playrun' },
			{ car: TIRIL, driver: 'Tiril', own: true, note: 'Til put inn Bru-bru med rookies run 2 og kajakkene' },
			{ car: CAROLINE, driver: 'Malin F.', note: 'Til put inn Bru-bru med rookies run 2 og kajakkene' },
			{ car: HELENE, driver: 'Ylva', note: 'Til Kruke med Anneke, Maren og Sindre' }
		],
		home: [
			{ car: LEIEBIL, driver: 'Torkild', note: 'Til put inn Bru-bru' },
			{ car: WIKTOR, driver: 'Wiktor', own: true, note: 'Til put inn Bru-bru' }
		],
		paddlerRide: 'Til Kruke med Ylva.',
		waiterRide: 'Blir kjørt til put inn Bru-bru når run 1 lander.'
	},
	{
		n: 2,
		title: 'Run 2',
		groups: [
			{ name: 'Gruppe 1', members: ['Dani', 'Caroline', 'Vegard', 'Simon', 'Martha', 'Julia'] },
			{ name: 'Gruppe 2', members: ['Wiktor', 'Helene', 'Eskil', 'Maja', 'Malin F.', 'Lene'] },
			{ name: 'Gruppe 3', members: ['Torkild', 'Knut', 'Connor', 'Malin N.', 'Tiril'] }
		],
		before: [
			{ car: WIKTOR, driver: 'Wiktor', own: true, note: 'Til take out Playrun' },
			{ car: CAROLINE, driver: 'Caroline', own: true, note: 'Til take out Bru-bru' },
			{ car: TIRIL, driver: 'Maja', note: 'Automat. Til take out Bru-bru' },
			{ car: LEIEBIL, driver: 'Torkild', note: 'Henter de tre opp igjen' }
		],
		launch: [{ car: LEIEBIL, driver: 'Ludvig', note: 'Til Kruke' }],
		toTakeOut: [
			{ car: LEIEBIL, driver: 'Ludvig' },
			{ car: HELENE, driver: 'Ylva' }
		],
		after: [
			{ car: LEIEBIL, driver: 'Ludvig', note: 'Til take out Playrun' },
			{ car: TIRIL, driver: 'Tiril', own: true, note: 'Til Kruke med kajakker' },
			{ car: CAROLINE, driver: 'Martha', note: 'Til Kruke med kajakker' },
			{ car: HELENE, driver: 'Ylva', note: 'Til Kruke med Anneke' }
		],
		home: [
			{ car: LEIEBIL, driver: 'Torkild', note: 'Til Kruke' },
			{ car: WIKTOR, driver: 'Wiktor', own: true, note: 'Til Kruke' }
		],
		paddlerRide: 'Sitter på til Kruke.',
		waiterRide: 'Fritid på Kruke. Grillen tenner seg ikke selv.'
	}
];

/** Alle kjøreleggene i et run, i rekkefølge, med merkelapp. */
export const legsOf = (run: Run): { when: string; legs: Shuttle[] }[] => [
	...(run.morning ? [{ when: 'Fra Kruke til put inn Bru-bru', legs: run.morning }] : []),
	{ when: `Mens run ${run.n} varmer opp`, legs: run.before },
	{ when: `Når run ${run.n} er på vannet`, legs: run.launch },
	{ when: 'Fra Kruke til take out Bru-bru, til avtalt tid', legs: run.toTakeOut },
	{ when: 'Fra take out Bru-bru', legs: run.after },
	{ when: 'Fra take out Playrun', legs: run.home }
];

/** Alle kjørelegg i et run, flatt. */
export const allLegs = (run: Run): Shuttle[] => legsOf(run).flatMap((b) => b.legs);

export type Step = {
	what: string;
	who?: string;
	/** Hvem steget gjelder. Brukes til «velg deg selv». */
	names: string[];
	/** Hvem som kjører i dette steget. */
	drivers?: string[];
};

const run1 = [...experienced, ...rookiesRun1];
const run2 = [...experienced, ...rookiesRun2];

/** Hele dagen, steg for steg. */
export const steps = (rack: boolean): Step[] => [
	{
		what: 'Kruke → put inn Bru-bru: erfarne, rookies run 1 og Martha.',
		who: 'Torkild (9-seter), Wiktor og Caroline kjører. Rookies run 2 sover videre på Kruke.',
		names: [...run1, 'Martha'],
		drivers: ['Torkild', 'Wiktor', 'Caroline']
	},
	{
		what: 'Run 1 varmer opp. Wiktor setter bilen på take out Playrun, Caroline på take out Bru-bru. Torkild henter dem i 9-seteren.',
		names: [...rookiesRun1, 'Wiktor', 'Caroline', 'Torkild'],
		drivers: ['Wiktor', 'Caroline', 'Torkild']
	},
	{
		what: 'Run 1: Bru-bru. Martha kjører 9-seteren til Kruke.',
		names: [...run1, 'Martha'],
		drivers: ['Martha']
	},
	{
		what: 'Rookies run 2 står på take out Bru-bru til avtalt tid. Rookiene i land, erfarne rett videre ned Playrun.',
		who: 'Martha (9-seter), Tiril (egen), Malin F. (Helenes).',
		names: [...run1, ...rookiesRun2],
		drivers: ['Martha', 'Tiril', 'Malin F.']
	},
	{
		what: 'Ludvig (9-seter) til take out Playrun, der Wiktors bil står. Tiril og Malin F. (Carolines) til put inn Bru-bru med rookies run 2. Ylva (Helenes) til Kruke med Anneke, Maren og Sindre.',
		who: rack
			? '6 rookie-kajakker: 4 på Tiril, 2 på Caroline. Carolines bil innom Kruke etter kajakk 17.'
			: '6 rookie-kajakker: Caroline kjører to turer og henter kajakk 17 på Kruke. 2 blir med hengeren.',
		names: rookies,
		drivers: ['Ludvig', 'Tiril', 'Malin F.', 'Ylva']
	},
	{
		what: 'Playrun i land. Torkild (9-seter) og Wiktor kjører alle til put inn Bru-bru.',
		names: [...experienced, 'Ludvig'],
		drivers: ['Torkild', 'Wiktor']
	},
	{
		what: 'Run 2 varmer opp. Wiktor setter bilen på take out Playrun, Caroline og Maja (Tirils) på take out Bru-bru. Torkild henter dem i 9-seteren.',
		names: [...rookiesRun2, 'Wiktor', 'Caroline', 'Maja', 'Torkild'],
		drivers: ['Wiktor', 'Caroline', 'Maja', 'Torkild']
	},
	{
		what: 'Run 2: Bru-bru. Ludvig kjører 9-seteren til Kruke.',
		names: [...run2, 'Ludvig'],
		drivers: ['Ludvig']
	},
	{
		what: 'Rookies run 1 står på take out Bru-bru til avtalt tid. Rookiene i land, erfarne rett videre ned Playrun.',
		who: 'Ludvig (9-seter), Ylva (Helenes).',
		names: [...run2, ...rookiesRun1],
		drivers: ['Ludvig', 'Ylva']
	},
	{
		what: 'Ludvig (9-seter) til take out Playrun, der Wiktors bil står. Tiril, Martha (Carolines) og Ylva (Helenes) til Kruke med resten.',
		who: rack ? '6 rookie-kajakker: 4 på Tiril, 2 på Caroline.' : '6 rookie-kajakker: Caroline kjører to turer, det er rett ved. 2 blir med hengeren.',
		names: rookies,
		drivers: ['Ludvig', 'Tiril', 'Martha', 'Ylva']
	},
	{
		what: 'Playrun i land. Torkild (9-seter) og Wiktor kjører alle til Kruke. Grillen venter.',
		names: [...experienced, 'Ludvig'],
		drivers: ['Torkild', 'Wiktor']
	}
];

export type PlanKind = 'go' | 'paddle' | 'drive' | 'wait' | 'ride';
export type PlanLine = { kind: PlanKind; when?: string; text: string };
export type PlanPart = { title: string; tone: 'morning' | 'run1' | 'run2'; lines: PlanLine[] };

export const planIcon: Record<PlanKind, string> = {
	go: '🚙',
	paddle: '🛶',
	drive: '🚗',
	wait: '🏠',
	ride: '💺'
};

const car = (sh: Shuttle) => (sh.own ? 'bilen din' : sh.car === LEIEBIL ? '9-seteren' : sh.car);
const drives = (list: Shuttle[], name: string) => list.filter((sh) => sh.driver === name);
/** «Du kjører Carolines bil til Kruke med kajakkene.» */
const driveLine = (sh: Shuttle) =>
	sh.note?.startsWith('Til ')
		? `Du kjører ${car(sh)} ${sh.note[0].toLowerCase()}${sh.note.slice(1)}.`
		: `Du kjører ${car(sh)}. ${sh.note ?? ''}`.trim();
const names = (list: string[]) =>
	list.length > 1 ? `${list.slice(0, -1).join(', ')} og ${list[list.length - 1]}` : (list[0] ?? '');

/** Planen for én person, kronologisk: morgen, run 1, run 2. */
export const planFor = (name: string): PlanPart[] => {
	const team = teamOf(name);
	const morning: PlanLine[] = [];
	const m = drives(runs[0].morning ?? [], name);
	if (m.length) for (const sh of m) morning.push({ kind: 'drive', text: driveLine(sh) });
	else if (team === 'exp' || team === 'rookie1' || name === 'Martha') morning.push({ kind: 'go', text: 'Sitter på til put inn Bru-bru.' });
	else morning.push({ kind: 'wait', text: 'Sov lenge. Tirils og Helenes bil står på Kruke.' });

	const part = (run: Run): PlanLine[] => {
		const group = run.groups.find((g) => g.members.includes(name))?.name.toLowerCase();
		const lines: PlanLine[] = [];
		const push = (kind: PlanKind, when: string | undefined, text: string) => lines.push({ kind, when, text });
		const dest = run.n === 1 ? 'put inn Bru-bru' : 'Kruke';

		if (team === 'exp') {
			const b = drives(run.before, name);
			const others = run.before.filter((sh) => sh.driver !== name && sh.car !== LEIEBIL).map((sh) => sh.driver);
			if (b.length) {
				for (const sh of b) {
					push(
						'drive',
						`Mens run ${run.n} varmer opp ved put inn Bru-bru`,
						sh.car === LEIEBIL
							? `Du følger ${names(others)} i 9-seteren og henter dem opp igjen.`
							: `${driveLine(sh)} Torkild henter deg i 9-seteren.`
					);
				}
			} else {
				push('paddle', `Mens run ${run.n} varmer opp`, 'Fri. Varm opp, eller finn en god stein.');
			}
			push('paddle', `Run ${run.n}`, `Bru-bru i ${group}, så rett videre ned Playrun.`);
			const h = drives(run.home, name);
			if (h.length) for (const sh of h) push('drive', 'Take out Playrun', `Du kjører ${car(sh)} til ${dest}.`);
			else push('ride', 'Take out Playrun', `Sitter på til ${dest}.`);
		} else if (group) {
			push('paddle', 'Put inn Bru-bru', `Oppvarming, så Bru-bru i ${group}.`);
			const d = drives(run.after, name);
			if (d.length) for (const sh of d) push('drive', 'Take out Bru-bru', driveLine(sh));
			else push('ride', 'Take out Bru-bru', run.paddlerRide);
			if (d.some((sh) => sh.note?.includes('take out Playrun'))) push('ride', 'Take out Playrun', `Sitter på til ${dest}.`);
		} else {
			const l = drives(run.launch, name);
			const t = drives(run.toTakeOut, name);
			const d = drives(run.after, name);
			for (const sh of l) push('drive', `Når run ${run.n} er på vannet`, driveLine(sh));
			if (!t.length && !d.length) {
				push('wait', 'Kruke', run.waiterRide);
			} else {
				push('wait', 'Kruke', 'Fritid.');
				for (const sh of t) push('drive', 'Til avtalt tid', `Du kjører ${car(sh)} til take out Bru-bru.`);
				if (!t.length) push('ride', 'Til avtalt tid', 'Sitter på til take out Bru-bru.');
				for (const sh of d) push('drive', `Når run ${run.n} lander`, driveLine(sh));
				if (!d.length) push('ride', `Når run ${run.n} lander`, `Sitter på til ${dest}.`);
			}
		}
		return lines;
	};

	return [
		{ title: 'Morgen', tone: 'morning', lines: morning },
		{ title: 'Run 1', tone: 'run1', lines: part(runs[0]) },
		{ title: 'Run 2', tone: 'run2', lines: part(runs[1]) }
	];
};

/** Stedsnavn i teksten som lenker til kartet. Lengste først, så «take out Bru-bru» vinner over «Bru-bru». */
const placeLinks: [string, string][] = [
	['take out Bru-bru', 'Take out Bru-bru / put inn Playrun'],
	['take out Playrun', 'Take out – Playrun'],
	['put inn Bru-bru', 'Put inn – Bru-bru'],
	['Ysteriet', 'Ysteriet'],
	['Kruke', 'Kruke gård']
];

const placePattern = new RegExp(
	'(' + placeLinks.map(([phrase]) => phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')',
	'gi'
);

export type Segment = { text: string; href?: string };

/** Deler en tekst i biter der stedsnavn får lenke til /kart. */
export const linkify = (text: string): Segment[] =>
	text
		.split(placePattern)
		.filter((part) => part !== '')
		.map((part) => {
			const hit = placeLinks.find(([phrase]) => phrase.toLowerCase() === part.toLowerCase());
			return hit ? { text: part, href: `/kart?sted=${encodeURIComponent(hit[1])}` } : { text: part };
		});
