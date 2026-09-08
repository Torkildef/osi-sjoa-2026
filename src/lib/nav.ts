import type { IconName } from './icons';

/** Sidene i appen, i den rekkefølgen de står i menyen. Maks fem – det er alt en
 *  navigasjonslinje i bunnen av en mobilskjerm har plass til. */
export const pages: { href: string; label: string; icon: IconName; blurb: string }[] = [
	{ href: '/', label: 'Oversikt', icon: 'home', blurb: 'Nøkkeltall, vannføring nå og neste punkt på planen.' },
	{ href: '/kart', label: 'Kart', icon: 'map', blurb: 'Kruke gård, put inn og take out, butikk og kafé.' },
	{ href: '/elven', label: 'Elven', icon: 'waves', blurb: 'Vannføring siste to døgn, og strekningene vi padler.' },
	{ href: '/logistikk', label: 'Logistikk', icon: 'directionsCar', blurb: 'Hvem som kommer, biler og hvem som låner utstyr.' },
	{ href: '/plan', label: 'Plan', icon: 'calendarMonth', blurb: 'Tidsskjema for helgen.' }
];
