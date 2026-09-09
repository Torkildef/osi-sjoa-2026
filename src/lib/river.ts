/**
 * Elva: strekningene vi padler, og det som ligger langs dem.
 *
 * To lag med data:
 *
 * 1. `sections` her i fila – navn, gradering, beskrivelse og punktene langs
 *    strekningen (stryk, playspots, farer, portasjer). Redigeres for hånd.
 * 2. `data/sjoa.json` – selve elveløpet som koordinatlister, én per strekning.
 *    Hentes fra OpenStreetMap med `node scripts/hent-elv.mjs`. Så lenge fila er
 *    tom tegnes strekningene som stiplede linjer rett fra put inn til take out.
 *
 * Punkter langs elva plasseres med `at`: hvor langt inn i strekningen de ligger,
 * fra 0 (put inn) til 1 (take out). Det holder for elveprofilen på Elven-siden.
 * Legg til `coords` når punktet skal på kartet – da vises det der også.
 */
import geometry from './data/sjoa.json';
import { placeByName } from './places';

export type Grade = 'I' | 'II' | 'II+' | 'III' | 'III+' | 'IV' | 'IV+' | 'V';

export type FeatureKind =
	| 'putin'
	| 'takeout'
	| 'rapid'
	| 'play'
	| 'hazard'
	| 'portage'
	| 'scout'
	| 'bridge';

export type RiverFeature = {
	name: string;
	kind: FeatureKind;
	/** Gradering for stryk. Utelates på alt annet. */
	grade?: Grade;
	note?: string;
	/** Posisjon langs strekningen, 0 = put inn, 1 = take out. */
	at: number;
	/** [breddegrad, lengdegrad]. Null til noen har vært der med telefonen. */
	coords: [number, number] | null;
};

export type SectionId = keyof typeof geometry.sections;

export type Section = {
	id: SectionId;
	name: string;
	/** Samlet gradering for strekningen, slik den står i turbeskrivelser. */
	grade: string;
	/** Linjefarge på kartet og i elveprofilen. */
	color: string;
	/** Navn på steder i places.ts. */
	from: string;
	to: string;
	description: string;
	/** Korte merkelapper ved graderingen, som «Rullekrav». */
	tags?: string[];
	/** Lengde fra turbeskrivelser, brukt til elveløpet er hentet inn. */
	lengthKm?: number;
	/** Om vannføring: hva som er lavt, hva som endrer seg med mer vann. */
	flowNote?: string;
	/** Hvor beskrivelsen kommer fra, og hva som er usikkert. */
	sourceNote?: string;
	features: RiverFeature[];
};

/** Hva de ulike punkttypene heter og hvordan de ser ut. */
export const featureKinds: Record<FeatureKind, { label: string; emoji: string }> = {
	putin: { label: 'Put inn', emoji: '🛶' },
	takeout: { label: 'Take out', emoji: '🏁' },
	rapid: { label: 'Stryk', emoji: '🌊' },
	play: { label: 'Playspot', emoji: '🤸' },
	hazard: { label: 'Fare', emoji: '⚠️' },
	portage: { label: 'Bæring', emoji: '🚶' },
	scout: { label: 'Se an fra land', emoji: '👀' },
	bridge: { label: 'Bru', emoji: '🌉' }
};

export const sections: Section[] = [
	{
		id: 'bru-bru',
		name: 'Bru-bru',
		grade: 'II',
		color: '#0b7a75',
		from: 'Put inn – Bru-bru',
		to: 'Take out Bru-bru / put inn Playrun',
		description:
			'Fra bru til bru gjennom Heidal. Passer for nybegynnere: for det meste rolig, jevn strøm ned til brua der Playrun starter.',
		features: [
			// Fyll inn stryk og nøkkelpunkter her etter hvert. Eksempel:
			// { name: 'Første stryket', kind: 'rapid', grade: 'II+', at: 0.3, coords: null, note: 'Hold høyre.' },
		]
	},
	{
		id: 'playrun',
		name: 'Playrun',
		grade: 'III',
		color: '#c2410c',
		from: 'Take out Bru-bru / put inn Playrun',
		to: 'Take out – Playrun',
		description:
			'Sjoas klassiker, og trolig Norges mest padlede strekning. For mer erfarne. Fra Harlaug bru til Faukstad: stryk på rekke og rad med rolige partier imellom, bakevjer ved hullene og flere kjente surfebølger.',
		tags: ['Rullekrav'],
		lengthKm: 6.5,
		flowNote:
			'Linjene er stort sett de samme fra 25 til 100 m³/s – bølgene og hullene blir bare større med mer vann. Rundt 25 m³/s er det steinete og mer teknisk.',
		sourceNote:
			'Stryk etter beskrivelser fra Mad Goats, A Wet State og Nokken. Rekkefølgen stemmer, plasseringen langs linja er omtrentlig.',
		features: [
			{
				name: 'Golf Stream',
				kind: 'rapid',
				grade: 'II+',
				at: 0.08,
				coords: null,
				note: 'Første stryket etter put inn ved Harlaug bru. Stort hull på venstre side – hold deg midt i elva. Hullet er en populær playspot.'
			},
			{
				name: 'Micro-surf',
				kind: 'play',
				at: 0.2,
				coords: null,
				note: 'Liten, snill bølge å øve surfing på.'
			},
			{
				name: 'Haystacks',
				kind: 'rapid',
				grade: 'II',
				at: 0.3,
				coords: null,
				note: 'Rad med store, ufarlige bølger.'
			},
			{
				name: 'Grønn bølge',
				kind: 'play',
				at: 0.5,
				coords: null,
				note: 'Fin, grønn surfebølge på venstre side omtrent halvveis.'
			},
			{
				name: 'Big Bend / Chocolate Canyon',
				kind: 'rapid',
				grade: 'III',
				at: 0.65,
				coords: null,
				note: 'Elva smalner og blir brattere gjennom en kort kløft med lagdelte skiferfjell. Selve hjertet av Playrun – her henger stryka sammen.'
			},
			{
				name: 'Faukstad-bølga',
				kind: 'play',
				at: 0.8,
				coords: null,
				note: 'Kjent rodeobølge rett ovenfor brua ved Nedre Heidal. Lite, men kraftig hull rett nedenfor bølga.'
			},
			{
				name: 'Brua ved Nedre Heidal',
				kind: 'bridge',
				at: 0.83,
				coords: null,
				note: 'Den eneste brua du padler under på strekningen.'
			},
			{
				name: 'China Hole',
				kind: 'rapid',
				grade: 'III',
				at: 0.86,
				coords: null,
				note: 'Faukstad-stryket, rett etter brua. Linja er midt-venstre: ikke midt i elva, og ikke helt til venstre.'
			},
			{
				name: 'Øyene',
				kind: 'rapid',
				grade: 'II',
				at: 0.93,
				coords: null,
				note: 'Elva åpner seg igjen, med flere morsomme stryk rundt skogkledde øyer.'
			},
			{
				name: 'Washing Machine',
				kind: 'rapid',
				grade: 'III',
				at: 0.97,
				coords: null,
				note: 'Også kalt Tjuvspranget. Avslutter strekningen med et smell rett før take out ved raftingbasene på Faukstad.'
			}
		]
	}
];

export const sectionById = (id: string) => sections.find((s) => s.id === id);

/** Er elveløpet for strekningen hentet inn, eller tegnes den fortsatt rett fram? */
export function isTraced(section: Section): boolean {
	return (geometry.sections[section.id] as number[][]).length >= 2;
}

/**
 * Linja som tegnes på kartet: elveløpet når det finnes, ellers rett strek fra
 * put inn til take out. Tom liste når et av stedene mangler koordinat.
 */
export function lineFor(section: Section): [number, number][] {
	if (isTraced(section)) return geometry.sections[section.id] as [number, number][];
	const from = placeByName(section.from)?.coords;
	const to = placeByName(section.to)?.coords;
	return from && to ? [from, to] : [];
}

/** Når og hvor elveløpet ble hentet – null så lenge fila er tom. */
export const geometryInfo = { source: geometry.source, fetched: geometry.fetched };

/** Lengde langs en linje i kilometer, med én desimal. */
export function lengthKm(line: [number, number][]): number {
	let total = 0;
	for (let i = 1; i < line.length; i++) total += distanceM(line[i - 1], line[i]);
	return Math.round(total / 100) / 10;
}

function distanceM([lat1, lon1]: [number, number], [lat2, lon2]: [number, number]): number {
	const R = 6_371_000;
	const toRad = (d: number) => (d * Math.PI) / 180;
	const dLat = toRad(lat2 - lat1);
	const dLon = toRad(lon2 - lon1);
	const a =
		Math.sin(dLat / 2) ** 2 +
		Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
	return 2 * R * Math.asin(Math.sqrt(a));
}

/**
 * Punktene i en strekning i rekkefølge fra put inn til take out, med put inn og
 * take out lagt til som første og siste punkt. Det er dette elveprofilen tegner.
 */
export function profileFor(section: Section): RiverFeature[] {
	const from = placeByName(section.from);
	const to = placeByName(section.to);
	const ends: RiverFeature[] = [];
	if (from) ends.push({ name: from.name, kind: 'putin', at: 0, coords: from.coords, note: from.note });
	if (to) ends.push({ name: to.name, kind: 'takeout', at: 1, coords: to.coords, note: to.note });
	return [...ends, ...section.features].sort((a, b) => a.at - b.at);
}

/** Sant så lenge gradering og stryk ikke er kvalitetssikret av noen som har padlet dem. */
export const riverIsDraft = false;
