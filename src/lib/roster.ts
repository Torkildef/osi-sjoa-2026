import { fieldPatterns, hiddenColumns } from './config';
import { classify, type Cell } from './table';

export type Person = {
	name: string;
	departure: string | null;
	/** Null når skjemaet ikke spør om det. */
	professional: Cell | null;
	licence: Cell | null;
	/** Peker til bilen personen stiller med, ellers null. */
	carId: number | null;
	/** Kolonner som ikke fyller en rolle, tatt vare på så ingenting går tapt. */
	extras: Record<string, string>;
};

export type Car = {
	id: number;
	driver: string;
	seats: number | null;
	departure: string | null;
};

export type Roster = {
	people: Person[];
	cars: Car[];
	/** Hvilken kolonne som endte i hvilken rolle, så det kan vises i grensesnittet. */
	mapping: Record<string, string>;
	totalSeats: number | null;
	withLicence: number | null;
	professionals: number | null;
};

/**
 * Kobler kolonnene i regnearket til rollene oversikten trenger.
 *
 * En kolonne kan bare fylle én rolle. Rollene plukker i rekkefølgen de står i
 * config, så de presise tar sin kolonne før de generelle får sjansen.
 */
function mapColumns(headers: string[]): Record<string, string> {
	const available = headers.filter((h) => h && !hiddenColumns.some((p) => p.test(h)));
	const taken = new Set<string>();
	const mapping: Record<string, string> = {};

	for (const { role, patterns } of fieldPatterns) {
		const hit = available.find((h) => !taken.has(h) && patterns.some((p) => p.test(h)));
		if (hit) {
			mapping[role] = hit;
			taken.add(hit);
		}
	}
	return mapping;
}

function text(record: Record<string, string>, column: string | undefined): string | null {
	if (!column) return null;
	const value = record[column]?.trim();
	return value ? value : null;
}

/** Tall skrevet på norsk kan bruke komma som desimalskilletegn. */
function number(value: string | null): number | null {
	if (!value) return null;
	const match = value.replace(',', '.').match(/-?\d+(\.\d+)?/);
	if (!match) return null;
	const parsed = Number(match[0]);
	return Number.isFinite(parsed) ? parsed : null;
}

/** Har personen bil? Enten et ja, eller et oppgitt antall plasser. */
function bringsCar(hasCar: Cell | null, seats: number | null): boolean {
	if (hasCar?.kind === 'yes') return true;
	if (hasCar?.kind === 'no') return false;
	// Noen skjemaer spør ikke «har du bil», bare «hvor mange plasser».
	if (hasCar === null || hasCar.kind === 'empty') return seats !== null && seats > 0;
	// Fritekst som «Backup» teller som bil, men da uten å overstyre et uttrykt nei.
	return true;
}

export function buildRoster(headers: string[], records: Record<string, string>[]): Roster {
	const mapping = mapColumns(headers);
	const roleColumns = new Set(Object.values(mapping));

	const people: Person[] = [];
	const cars: Car[] = [];

	for (const record of records) {
		const name = text(record, mapping.name) ?? '(uten navn)';
		const departure = text(record, mapping.departure);
		const seats = number(text(record, mapping.seats));
		const hasCar = mapping.hasCar ? classify(record[mapping.hasCar] ?? '') : null;

		let carId: number | null = null;
		if (bringsCar(hasCar, seats)) {
			carId = cars.length + 1;
			cars.push({
				id: carId,
				driver: name,
				seats,
				// Skjemaet spør ofte bare én gang om avreise. Da gjelder sjåførens tid
				// også for bilen.
				departure: text(record, mapping.carDeparture) ?? departure
			});
		}

		const extras: Record<string, string> = {};
		for (const header of headers) {
			if (!header || roleColumns.has(header)) continue;
			if (hiddenColumns.some((p) => p.test(header))) continue;
			const value = record[header]?.trim();
			if (value) extras[header] = value;
		}

		people.push({
			name,
			departure,
			professional: mapping.professional ? classify(record[mapping.professional] ?? '') : null,
			licence: mapping.licence ? classify(record[mapping.licence] ?? '') : null,
			carId,
			extras
		});
	}

	const seatNumbers = cars.map((c) => c.seats).filter((s): s is number => s !== null);

	return {
		people,
		cars,
		mapping,
		totalSeats: seatNumbers.length > 0 ? seatNumbers.reduce((a, b) => a + b, 0) : null,
		withLicence: mapping.licence
			? people.filter((p) => p.licence?.kind === 'yes').length
			: null,
		professionals: mapping.professional
			? people.filter((p) => p.professional?.kind === 'yes').length
			: null
	};
}
