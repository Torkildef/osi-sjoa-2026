/**
 * Lørdag på elva. De erfarne padler begge runs på Bru-bru. Rookiene padler
 * ett run hver og kjører shuttle på det andre. Sidene under /runs leser herfra.
 *
 * Fornavn som på resten av siden. Endre her; siden følger med.
 *
 * Kajakker: de 11 erfarne har hver sin, rookiene deler på 6. Til sammen 17.
 * Hengeren tar 10, Wiktors bil 4, Carolines bil 2 – 16 om gangen. Får Tiril
 * tak i takstativ, tar hun 4 til, og alt går i én tur.
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

/** Rookies som padler run 1 og kjører shuttle på run 2. */
export const rookiesRun1 = ['Anneke', 'Ludvig', 'Maren', 'Sindre', 'Malin N.'];

/** Rookies som kjører shuttle på run 1 og padler run 2. */
export const rookiesRun2 = ['Martha', 'Malin F.', 'Ylva', 'Tiril', 'Julia', 'Lene'];

/** Fornavn slik de står i deltakerlista, der kortformen over avviker. */
const alias: Record<string, string> = { Dani: 'Danielle', Knut: 'Knut-Erik' };

export const personFor = (first: string): Person | undefined => {
	const wanted = alias[first] ?? first;
	return people.find((p) => shortName(p) === wanted || p.name.split(/\s+/)[0] === wanted);
};

export const isRookie = (first: string) => personFor(first)?.rookie === true;

export type Group = { name: string; members: string[] };

export type Shuttle = {
	car: string;
	driver: string;
	/** Kjører sin egen bil. */
	own: boolean;
	note?: string;
};

export type Run = {
	n: number;
	title: string;
	groups: Group[];
	/** Shuttlen i grunnplanen, uten takstativ på Tirils bil. */
	shuttle: Shuttle[];
	/** Sitter på i shuttlen. */
	riders: string[];
	/** Biler som blir stående på put inn imens. */
	stays: string[];
	/** Hva som endrer seg hvis Tiril får takstativ. */
	rackNote: string;
};

export const runs: Run[] = [
	{
		n: 1,
		title: 'Run 1',
		groups: [
			{ name: 'Gruppe 1', members: ['Dani', 'Caroline', 'Helene', 'Simon', 'Anneke', 'Sindre'] },
			{ name: 'Gruppe 2', members: ['Wiktor', 'Vegard', 'Eskil', 'Maja', 'Ludvig', 'Malin N.'] },
			{ name: 'Gruppe 3', members: ['Torkild', 'Knut', 'Connor', 'Maren'] }
		],
		shuttle: [
			{ car: 'Leiebilen + hengeren', driver: 'Martha', own: false },
			{ car: 'Wiktors bil', driver: 'Ylva', own: false },
			{
				car: 'Carolines bil',
				driver: 'Malin F.',
				own: false,
				note: 'Innom Kruke først: henter kajakk 17 og setter den på put inn. Så til take out.'
			},
			{ car: 'Tirils bil', driver: 'Tiril', own: true }
		],
		riders: ['Julia', 'Lene'],
		stays: ['Helenes bil'],
		rackNote: 'Med takstativ på Tirils bil er alle 17 kajakker med fra start. Malin F. kjører rett til take out.'
	},
	{
		n: 2,
		title: 'Run 2',
		groups: [
			{ name: 'Gruppe 1', members: ['Dani', 'Caroline', 'Helene', 'Simon', 'Martha', 'Julia'] },
			{ name: 'Gruppe 2', members: ['Wiktor', 'Vegard', 'Eskil', 'Maja', 'Malin F.', 'Lene'] },
			{ name: 'Gruppe 3', members: ['Torkild', 'Knut', 'Connor', 'Ylva', 'Tiril'] }
		],
		shuttle: [
			{ car: 'Leiebilen + hengeren', driver: 'Anneke', own: false },
			{ car: 'Wiktors bil', driver: 'Ludvig', own: false },
			{ car: 'Carolines bil', driver: 'Maren', own: false, note: 'Automat' }
		],
		riders: ['Sindre', 'Malin N.'],
		stays: ['Tirils bil', 'Helenes bil'],
		rackNote:
			'Med takstativ kjører Maren Tirils bil i stedet for Carolines. Da er det plass til alle 17 kajakker, og Carolines og Helenes bil står på put inn.'
	}
];

export type Step = { what: string; who?: string };

/** Det vi vet. Regnestykket bygger på dette. */
export const facts = (rack: boolean): string[] => [
	'22 padler: 11 erfarne og 11 rookies. Marie padler ikke.',
	'17 kajakker: de erfarne har hver sin, rookiene deler på 6.',
	rack
		? 'Kajakkplass per tur: henger 10, Wiktor 4, Tiril 4, Caroline 2. 20 plasser, alt går i én tur.'
		: 'Kajakkplass per tur: henger 10, Wiktor 4, Caroline 2. 16 plasser, én kajakk for lite.',
	'Seter: leiebilen 9, Wiktor 5, Tiril 5, Helene 4, Caroline 3. 26 til sammen.',
	'Rookies med lapp: Anneke, Ludvig, Martha, Malin F. og Ylva kjører manuell. Maren og Tiril kjører automat, altså Carolines eller Tirils bil. Sindre, Malin N., Julia og Lene sitter på.',
	'Leiebilen med hengeren er manuell og må kjøres av en som er trygg med henger.',
	'Kruke ligger mellom put inn og take out på Bru-bru, nærmest take out. Liten omvei.',
	'Take out Bru-bru er put inn Playrun. Take out Playrun ligger et stykke lenger ned.'
];

export type Plan = {
	id: string;
	title: string;
	tagline: string;
	steps: (rack: boolean) => Step[];
	pros: string[];
	cons: string[];
};

const runOneRookies = rookiesRun1.join(', ');
const runTwoRookies = rookiesRun2.join(', ');

export const plans: Plan[] = [
	{
		id: 'to-runs',
		title: 'Grunnplan: to runs på Bru-bru',
		tagline: 'Enklest. Alle padler Bru-bru, de erfarne to ganger.',
		steps: (rack) => [
			rack
				? {
						what: 'Kruke → put inn. Alle 22, alle 17 kajakker, alle 5 biler. Én tur.',
						who: 'Henger 10 · Wiktor 4 · Tiril 4. Carolines bil tar folk.'
					}
				: {
						what: 'Kruke → put inn. Alle 22, 16 kajakker, alle 5 biler. Én tur.',
						who: 'Henger 10 · Wiktor 4 · Caroline 2. Kajakk 17 blir igjen på Kruke.'
					},
			{ what: 'Run 1: 11 erfarne + 5 rookies.', who: runOneRookies },
			rack
				? {
						what: 'Shuttle 1: 4 biler til take out. Helenes bil står på put inn.',
						who: 'Martha (leiebil), Ylva (Wiktors), Malin F. (Carolines), Tiril (egen). Julia og Lene sitter på.'
					}
				: {
						what: 'Shuttle 1: 4 biler til take out. Helenes bil står på put inn.',
						who: 'Martha (leiebil), Ylva (Wiktors), Malin F. (Carolines, innom Kruke etter kajakk 17 → put inn), Tiril (egen). Julia og Lene sitter på.'
					},
			{
				what: 'Venting: parker på take out, ta én bil til Kruke. Tilbake til avtalt tid.',
				who: 'Avtal tiden før run 1 starter. Ikke stol på mobildekning.'
			},
			rack
				? { what: 'Run 1 i land. 17 kajakker på. Alle tilbake til put inn.' }
				: { what: 'Run 1 i land. 16 kajakker på. Alle tilbake til put inn.' },
			{ what: 'Run 2: 11 erfarne + 6 rookies. 17 kajakker.', who: runTwoRookies },
			rack
				? {
						what: 'Shuttle 2: 3 biler til take out. Carolines og Helenes bil står på put inn.',
						who: 'Anneke (leiebil), Ludvig (Wiktors), Maren (Tirils). Sindre og Malin N. sitter på, eller settes av på Kruke underveis.'
					}
				: {
						what: 'Shuttle 2: 3 biler til take out. Tirils og Helenes bil står på put inn.',
						who: 'Anneke (leiebil), Ludvig (Wiktors), Maren (Carolines). Sindre og Malin N. sitter på, eller settes av på Kruke underveis.'
					},
			rack
				? { what: 'Run 2 i land. 17 kajakker på. Alle til Kruke.' }
				: {
						what: 'Run 2 i land. 16 kajakker på. Alle til Kruke.',
						who: 'Carolines bil tar en tur til etter kajakk 17. Kruke er rett ved.'
					},
			rack
				? { what: 'Maren kjører Caroline og Helene til put inn i Tirils bil. De henter bilene sine.' }
				: { what: 'Maren kjører Tiril og Helene til put inn i Carolines bil. De henter bilene sine.' }
		],
		pros: [
			'Færrest bevegelige deler. Alle rookies padler med de erfarne.',
			'Ingen venter lenge: shuttlen tar under en time, resten er padling.',
			'Går fint uten takstativ, med én omvei om Kruke.'
		],
		cons: [
			'Ingen Playrun. De erfarne padler Bru-bru to ganger.',
			'Uten takstativ må Carolines bil ta en ekstra tur til slutt.'
		]
	},
	{
		id: 'playrun-midt',
		title: 'Alternativ A: Playrun i midten',
		tagline: 'De erfarne padler rett videre ned Playrun etter run 1. Rookiene venter på Kruke.',
		steps: (rack) => [
			rack
				? { what: 'Kruke → put inn. Alle 22, alle 17 kajakker, alle 5 biler.' }
				: {
						what: 'Kruke → put inn. Alle 22, 16 kajakker, alle 5 biler.',
						who: 'Kajakk 17 blir igjen på Kruke og hentes i steg 5.'
					},
			{ what: 'Run 1: 11 erfarne + 5 rookies.', who: runOneRookies },
			{
				what: 'Shuttle 1: 4 biler til take out Bru-bru. Helenes bil står på put inn.',
				who: 'Martha (leiebil), Ylva (Wiktors), Malin F. (Carolines), Tiril (egen). Julia og Lene sitter på.'
			},
			{
				what: 'Run 1 i land. De erfarne padler rett videre ned Playrun. Rookiene går i land.',
				who: 'De 6 rookie-kajakkene på henger og Caroline.'
			},
			{
				what: 'Alle 11 rookies til Kruke. Lunsj, tørre klær.',
				who: '4 biler, 22 seter. Sjåførene som skal videre spiser fort.'
			},
			{
				what: 'Martha (leiebil) og Ylva (Wiktors) videre til take out Playrun. Tomme biler, plass til 14.',
				who: 'Rookie-kajakkene settes av på Kruke først.'
			},
			{ what: 'Playrun i land. 11 kajakker på henger og Wiktor. De erfarne til Kruke.' },
			rack
				? { what: 'Alle 22 fra Kruke til put inn med 17 kajakker. Én tur.' }
				: {
						what: 'Alle 22 fra Kruke til put inn med 16 kajakker.',
						who: 'Carolines bil tar en tur til etter kajakk 17.'
					},
			{ what: 'Run 2: 11 erfarne + 6 rookies. 17 kajakker.', who: runTwoRookies },
			rack
				? {
						what: 'Shuttle 2: 3 biler til take out. Carolines og Helenes bil står på put inn.',
						who: 'Anneke (leiebil), Ludvig (Wiktors), Maren (Tirils). Sindre og Malin N. settes av på Kruke.'
					}
				: {
						what: 'Shuttle 2: 3 biler til take out. Tirils og Helenes bil står på put inn.',
						who: 'Anneke (leiebil), Ludvig (Wiktors), Maren (Carolines). Sindre og Malin N. settes av på Kruke.'
					},
			rack
				? { what: 'Run 2 i land. 17 kajakker på. Alle til Kruke. Maren henter bileierne til put inn.' }
				: {
						what: 'Run 2 i land. 16 kajakker på. Alle til Kruke. Maren henter bileierne til put inn.',
						who: 'Carolines bil tar en tur til etter kajakk 17.'
					}
		],
		pros: [
			'De erfarne får Playrun med ferske armer, midt på dagen.',
			'Rookiene på run 2 får en lang, rolig pause på Kruke i stedet for å vente ved take out.',
			'Bilene til de erfarne kjøres helt ned til Playrun mens de padler. Ingen venter på shuttle.'
		],
		cons: [
			'Rookiene på run 2 venter rundt tre timer før de får padle: run 1, Playrun og kjøring.',
			'De erfarne padler tre strekninger og leder rookies på to av dem. Lang dag.',
			'Hele dagen blir halvannen til to timer lengre. Run 1 må starte tidlig om grillen skal stå klokka 18.',
			'Ingen rookies på vannet uten en erfaren. Vil noen heller varme opp ved put inn, må én eller to erfarne stå over Playrun og bli med dem.'
		]
	},
	{
		id: 'playrun-slutt',
		title: 'Alternativ B: Playrun til slutt',
		tagline: 'Grunnplanen, pluss Playrun for de erfarne som vil, rett etter run 2.',
		steps: (rack) => [
			{ what: 'Steg 1–6 som i grunnplanen.', who: 'To runs på Bru-bru med samme grupper og samme shuttle.' },
			{
				what: 'Run 2 i land ved take out Bru-bru. De erfarne som vil, padler rett videre ned Playrun.',
				who: 'Frivillig. Er noen slitne, stopper de her.'
			},
			{
				what: 'De som er ferdige: kajakker på hengeren. Hengeren innom Kruke og setter dem av, så videre tom.',
				who: 'Rookie-kajakkene og kajakkene til de erfarne som står over. Kruke er en liten omvei.'
			},
			{
				what: 'Anneke (leiebil) og Ludvig (Wiktors) til take out Playrun. Plass til 14 kajakker.',
				who: 'Resten til Kruke. Maren henter bileierne til put inn imens.'
			},
			{ what: 'Playrun i land. Kajakker på henger og Wiktor. Alle til Kruke.' }
		],
		pros: [
			'Ingen venter på noen. Rookiene er ferdige når de er ferdige.',
			'Playrun er frivillig og kan droppes uten at noe annet ryker.',
			'Bare to biler kjører lenger enn i grunnplanen.'
		],
		cons: [
			'De erfarne padler Playrun slitne, etter to runs på Bru-bru.',
			'Playrun må starte i god tid før grillen. Blir run 2 sent i land, ryker det.'
		]
	}
];

/** Kruke som venterom. Gjelder uansett plan. */
export const waiting: string[] = [
	'Shuttlesjåførene må ikke stå og fryse ved take out. Parker bilene der, ta én bil til Kruke, og kom tilbake til avtalt tid. Bilene må stå på take out når run 1 lander, for kajakkene skal på.',
	'De som bare sitter på i shuttlen, kan bli på Kruke fra morgenen av. Shuttlen plukker dem opp på vei til put inn. Med seter er det akkurat plass: 16 padlere og 4 sjåfører i 4 biler med 22 seter, pluss 2 på Kruke.',
	'Sindre og Malin N. sitter på i shuttle 2 og kan settes av på Kruke underveis. Alle skal dit etterpå uansett.',
	'Marie padler ikke og kan bli på Kruke hele dagen. Vil hun kjøre, er hun en ekstra sjåfør, og da løsner det meste.',
	'Avtal klokkeslett for henting før første run starter. Mobildekningen på elva er ikke noe å stole på.'
];

/** Vurderingen. */
export const verdict: string[] = [
	'Grunnplanen er enklest og tryggest. Den går uten takstativ, men takstativ på Tirils bil fjerner all kajakk-akrobatikk: alle 17 kajakker i én tur, ingen omvei, ingen ekstra tur til slutt. Prøv å skaffe det.',
	'Vil de erfarne ha Playrun, velg alternativ B. Den er frivillig, ingen venter, og slipper vi opp for tid dropper vi den. Alternativ A gir best Playrun, men rookiene på run 2 venter lenge og dagen blir to timer lengre.',
	'Kruke som venterom: ja. Shuttlesjåførene tar én bil dit, og de som bare sitter på trenger ikke være med til put inn i det hele tatt.',
	'Ingen rookies på vannet uten en erfaren i gruppa. Det gjelder også oppvarming ved put inn.',
	'Sjåførene er fordelt etter lappen. Maren og Tiril kjører automat, og både Carolines og Tirils bil er automat. Hengeren kjøres av Martha på run 1 og Anneke på run 2, begge manuell.'
];
