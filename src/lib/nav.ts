import type { IconName } from './icons';

/** Sidene i appen, i den rekkefølgen de står i menyen. Seks er maks – mer får
 *  ikke plass i navigasjonslinja nederst på en mobilskjerm. */
export const pages: { href: string; label: string; icon: IconName; blurb: string }[] = [
	{ href: '/', label: 'Oversikt', icon: 'home', blurb: 'Nøkkeltall, vannføring nå og neste punkt på planen.' },
	{ href: '/runs', label: 'Runs', icon: 'kayaking', blurb: 'Lørdag på elva: grupper, biler og din plan.' },
	{ href: '/kart', label: 'Kart', icon: 'map', blurb: 'Kruke gård, put inn og take out, butikk og kafé.' },
	{ href: '/elven', label: 'Elven', icon: 'waves', blurb: 'Vannføring siste to døgn, og strekningene vi padler.' },
	{ href: '/logistikk', label: 'Logistikk', icon: 'directionsCar', blurb: 'Hvem som kommer, biler og hvem som låner utstyr.' },
	{ href: '/plan', label: 'Plan', icon: 'calendarMonth', blurb: 'Tidsskjema for helgen.' }
];
