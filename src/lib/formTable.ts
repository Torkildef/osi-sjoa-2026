import { privateFormColumns } from './config';
import type { Participant } from './types';

/**
 * Kolonnene som skal vises i svartabellen, i den rekkefølgen de står i regnearket.
 *
 * Vi leser dem ut av svarene i stedet for å liste dem opp i koden, slik at tabellen
 * følger med når spørsmålene i skjemaet endrer seg.
 */
export function formColumnsFor(
	participants: Participant[],
	includePrivate: boolean,
	/** Kolonnerekkefølgen fra regnearket, lagret ved siste synk. */
	sheetColumns?: string[] | null
): string[] {
	const seen: string[] = [...(sheetColumns ?? [])];
	// Svar som ble hentet før en kolonne ble lagt til, tas med som reserve.
	for (const p of participants) {
		for (const key of Object.keys(p.form_answers ?? {})) {
			if (!seen.includes(key)) seen.push(key);
		}
	}
	if (includePrivate) return seen;
	return seen.filter((key) => !privateFormColumns.some((pattern) => pattern.test(key)));
}
