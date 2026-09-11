/**
 * Lørdag på elva. To runs. Hvert run er Bru-bru for alle, så Playrun for de
 * erfarne. Rookiene padler ett run hver og varmer opp ved put inn først. De
 * erfarne setter shuttlen imens. De som ikke padler venter på Kruke. Sidene under /runs leser herfra.
 *
 * Fornavn som på resten av siden. Endre her; siden følger med.
 *
 * Kajakker: 17 med. De 10 erfarne har hver sin, rookiene deler på 6, og den
 * 17. står i reserve på Kruke. Kajakkplass: henger 10, Wiktor 4, Tiril 4,
 * Caroline 2. Før hvert run settes Wiktors og Carolines bil på take out
 * Playrun, så begge kjører hjem derfra. Tirils bil tar rookiene fra take out
 * Bru-bru med 4 kajakker, den femte går på hengeren. Helenes bil står på Kruke.
 *
 * `alt` på et kjørelegg er andre som like godt kan kjøre det.
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
	'Maja'
];

/** Rookies som padler run 1 og kjører på run 2. */
export const rookiesRun1 = ['Anneke', 'Ludvig', 'Maren', 'Sindre', 'Ylva', 'Simon'];

/** Rookies som kjører på run 1 og padler run 2. */
export const rookiesRun2 = ['Malin F.', 'Tiril', 'Julia', 'Lene', 'Malin N.'];

export const rookies = [...rookiesRun1, ...rookiesRun2];

export const everyone = [...experienced, ...rookies];

/** Pynt ved navnet, om noen har bedt om det. F.eks. { Caroline: '🌸' }. */
export const flair: Record<string, string> = { Vegard: '🌸' };

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
	/** Andre som like godt kan kjøre denne etappen. */
	alt?: string[];
	/** Bilen står. Ingen kjører. */
	parked?: boolean;
	/** Overstyrer hvor etappen starter, når et kjørelegg er delt i to. */
	from?: string;
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
	/** De som venter på Kruke kjører til take out Bru-bru når runnet lander. */
	toTakeOut: Shuttle[];
	/** Etter Bru-bru: rookiene kjører videre. */
	after: Shuttle[];
	/** Fra take out Playrun. */
	home: Shuttle[];
	/** Rookies som padlet og ikke kjører: hvor de sitter på etterpå. */
	paddlerRide: string;
	/** Rookies som venter og ikke kjører. */
	waiterRide: string;
	/** Erfarne som går i land på take out Bru-bru og står over Playrun. */
	noPlayrun?: string[];
	/** Erfarne som velger selv om de padler Playrun. */
	maybePlayrun?: string[];
};

const LEIEBIL = '9-seteren + hengeren';
const WIKTOR = 'Wiktors bil';
const CAROLINE = 'Carolines bil';
const TIRIL = 'Tirils bil';

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
			{ car: LEIEBIL, driver: 'Torkild', note: 'Til put inn Bru-bru med 10 kajakker', alt: ['Knut', 'Vegard', 'Eskil'] },
			{ car: WIKTOR, driver: 'Wiktor', own: true, note: 'Til put inn Bru-bru med 4 kajakker', alt: ['Eskil', 'Vegard'] },
			{ car: CAROLINE, driver: 'Caroline', own: true, note: 'Til put inn Bru-bru med 2 kajakker', alt: ['Maja', 'Dani'] }
		],
		before: [
			{ car: WIKTOR, driver: 'Wiktor', own: true, note: 'Til take out Playrun, så den står klar når Playrun lander', alt: ['Eskil', 'Vegard'] },
			{ car: CAROLINE, driver: 'Caroline', own: true, note: 'Til take out Playrun, så den står klar når Playrun lander', alt: ['Maja', 'Dani'] },
			{ car: LEIEBIL, driver: 'Torkild', note: 'Til take out Playrun, henter Caroline og Wiktor opp igjen', alt: ['Knut', 'Vegard'] }
		],
		launch: [{ car: LEIEBIL, driver: 'Malin F.', note: 'Til Kruke, der rookies run 2 venter' }],
		toTakeOut: [
			{ car: LEIEBIL, driver: 'Malin F.', note: 'Henter rookies run 1' },
			{ car: TIRIL, driver: 'Tiril', own: true, note: 'Henter rookies run 1' }
		],
		after: [
			{ car: LEIEBIL, driver: 'Ludvig', note: 'Til Kruke med rookies run 1. Simon sitter på', alt: ['Anneke', 'Ylva'] },
			{ car: LEIEBIL, driver: 'Ludvig', from: 'Fra Kruke', note: 'Til take out Playrun, henter de erfarne', alt: ['Anneke', 'Ylva'] },
			{ car: TIRIL, driver: 'Tiril', own: true, note: 'Til put inn Bru-bru med rookies run 2 og 4 kajakker', alt: ['Malin F.'] }
		],
		home: [
			{ car: LEIEBIL, driver: 'Torkild', note: 'Til put inn Bru-bru med de erfarne', alt: ['Knut', 'Vegard', 'Eskil'] },
			{ car: WIKTOR, driver: 'Wiktor', own: true, note: 'Til put inn Bru-bru med de erfarne', alt: ['Eskil', 'Vegard'] },
			{ car: CAROLINE, driver: 'Caroline', own: true, note: 'Til put inn Bru-bru med de erfarne', alt: ['Maja', 'Dani'] }
		],
		paddlerRide: 'Sitter på til Kruke i 9-seteren.',
		waiterRide: 'Blir kjørt til put inn Bru-bru når run 1 lander.',
		noPlayrun: ['Simon']
	},
	{
		n: 2,
		title: 'Run 2',
		groups: [
			{ name: 'Gruppe 1', members: ['Dani', 'Caroline', 'Vegard', 'Julia'] },
			{ name: 'Gruppe 2', members: ['Wiktor', 'Helene', 'Eskil', 'Maja', 'Malin F.', 'Lene'] },
			{ name: 'Gruppe 3', members: ['Torkild', 'Knut', 'Connor', 'Malin N.', 'Tiril'] }
		],
		before: [
			{ car: WIKTOR, driver: 'Wiktor', own: true, note: 'Til take out Playrun, så den står klar når Playrun lander', alt: ['Eskil', 'Vegard'] },
			{ car: CAROLINE, driver: 'Caroline', own: true, note: 'Til take out Playrun, så den står klar når Playrun lander', alt: ['Maja', 'Dani'] },
			{ car: TIRIL, driver: 'Helene', note: 'Til take out Bru-bru, så den står klar når run 2 lander', alt: ['Maja', 'Dani', 'Eskil'] },
			{ car: LEIEBIL, driver: 'Torkild', note: 'Til take out Bru-bru og take out Playrun, henter Helene, Caroline og Wiktor opp igjen', alt: ['Knut', 'Vegard'] }
		],
		launch: [{ car: LEIEBIL, driver: 'Ludvig', note: 'Til Kruke, der rookies run 1 venter', alt: ['Anneke', 'Ylva'] }],
		toTakeOut: [{ car: LEIEBIL, driver: 'Ludvig', note: 'Henter rookies run 2', alt: ['Anneke', 'Ylva'] }],
		after: [
			{ car: LEIEBIL, driver: 'Ludvig', note: 'Til take out Playrun, henter de erfarne. Simon sitter på hvis han står over Playrun', alt: ['Anneke', 'Ylva'] },
			{ car: TIRIL, driver: 'Tiril', own: true, note: 'Til Kruke med rookies run 2 og 4 kajakker', alt: ['Malin F.'] }
		],
		home: [
			{ car: LEIEBIL, driver: 'Torkild', note: 'Til Kruke med de erfarne', alt: ['Knut', 'Vegard', 'Eskil'] },
			{ car: WIKTOR, driver: 'Wiktor', own: true, note: 'Til Kruke med de erfarne', alt: ['Eskil', 'Vegard'] },
			{ car: CAROLINE, driver: 'Caroline', own: true, note: 'Til Kruke med de erfarne', alt: ['Maja', 'Dani'] }
		],
		paddlerRide: 'Sitter på til Kruke.',
		waiterRide: 'Fritid på Kruke. Grillen tenner seg ikke selv.',
		maybePlayrun: ['Simon']
	}
];

/** Alle kjøreleggene i et run, i rekkefølge, med merkelapp. */
export const legsOf = (run: Run): { when: string; legs: Shuttle[] }[] => [
	...(run.morning ? [{ when: 'Fra Kruke til put inn Bru-bru', legs: run.morning }] : []),
	{ when: `Mens run ${run.n} varmer opp`, legs: run.before },
	{ when: `Når run ${run.n} er på vannet`, legs: run.launch },
	{ when: 'Fra Kruke til take out Bru-bru', legs: run.toTakeOut },
	{ when: 'Fra take out Bru-bru', legs: run.after },
	{ when: 'Fra take out Playrun', legs: run.home }
];

/** Alle kjørelegg i et run, flatt. */
export const allLegs = (run: Run): Shuttle[] => legsOf(run).flatMap((b) => b.legs);

export type CarLeg = { run: number; when: string; driver: string; own?: boolean; note?: string; alt?: string[]; parked?: boolean };
export type CarPlan = { car: string; legs: CarLeg[]; idle?: string };

/** Bilene, i den rekkefølgen de vises. */
export const carNames = [LEIEBIL, WIKTOR, CAROLINE, TIRIL, 'Helenes bil'];

export const isCar = (name: string) => carNames.includes(name);

/** Dagen sett fra hver bil: etappene i rekkefølge, med sjåfør. */
export const carPlans = (): CarPlan[] => {
	return carNames.map((car) => {
		const legs: CarLeg[] = [];
		for (const run of runs) {
			for (const block of legsOf(run)) {
				for (const sh of block.legs) {
					if (sh.car === car) legs.push({ run: run.n, when: sh.from ?? block.when, driver: sh.driver, own: sh.own, note: sh.note, alt: sh.alt, parked: sh.parked });
				}
			}
		}
		return { car, legs, idle: legs.length ? undefined : 'Står på Kruke hele dagen. Noen må jo.' };
	});
};

export const carPlan = (car: string): CarPlan | undefined => carPlans().find((c) => c.car === car);

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
export const steps = (): Step[] => [
	{
		what: 'Kruke → put inn Bru-bru: erfarne, rookies run 1 og Malin F. 16 kajakker.',
		who: 'Torkild (9-seter), Wiktor og Caroline kjører. Rookies run 2 sover videre på Kruke, med reservekajakken.',
		names: [...run1, 'Malin F.'],
		drivers: ['Torkild', 'Wiktor', 'Caroline']
	},
	{
		what: 'Run 1 varmer opp. Wiktor og Caroline setter bilene på take out Playrun, Torkild henter dem i 9-seteren.',
		names: [...rookiesRun1, 'Wiktor', 'Caroline', 'Torkild'],
		drivers: ['Wiktor', 'Caroline', 'Torkild']
	},
	{
		what: 'Run 1: Bru-bru. Malin F. kjører 9-seteren til Kruke.',
		names: [...run1, 'Malin F.'],
		drivers: ['Malin F.']
	},
	{
		what: 'Rookies run 2 står på take out Bru-bru når run 1 lander. Rookiene og Simon i land, resten av de erfarne rett videre ned Playrun.',
		who: 'Malin F. (9-seter), Tiril (egen).',
		names: [...run1, ...rookiesRun2],
		drivers: ['Malin F.', 'Tiril']
	},
	{
		what: 'Ludvig (9-seter) setter av rookies run 1 på Kruke og kjører videre til take out Playrun, der Wiktors bil står. Simon sitter på. Tiril kjører rookies run 2 til put inn Bru-bru.',
		who: 'Rookie-kajakkene: 4 på Tiril, resten på hengeren.',
		names: rookies,
		drivers: ['Ludvig', 'Tiril']
	},
	{
		what: 'Playrun i land. Torkild (9-seter), Wiktor og Caroline kjører alle til put inn Bru-bru.',
		names: [...experienced, 'Ludvig'],
		drivers: ['Torkild', 'Wiktor', 'Caroline']
	},
	{
		what: 'Run 2 varmer opp. Wiktor og Caroline setter bilene på take out Playrun, Helene setter Tirils bil på take out Bru-bru. Torkild henter dem i 9-seteren.',
		names: [...rookiesRun2, 'Wiktor', 'Caroline', 'Helene', 'Torkild'],
		drivers: ['Wiktor', 'Caroline', 'Helene', 'Torkild']
	},
	{
		what: 'Run 2: Bru-bru. Ludvig kjører 9-seteren til Kruke.',
		names: [...run2, 'Ludvig'],
		drivers: ['Ludvig']
	},
	{
		what: 'Ludvig står på take out Bru-bru med 9-seteren når run 2 lander. Rookiene i land, erfarne rett videre ned Playrun. Simon velger selv.',
		names: [...run2, 'Ludvig'],
		drivers: ['Ludvig']
	},
	{
		what: 'Tiril kjører rookies run 2 til Kruke. Ludvig (9-seter) rett til take out Playrun.',
		who: 'Rookie-kajakkene: 4 på Tiril, resten på hengeren.',
		names: [...rookiesRun2, 'Ludvig'],
		drivers: ['Ludvig', 'Tiril']
	},
	{
		what: 'Playrun i land. Torkild (9-seter), Wiktor og Caroline kjører alle til Kruke. Grillen venter.',
		names: [...experienced, 'Ludvig'],
		drivers: ['Torkild', 'Wiktor', 'Caroline']
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
/** Planen for én person, kronologisk: morgen, run 1, run 2. */
export const planFor = (name: string): PlanPart[] => {
	const team = teamOf(name);
	const morning: PlanLine[] = [];
	const m = drives(runs[0].morning ?? [], name);
	if (m.length) for (const sh of m) morning.push({ kind: 'drive', text: driveLine(sh) });
	else if (team === 'exp' || team === 'rookie1' || name === 'Malin F.') morning.push({ kind: 'go', text: 'Sitter på til put inn Bru-bru.' });
	else morning.push({ kind: 'wait', text: 'Sov lenge. Tirils bil står på Kruke.' });

	const part = (run: Run): PlanLine[] => {
		const group = run.groups.find((g) => g.members.includes(name))?.name.toLowerCase();
		const lines: PlanLine[] = [];
		const push = (kind: PlanKind, when: string | undefined, text: string) => lines.push({ kind, when, text });
		const dest = run.n === 1 ? 'put inn Bru-bru' : 'Kruke';

		if (team === 'exp') {
			const b = drives(run.before, name);
			if (b.length) {
				for (const sh of b) {
					push(
						'drive',
						`Mens run ${run.n} varmer opp ved put inn Bru-bru`,
						sh.car === LEIEBIL ? driveLine(sh) : `${driveLine(sh)} Torkild henter deg i 9-seteren.`
					);
				}
			} else {
				push('paddle', `Mens run ${run.n} varmer opp`, 'Fri. Varm opp, eller finn en god stein.');
			}
			const skips = run.noPlayrun?.includes(name);
			const maybe = run.maybePlayrun?.includes(name);
			if (skips) {
				push('paddle', `Run ${run.n}`, `Bru-bru i ${group}. Playrun står du over.`);
				push('ride', 'Take out Bru-bru', `Sitter på med Ludvig i 9-seteren til ${dest}.`);
			} else {
				push('paddle', `Run ${run.n}`, maybe ? `Bru-bru i ${group}, så Playrun hvis du vil.` : `Bru-bru i ${group}, så rett videre ned Playrun.`);
				if (maybe) push('ride', 'Take out Bru-bru', 'Står du over Playrun: sitter på med Ludvig i 9-seteren.');
				const h = drives(run.home, name);
				if (h.length) for (const sh of h) push('drive', 'Take out Playrun', `Du kjører ${car(sh)} til ${dest}.`);
				else push('ride', 'Take out Playrun', `Sitter på til ${dest}.`);
			}
		} else if (group) {
			push('paddle', 'Put inn Bru-bru', `Oppvarming, så Bru-bru i ${group}.`);
			const d = drives(run.after, name);
			if (d.length) for (const sh of d) push('drive', sh.from?.replace(/^Fra /, '') ?? 'Take out Bru-bru', driveLine(sh));
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
				for (const sh of t) push('drive', 'Kruke → take out Bru-bru', `Du kjører ${car(sh)} dit. ${sh.note ?? ''}`.trim() + (sh.note ? '.' : ''));
				if (!t.length) push('ride', 'Kruke → take out Bru-bru', 'Sitter på.');
				for (const sh of d) push('drive', sh.from?.replace(/^Fra /, '') ?? `Når run ${run.n} lander`, driveLine(sh));
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
