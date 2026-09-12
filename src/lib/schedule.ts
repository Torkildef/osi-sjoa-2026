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
	/** Kort merkelapp som skal synes, f.eks. «Litt forsinket». */
	flag?: string;
};

export const schedule: ScheduleEntry[] = [
	{
		day: 'Torsdag',
		title: '🚗 De første reiser',
		note: 'Caroline tar bilen sin. Bru-bru får en dag ekstra.',
		people: ['Caroline', 'Knut-Erik', 'Maren']
	},
	{
		day: 'Fredag',
		time: '16:00',
		title: '🛶 Oppmøte ved kajakkrommet',
		note: 'Rolf E. Stenersens allé 21, Sogn studentby. 9-seteren med hengeren, Wiktor og Helene fyller opp og drar samlet.'
	},
	{
		day: 'Fredag',
		time: '19:20',
		title: '✈️ Maja lander på Gardermoen',
		note: 'Hentes av en snill sjåfør som er villig til å hente henne.',
		people: ['Maja']
	},
	{
		day: 'Fredag',
		time: '22:30',
		title: '🏡 9-seteren ankommer Kruke gård',
		note: 'Litt forsinket, så regn med 22:30 heller enn 21. Felles samling når alle er fremme.',
		place: 'Kruke gård',
		flag: 'Litt forsinket'
	},
	{
		day: 'Lørdag',
		time: '08:00',
		title: '🥞 Frokost',
		note: 'Før avreise til Bru-bru.',
		place: 'Kruke gård'
	},
	{
		day: 'Lørdag',
		time: '09:00',
		title: '🛶 Avreise til Bru-bru',
		note: 'Erfarne, rookies run 1 og Malin F. Rookies run 2 sover videre. Se Runs.',
		place: 'Put inn – Bru-bru'
	},
	{
		day: 'Lørdag',
		time: '18:00',
		title: '🍖 BBQ på Kruke',
		note: 'Ta med det du vil ha på grillen.',
		place: 'Kruke gård'
	},
	{
		day: 'Lørdag',
		time: 'Etterpå',
		title: '🏆 Booty-seremoni',
		note: 'Svømte du? Da vet du hva som venter.'
	},
	{
		day: 'Lørdag',
		time: 'Utover kvelden',
		title: '🎉 Fest og mingling på Kruke'
	},
	{
		day: 'Søndag',
		time: 'Til 11:00',
		title: '🥞 Frokost og utvask'
	},
	{
		day: 'Søndag',
		time: '11:00',
		title: '🛶 Avreise til elva',
		note: 'Birk, Claudia og Eirik kommer kanskje innom.'
	},
	{
		day: 'Søndag',
		time: 'ca. 20–21',
		title: '🏠 Hjemme i Oslo',
		note: 'Regn med en lang helg.'
	}
];

/** Sant så lenge planen ikke er ferdig – styrer notisen nederst på plansiden. */
export const scheduleIsDraft = true;
