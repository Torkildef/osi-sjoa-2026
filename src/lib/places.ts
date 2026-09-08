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
export type Place = {
	name: string;
	emoji: string;
	/** Styrer farge og gruppering: base = der vi bor, elv = elvepunkt, service = butikk/kafé. */
	kind: 'base' | 'elv' | 'service';
	note?: string;
	address?: string;
	coords: [number, number] | null;
};

export const places: Place[] = [
	{
		name: 'Kruke gård',
		emoji: '🏠',
		kind: 'base',
		note: 'Her bor vi',
		address: 'Øvrebygdsvegen 1230, 2670 Heidal',
		coords: null
	},
	{
		name: 'Put inn – Bru-bru',
		emoji: '🛶',
		kind: 'elv',
		note: 'Start på Bru-bru-strekket',
		coords: [61.753634744416374, 9.288169334633185]
	},
	{
		name: 'Take out Bru-bru / put inn Playrun',
		emoji: '🔁',
		kind: 'elv',
		note: 'Slutt på Bru-bru, start på Playrun',
		coords: [61.73427772497469, 9.360923757140876]
	},
	{
		name: 'Take out – Playrun',
		emoji: '🏁',
		kind: 'elv',
		note: 'Slutt på Playrun',
		coords: [61.70778483076899, 9.432610297209571]
	},
	{
		name: 'Kiwi',
		emoji: '🛒',
		kind: 'service',
		note: 'Matbutikk',
		coords: null
	},
	{
		name: 'Strie Strømmer',
		emoji: '🚣',
		kind: 'service',
		note: 'Kajakkbutikk',
		address: 'Heidalsvegen 1814, 2676 Heidal',
		coords: null
	},
	{
		name: 'Ysteriet',
		emoji: '☕',
		kind: 'service',
		note: 'Kafé og bakeri',
		coords: null
	}
];

/**
 * Strekkene vi padler, tegnet mellom put inn og take out.
 *
 * Linjene er stiplet med vilje: de går rett fram mellom punktene og følger ikke
 * elveløpet. De viser hvilken strekning et løp dekker, ikke hvor elva renner.
 */
export const runs: { name: string; from: string; to: string }[] = [
	{ name: 'Bru-bru', from: 'Put inn – Bru-bru', to: 'Take out Bru-bru / put inn Playrun' },
	{ name: 'Playrun', from: 'Take out Bru-bru / put inn Playrun', to: 'Take out – Playrun' }
];

export const placed = (list: Place[] = places) =>
	list.filter((p): p is Place & { coords: [number, number] } => p.coords !== null);

export const missing = (list: Place[] = places) => list.filter((p) => p.coords === null);
