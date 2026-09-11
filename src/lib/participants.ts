/**
 * Deltakere, biler og avreisegrupper.
 *
 * Basert på svarene fra påmeldingsskjemaet pluss det som er avtalt etterpå.
 * Rediger her når noe endrer seg – siden regner ut tallene selv.
 * Telefonnumre holdes utenfor: siden ligger åpent på nettet.
 */

export type DepartureId = 'torsdag' | 'fredag' | 'fredag-sen' | 'uavklart';

export type Licence = 'manuell' | 'automat' | 'ukjent' | null;

export type Person = {
	name: string;
	departure: DepartureId;
	/** Førerkort: manuell, automat, ukjent når vi ikke vet, null når det ikke er oppgitt. */
	licence: Licence;
	/** Låner kajakk av klubben. Null når vi ikke vet. */
	kayak: boolean | null;
	/** Låner vest av klubben. Null når vi ikke vet. */
	vest: boolean | null;
	/** Hjelmstørrelsen personen pleier å bruke. */
	helmet: string | null;
	/** Annet utstyr personen låner, utover kajakk, vest og hjelm. */
	extraGear?: string;
	/** Drar hjem før resten. */
	earlyReturn?: string;
	/** Første tur med klubben, eller nesten. Merkes i listene. */
	rookie?: boolean;
	note?: string;
};

export type Car = {
	driver: string;
	/** Seter inkludert sjåføren. */
	seats: number;
	/** Ekstra sete hvis man sitter trangt. */
	seatsTight?: number;
	towHitch: boolean;
	/** Null når vi ikke vet. */
	roofRack: boolean | null;
	/** Når bilen drar – styrer hvilke biler som teller i kapasiteten fredag. */
	departure: DepartureId;
	note?: string;
};

export const departureGroups: { id: DepartureId; label: string; time?: string; note: string }[] = [
	{
		id: 'torsdag',
		label: 'Torsdag',
		note: 'De som drar dagen før. Caroline og Knut-Erik oppga dette selv i skjemaet.'
	},
	{
		id: 'fredag',
		label: 'Fredag',
		time: '16:00',
		note: 'Hovedgruppen. Oppmøte ved kajakkrommet på Sogn.'
	},
	{
		id: 'fredag-sen',
		label: 'Fredag, senere',
		note: 'Maja lander på Gardermoen ca. 19:20 og hentes av en snill sjåfør som er villig til å hente henne.'
	},
	{
		id: 'uavklart',
		label: 'Uavklart',
		note: 'Kommer kanskje, i så fall søndag. Ikke bekreftet.'
	}
];

export const cars: Car[] = [
	{
		driver: 'Torkild',
		seats: 9,
		towHitch: true,
		roofRack: null,
		departure: 'fredag',
		note: 'Leiebil med henger. Hengeren tar 8–10 kajakker.'
	},
	{
		driver: 'Caroline',
		seats: 3,
		towHitch: true,
		roofRack: true,
		departure: 'torsdag',
		note: 'Racks langt fra hverandre. Drar torsdag, så bilen er ikke med i fredagskonvoien.'
	},
	{
		driver: 'Wiktor',
		seats: 5,
		towHitch: true,
		roofRack: true,
		departure: 'fredag',
		note: 'Takstativ med 2 kajakker til shuttling, tar opptil 4.'
	},
	{
		driver: 'Helene',
		seats: 4,
		seatsTight: 5,
		towHitch: false,
		roofRack: false,
		departure: 'fredag'
	},
	{
		driver: 'Tiril',
		seats: 5,
		towHitch: true,
		roofRack: true,
		departure: 'fredag',
		note: 'Tiril dro hjem, men bilen er med. Automat. Takstativ, tar 4 kajakker.'
	}
];

export const people: Person[] = [
	{
		name: 'Torkild',
		departure: 'fredag',
		licence: 'manuell',
		kayak: false,
		vest: false,
		helmet: null,
		note: 'Kjører leiebilen med hengeren.'
	},
	{
		name: 'Caroline Nordihus',
		departure: 'torsdag',
		licence: 'manuell',
		kayak: true,
		vest: true,
		helmet: 'Small (black)',
		note: 'Blir i området til tirsdag.'
	},
	{
		name: 'Maren Navarsetes Aaberg',
		rookie: true,
		departure: 'torsdag',
		licence: 'automat',
		kayak: true,
		vest: true,
		helmet: 'Small (black)'
	},
	{
		name: 'Anneke Kheim',
		rookie: true,
		departure: 'fredag',
		licence: 'manuell',
		kayak: true,
		vest: true,
		helmet: 'Medium (yellow)'
	},
	{
		name: 'Ludvig Bentzen Stenmark',
		rookie: true,
		departure: 'fredag',
		licence: 'manuell',
		kayak: true,
		vest: true,
		helmet: 'Medium (yellow)'
	},
	{
		name: 'Wiktor Bönke',
		departure: 'fredag',
		licence: 'manuell',
		kayak: false,
		vest: false,
		helmet: null
	},
	{
		name: 'Sindre Herre Hansen',
		rookie: true,
		departure: 'fredag',
		licence: null,
		kayak: true,
		vest: true,
		helmet: 'Medium (yellow)'
	},
	{
		name: 'Simon Golombek',
		departure: 'fredag',
		licence: null,
		kayak: true,
		vest: true,
		helmet: 'Onesize (red)'
	},
	{
		name: 'Eskil Linge Glomnes',
		departure: 'fredag',
		licence: 'manuell',
		kayak: true,
		vest: true,
		helmet: 'Medium (yellow)',
		note: 'Kan ta med mye ekstra utstyr.'
	},
	{
		name: 'Vegard Otterlei',
		departure: 'fredag',
		licence: 'manuell',
		kayak: true,
		vest: true,
		helmet: 'Large (blue)'
	},
	{
		name: 'Knut-Erik',
		departure: 'torsdag',
		licence: 'manuell',
		kayak: false,
		vest: false,
		helmet: null
	},
	{
		name: 'Malin Frank',
		rookie: true,
		departure: 'fredag',
		licence: 'manuell',
		kayak: true,
		vest: true,
		helmet: 'Large (blue)',
		note: 'Medlemskap under registrering.'
	},
	{
		name: 'Helene Larsen',
		departure: 'fredag',
		licence: 'manuell',
		kayak: true,
		vest: true,
		helmet: 'Medium (yellow)'
	},
	{
		name: 'Malin Nordli Bernhardsson',
		rookie: true,
		departure: 'fredag',
		licence: null,
		kayak: true,
		vest: true,
		helmet: 'Medium (yellow)',
		extraGear: 'Våtdrakt og jakke'
	},
	{
		name: 'Julia Johanne Lie',
		rookie: true,
		departure: 'fredag',
		licence: null,
		kayak: true,
		vest: true,
		helmet: 'Medium (yellow)'
	},
	{
		name: 'Marie Karlsen',
		departure: 'fredag',
		licence: null,
		kayak: false,
		vest: false,
		helmet: 'Husker ikke'
	},
	{
		name: 'Maja Kristine Eriksen',
		departure: 'fredag-sen',
		licence: 'automat',
		kayak: true,
		vest: true,
		helmet: 'Small (black)',
		note: 'Lander på Gardermoen ca. 19:20, og hentes av en snill sjåfør som er villig til å hente henne.'
	},
	{
		name: 'Ylva Karoline N. Svartnes',
		rookie: true,
		departure: 'fredag',
		licence: 'manuell',
		kayak: true,
		vest: true,
		helmet: 'Medium (yellow)'
	},
	{
		name: 'Danielle Barna',
		departure: 'fredag',
		licence: 'automat',
		kayak: false,
		vest: false,
		helmet: null
	},
	{
		name: 'Connor Wilkinson',
		departure: 'fredag',
		licence: null,
		kayak: true,
		vest: true,
		helmet: 'Large (blue)'
	},
	{
		name: 'Lene Myhre Johansson',
		rookie: true,
		departure: 'fredag',
		licence: null,
		kayak: true,
		vest: true,
		helmet: 'Medium (yellow)'
	},
	{
		name: 'Birk',
		departure: 'uavklart',
		licence: 'ukjent',
		kayak: null,
		vest: null,
		helmet: null,
		note: 'Kommer kanskje søndag.'
	},
	{
		name: 'Claudia',
		departure: 'uavklart',
		licence: 'ukjent',
		kayak: null,
		vest: null,
		helmet: null,
		note: 'Kommer kanskje søndag.'
	},
	{
		name: 'Eirik',
		departure: 'uavklart',
		licence: 'ukjent',
		kayak: null,
		vest: null,
		helmet: null,
		note: 'Kommer kanskje søndag.'
	}
];

/** Ting som ikke er på plass ennå. Fjern punktene etter hvert som de avklares. */
export const open: string[] = [
	'Hvem er den snille sjåføren som henter Maja på Gardermoen fredag kveld?',
	'Birk, Claudia og Eirik: kommer kanskje søndag. Bekreftelse, og all øvrig info hvis de blir med.',
];

/** Ofte stilte spørsmål. */
export const faq: { q: string; a: string }[] = [
	{
		q: 'Kan jeg låne våtdrakt eller jakke i tillegg til kajakk, vest og hjelm?',
		a: 'Ja, dere kan låne alt.'
	},
	{
		q: 'Skal jeg ta med sovepose?',
		a: 'Nei. Det er sengetøy der vi bor.'
	}
];

/** Retur søndag, med forbehold. */
export const returnNote = 'Vi er hjemme i Oslo søndag ca. 20–21. Regn med en lang helg.';

// ---- Utledet -----------------------------------------------------------------

export const confirmed = () => people.filter((p) => p.departure !== 'uavklart');
export const unconfirmed = () => people.filter((p) => p.departure === 'uavklart');

export const byDeparture = (id: DepartureId) => people.filter((p) => p.departure === id);

/** Bilen en person stiller med, om noen. Matcher på fornavn. */
export const carFor = (person: Person) =>
	cars.find((c) => c.driver === person.name.split(/\s+/)[0]);

/** Kortnavnet på en person: fornavn, med etternavnsinitial om det trengs for å skille dem. */
export function shortName(person: Person): string {
	const [first, ...rest] = person.name.split(/\s+/);
	const clash = people.some((p) => p !== person && p.name.split(/\s+/)[0] === first);
	return clash && rest.length > 0 ? `${first} ${rest[0][0]}.` : first;
}

export const borrowsGear = (p: Person) => p.kayak === true || p.vest === true;

/** Seter i bilene som drar fredag kl. 16, med og uten trangt. */
export function fridaySeats(): { seats: number; tight: number } {
	const fri = cars.filter((c) => c.departure === 'fredag');
	const seats = fri.reduce((sum, c) => sum + c.seats, 0);
	const tight = fri.reduce((sum, c) => sum + (c.seatsTight ?? c.seats), 0);
	return { seats, tight };
}

/** Fargen på klubbens hjelmer, per størrelse. */
export const helmetColors: Record<string, string> = {
	small: '#1f1f1f',
	medium: '#f2c318',
	large: '#1e63d0',
	onesize: '#d32f2f'
};

/** «Medium (yellow)» → «Medium». Fargen vises som en prikk i stedet. */
export const helmetLabel = (helmet: string) => helmet.replace(/\s*\(.*\)\s*$/, '');

/** Fargen til en hjelmstørrelse, eller null for svar som «Husker ikke». */
export const helmetColor = (helmet: string) =>
	helmetColors[helmet.split(' ')[0].toLowerCase()] ?? null;

/** Hjelmstørrelser med hvem som trenger dem, i rekkefølgen small → onesize. */
export function helmetSizes(): { size: string; names: string[] }[] {
	const order = ['small', 'medium', 'large', 'onesize'];
	const groups = new Map<string, string[]>();
	for (const p of people) {
		if (!p.helmet || !borrowsGear(p)) continue;
		const key = p.helmet.split(' ')[0];
		groups.set(key, [...(groups.get(key) ?? []), shortName(p)]);
	}
	return [...groups]
		.map(([size, names]) => ({ size: people.find((p) => p.helmet?.startsWith(size))!.helmet!, names }))
		.sort(
			(a, b) =>
				order.indexOf(a.size.split(' ')[0].toLowerCase()) -
				order.indexOf(b.size.split(' ')[0].toLowerCase())
		);
}
