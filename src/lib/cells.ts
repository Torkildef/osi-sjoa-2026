/** Hvordan én celle fra regnearket skal tolkes. */
export type Cell =
	| { kind: 'yes' }
	| { kind: 'no' }
	| { kind: 'empty' }
	| { kind: 'text'; value: string };

// Skjemaet bruker lekne svar som «Yea!» og «Nope», så de må med her.
const YES = /^(ja|yes|yea!?|yeah|yep|true|sant|x|✓|jepp|jo)$/i;
const NO = /^(nei|no|nope|false|usant|✗|-|–)$/i;

/** Gjør en celletekst om til ja, nei, tom eller fritekst. */
export function classify(raw: string): Cell {
	const value = raw.trim();
	if (value === '') return { kind: 'empty' };
	if (YES.test(value)) return { kind: 'yes' };
	if (NO.test(value)) return { kind: 'no' };
	return { kind: 'text', value };
}
