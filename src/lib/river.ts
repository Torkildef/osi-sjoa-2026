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
			'Fra bru til bru, akkurat som navnet lover. Rolig nok til at du rekker å nyte utsikten, og akkurat nok strøm til at du føler deg som en helt når du treffer bakevja. Kajakken flyter stort sett dit den skal.',
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
			'Sjoas svar på en fornøyelsespark: bølger å surfe på, hull å bli kjent med, og bakevjer der du kan tenke over livsvalgene dine. Rullekrav, fordi elva ikke tar imot unnskyldninger.',
		tags: ['Rullekrav'],
		lengthKm: 6.5,
		flowNote: 'Samme linjer fra 25 til 100 m³/s – det blir bare mer av alt.',
		sourceNote: 'Rekkefølgen stemmer, plasseringen på kartet er omtrentlig til noen padler med GPS.',
		features: [
			{
				name: 'Golf Stream',
				kind: 'rapid',
				grade: 'II+',
				at: 0.08,
				coords: null,
				note: 'Første stryket. Stort hull til venstre – hold deg midt i elva, med mindre du vil hilse på det.'
			},
			{
				name: 'Micro-surf',
				kind: 'play',
				at: 0.2,
				coords: null,
				note: 'Liten, snill bølge. Perfekt for å late som du kan surfe.'
			},
			{
				name: 'Haystacks',
				kind: 'rapid',
				grade: 'II',
				at: 0.3,
				coords: null,
				note: 'Store, ufarlige bølger på rekke. Ren fornøyelse.'
			},
			{
				name: 'Grønn bølge',
				kind: 'play',
				at: 0.5,
				coords: null,
				note: 'Grønn surfebølge på venstre side, omtrent halvveis.'
			},
			{
				name: 'Big Bend / Chocolate Canyon',
				kind: 'rapid',
				grade: 'III',
				at: 0.65,
				coords: null,
				note: 'Kort kløft der elva smalner og stryka henger sammen. Hjertet av Playrun.'
			},
			{
				name: 'Faukstad-bølga',
				kind: 'play',
				at: 0.8,
				coords: null,
				note: 'Kjent rodeobølge rett før brua. Lite, men kraftig hull rett nedenfor – det vet hva det driver med.'
			},
			{
				name: 'Brua ved Nedre Heidal',
				kind: 'bridge',
				at: 0.83,
				coords: null,
				note: 'Den eneste brua på strekningen. Vink til publikum.'
			},
			{
				name: 'China Hole',
				kind: 'rapid',
				grade: 'III',
				at: 0.86,
				coords: null,
				note: 'Rett etter brua. Linja er midt-venstre – ikke midt, ikke helt venstre. Ja, det er så presist det blir.'
			},
			{
				name: 'Øyene',
				kind: 'rapid',
				grade: 'II',
				at: 0.93,
				coords: null,
				note: 'Elva åpner seg, og du får velge løp rundt øyene. Alle er riktige. Nesten.'
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

/**
 * Punktet som ligger `at` (0–1) av veien langs linja. Brukes for punkter uten
 * koordinat: de plasseres langs elvelinja etter posisjonen sin i profilen, og
 * havner dermed på selve elva så snart elveløpet er hentet inn.
 */
export function pointAlong(line: [number, number][], at: number): [number, number] | null {
	if (line.length === 0) return null;
	if (line.length === 1) return line[0];
	const total = line.slice(1).reduce((sum, p, i) => sum + distanceM(line[i], p), 0);
	let target = Math.min(1, Math.max(0, at)) * total;
	for (let i = 1; i < line.length; i++) {
		const seg = distanceM(line[i - 1], line[i]);
		if (target <= seg || i === line.length - 1) {
			const t = seg === 0 ? 0 : target / seg;
			return [
				line[i - 1][0] + (line[i][0] - line[i - 1][0]) * t,
				line[i - 1][1] + (line[i][1] - line[i - 1][1]) * t
			];
		}
		target -= seg;
	}
	return line.at(-1) ?? null;
}

/** Der et punkt tegnes på kartet: egen koordinat, ellers langs elvelinja. */
export function featurePosition(section: Section, f: RiverFeature): [number, number] | null {
	return f.coords ?? pointAlong(lineFor(section), f.at);
}

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
