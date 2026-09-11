/**
 * Soveplasser på Kruke gård. Hvert rom har senger; en dobbeltseng teller to.
 * `taken` er hvem som har fått plassen, `wish` hvem som har ønsket seg den.
 *
 * Tolkning av lappen fra Kruke, med det som var uklart merket i `note`.
 */

export type Bed = 'enkel' | 'dobbel';

export type Room = {
	name: string;
	beds: Bed[];
	note?: string;
	/** Hvem som har plassen. */
	taken?: string[];
	/** Hvem som har ønsket seg rommet, men ikke fått det ennå. */
	wish?: string[];
};

export type Building = { name: string; rooms: Room[] };

export const buildings: Building[] = [
	{
		name: '1. etasje',
		rooms: [
			{ name: 'Rommet over oss', beds: ['dobbel', 'enkel', 'enkel'], note: 'Én dobbeltseng, resten enkle.' }
		]
	},
	{
		name: '2. etasje, inngang 1',
		rooms: [
			{ name: 'Hemsen', beds: ['enkel', 'enkel', 'enkel'] },
			{
				name: 'Rom med dobbeltseng',
				beds: ['dobbel', 'enkel', 'enkel'],
				note: 'Lappen sier «3 seng, 1 dobbelseng». Tolket som 3 senger der én er dobbel, altså 4 plasser.'
			},
			{ name: 'Firesengsrommet', beds: ['enkel', 'enkel', 'enkel', 'enkel'], note: '3 av sengene til gutta.' }
		]
	},
	{
		name: '2. etasje, inngang 2',
		rooms: [{ name: 'Rom med dobbeltseng', beds: ['dobbel', 'enkel', 'enkel'] }]
	},
	{
		name: 'Hytta bak',
		rooms: [
			{ name: 'Rom 1', beds: ['enkel', 'enkel'], wish: ['Helene', 'Vegard'] },
			{ name: 'Rom 2', beds: ['enkel', 'enkel'] }
		]
	}
];

export const capacity = (room: Room) => room.beds.reduce((n, b) => n + (b === 'dobbel' ? 2 : 1), 0);

export const totalCapacity = () =>
	buildings.flatMap((b) => b.rooms).reduce((n, r) => n + capacity(r), 0);

export const free = (room: Room) => capacity(room) - (room.taken?.length ?? 0);
