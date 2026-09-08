/**
 * Stedene på kartet.
 *
 * `coords` er [breddegrad, lengdegrad]. Mangler et sted koordinat, vises det i
 * lista under kartet i stedet for som markør – da er det tydelig at det gjenstår,
 * framfor at markøren havner på feil sted.
 *
 * Slik henter du en koordinat: høyreklikk stedet i Google Maps og velg det øverste
 * punktet i menyen. Da kopieres «61.7536, 9.2881», som limes rett inn her.
 */
import type { PhotoKey } from './photos';

export type PlaceKind = 'base' | 'elv' | 'service';

export type Place = {
	name: string;
	emoji: string;
	/** Styrer farge og gruppering: base = der vi bor, elv = elvepunkt, service = butikk/kafé. */
	kind: PlaceKind;
	note?: string;
	address?: string;
	coords: [number, number] | null;
	/**
	 * Hvilken vei navnet peker fra markøren. Kiwi, Strie Strømmer og Ysteriet ligger
	 * få hundre meter fra hverandre, så uten at de peker hver sin vei legger navnene
	 * seg oppå hverandre når hele området vises.
	 */
	labelDirection?: 'top' | 'bottom' | 'left' | 'right';
	/** Logo fra photos.ts. Vises i stedet for emojien der stedet har en. */
	logo?: PhotoKey;
};

/** Navn og farge på kategoriene, brukt i filterknappene og tegnforklaringen. */
export const kinds: { kind: PlaceKind; label: string }[] = [
	{ kind: 'base', label: 'Der vi bor' },
	{ kind: 'elv', label: 'Elva' },
	{ kind: 'service', label: 'Mat og utstyr' }
];

export const places: Place[] = [
	{
		name: 'Kruke gård',
		emoji: '🏠',
		kind: 'base',
		note: 'Her bor vi',
		address: 'Øvrebygdsvegen 1230, 2670 Heidal',
		coords: [61.752070260638256, 9.328132979057257],
		labelDirection: 'bottom'
	},
	{
		name: 'Put inn – Bru-bru',
		emoji: '🛶',
		kind: 'elv',
		note: 'Start på Bru-bru',
		coords: [61.753634744416374, 9.288169334633185],
		labelDirection: 'bottom'
	},
	{
		name: 'Take out Bru-bru / put inn Playrun',
		emoji: '🔁',
		kind: 'elv',
		note: 'Slutt på Bru-bru, start på Playrun',
		coords: [61.73427772497469, 9.360923757140876],
		labelDirection: 'right'
	},
	{
		name: 'Take out – Playrun',
		emoji: '🏁',
		kind: 'elv',
		note: 'Slutt på Playrun',
		coords: [61.70778483076899, 9.432610297209571],
		labelDirection: 'top'
	},
	{
		name: 'Kiwi',
		emoji: '🛒',
		kind: 'service',
		note: 'Matbutikk',
		coords: [61.759444129192566, 9.285411013661914],
		labelDirection: 'top',
		logo: 'kiwi'
	},
	{
		name: 'Strie Strømmer',
		emoji: '🚣',
		kind: 'service',
		note: 'Kajakkbutikk',
		address: 'Heidalsvegen 1814, 2676 Heidal',
		coords: [61.75840888399415, 9.285542659189701],
		labelDirection: 'left',
		logo: 'strie'
	},
	{
		name: 'Ysteriet',
		emoji: '☕',
		kind: 'service',
		note: 'Kafé og bakeri',
		coords: [61.75780945895403, 9.291542782739475],
		labelDirection: 'right',
		logo: 'ysteri'
	}
];

export const placed = (list: Place[] = places) =>
	list.filter((p): p is Place & { coords: [number, number] } => p.coords !== null);

export const missing = (list: Place[] = places) => list.filter((p) => p.coords === null);

export const placeByName = (name: string) => places.find((p) => p.name === name);

/** Lenke til veibeskrivelse i Google Maps. */
export const directionsUrl = ([lat, lon]: [number, number]) =>
	`https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
