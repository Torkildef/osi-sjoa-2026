/** Hvordan én celle fra regnearket skal tolkes. */
export type Cell =
	| { kind: 'yes' }
	| { kind: 'no' }
	| { kind: 'empty' }
	| { kind: 'text'; value: string };

const YES = /^(ja|yes|true|sant|x|✓|jepp)$/i;
const NO = /^(nei|no|false|usant|✗|-|–)$/i;

/** Gjør en celletekst om til ja, nei, tom eller fritekst. */
export function classify(raw: string): Cell {
	const value = raw.trim();
	if (value === '') return { kind: 'empty' };
	if (YES.test(value)) return { kind: 'yes' };
	if (NO.test(value)) return { kind: 'no' };
	return { kind: 'text', value };
}
