import { water } from './config';

export type Level = 'lav' | 'bra' | 'perfekt' | 'spennende';

/** Hvilken sone vannføringen ligger i, etter grensene i config. */
export function levelFor(value: number): Level {
	if (value < water.good[0]) return 'lav';
	if (value < water.perfect[0]) return 'bra';
	if (value <= water.perfect[1]) return 'perfekt';
	return 'spennende';
}

export const levelInfo: Record<
	Level,
	{ text: string; short: string; tone: 'success' | 'warning' | 'primary' | 'tertiary'; emoji: string }
> = {
	lav: { text: 'Hompete vannføring', short: 'Hompete', tone: 'warning', emoji: '🪨' },
	bra: { text: 'Bra vannføring', short: 'Bra', tone: 'primary', emoji: '👍' },
	perfekt: { text: 'Perfekt vannføring', short: 'Perfekt', tone: 'success', emoji: '🤙' },
	spennende: { text: 'Spennende vannføring', short: 'Spennende', tone: 'tertiary', emoji: '🌊' }
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
