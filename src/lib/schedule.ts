/**
 * Foreløpig plan for turen.
 *
 * `people` fylles ut når det er avklart hvem som skal være med på hvert punkt –
 * står den tom, vises den ikke. `place` viser til navnet på et sted i places.ts,
 * og gir en lenke til kartet.
 */
export type ScheduleEntry = {
	day: string;
	time?: string;
	title: string;
	note?: string;
	place?: string;
	people?: string[];
};

export const schedule: ScheduleEntry[] = [
	{
		day: 'Torsdag',
		title: 'De første reiser',
		note: 'Noen drar allerede torsdag. Se hvem under Logistikk.'
	},
	{
		day: 'Fredag',
		time: '16:00',
		title: 'Felles avreise',
		note: 'Bilene fyller opp og drar samlet.'
	},
	{
		day: 'Fredag',
		time: '21:00',
		title: 'Ankomst og felles samling',
		note: 'Omtrentlig ankomst Kruke gård.',
		place: 'Kruke gård'
	},
	{
		day: 'Lørdag',
		time: '09:00',
		title: 'Avreise til Bru-bru',
		note: 'Hvem som er med kommer senere.',
		place: 'Put inn – Bru-bru'
	}
];

/** Sant så lenge planen ikke er ferdig – styrer notisen nederst på plansiden. */
export const scheduleIsDraft = true;
