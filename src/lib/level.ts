import { water } from './config';

export type Level = 'lav' | 'perfekt' | 'hoy';

/** Hvor vannføringen ligger i forhold til perfekt-sonen i config. */
export function levelFor(value: number): Level {
	const [low, high] = water.perfect;
	return value < low ? 'lav' : value > high ? 'hoy' : 'perfekt';
}

export const levelInfo: Record<
	Level,
	{ text: string; short: string; tone: 'success' | 'warning'; emoji: string }
> = {
	perfekt: { text: 'Perfekt vannføring', short: 'Perfekt', tone: 'success', emoji: '🤙' },
	lav: { text: 'Under perfekt-sonen', short: 'Lavt', tone: 'warning', emoji: '🪨' },
	hoy: { text: 'Over perfekt-sonen', short: 'Høyt', tone: 'warning', emoji: '🌊' }
};

export const formatFlow = (value: number) =>
	value.toLocaleString('nb-NO', { maximumFractionDigits: 1 });

/** «lør 14:00» i norsk tid, uansett hvor serveren står. */
export const dayTime = new Intl.DateTimeFormat('nb-NO', {
	timeZone: 'Europe/Oslo',
	weekday: 'short',
	hour: '2-digit',
	minute: '2-digit'
});
