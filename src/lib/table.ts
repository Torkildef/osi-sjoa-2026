import { columnGroups, hiddenColumns, highlightRow, type ColumnGroup } from './config';

/**
 * Gruppa slik den sendes til nettleseren. ColumnGroup inneholder RegExp, som
 * SvelteKit ikke kan serialisere fra en server-load – derfor denne uten mønstrene.
 */
export type GroupRef = { label: string; emoji: string; tone: ColumnGroup['tone'] };

function toRef(group: ColumnGroup | null): GroupRef | null {
	return group && { label: group.label, emoji: group.emoji, tone: group.tone };
}

/** Hvordan én celle skal tegnes. */
export type Cell =
	| { kind: 'yes' }
	| { kind: 'no' }
	| { kind: 'empty' }
	| { kind: 'text'; value: string };

export type Column = {
	name: string;
	group: GroupRef | null;
	/** Sant når hver eneste utfylte celle er ja eller nei. Styrer summeringen. */
	boolean: boolean;
	/** Sant når hver eneste utfylte celle er et tall. */
	numeric: boolean;
	/** Teksten i totalraden. */
	total: string;
};

export type Row = {
	cells: Cell[];
	/** Arrangører og instruktører markeres. */
	highlighted: boolean;
};

export type Table = {
	columns: Column[];
	rows: Row[];
	/** Gruppene i kolonnerekkefølge, med hvor mange kolonner hver spenner over. */
	bands: { group: GroupRef | null; span: number }[];
};

const YES = /^(ja|yes|true|sant|x|✓|ja!|jepp)$/i;
const NO = /^(nei|no|false|usant|✗|-|–)$/i;

export function classify(raw: string): Cell {
	const value = raw.trim();
	if (value === '') return { kind: 'empty' };
	if (YES.test(value)) return { kind: 'yes' };
	if (NO.test(value)) return { kind: 'no' };
	return { kind: 'text', value };
}

/** Tall skrevet på norsk kan bruke komma som desimalskilletegn. */
function asNumber(cell: Cell): number | null {
	if (cell.kind !== 'text') return null;
	const parsed = Number(cell.value.replace(',', '.').replace(/\s/g, ''));
	return Number.isFinite(parsed) ? parsed : null;
}

function groupFor(column: string): ColumnGroup | null {
	return columnGroups.find((g) => g.patterns.some((p) => p.test(column))) ?? null;
}

/**
 * Bygger tabellen fra regnearket.
 *
 * Kolonnene beholder rekkefølgen fra arket, men de som ikke tilhører noen gruppe
 * flyttes først – det er de identifiserende feltene (navn, rolle), og de hører
 * hjemme til venstre for fargebåndene.
 */
export function buildTable(headers: string[], records: Record<string, string>[]): Table {
	const visible = headers.filter((h) => h !== '' && !hiddenColumns.some((p) => p.test(h)));

	const ungrouped = visible.filter((h) => groupFor(h) === null);
	const grouped = visible.filter((h) => groupFor(h) !== null);
	const ordered = [...ungrouped, ...grouped];

	const cellsByColumn = ordered.map((column) => records.map((r) => classify(r[column] ?? '')));

	const columns: Column[] = ordered.map((name, i) => {
		const cells = cellsByColumn[i];
		const filled = cells.filter((c) => c.kind !== 'empty');
		const isBoolean =
			filled.length > 0 && filled.every((c) => c.kind === 'yes' || c.kind === 'no');
		const numbers = filled.map(asNumber);
		const isNumeric = filled.length > 0 && numbers.every((n) => n !== null);

		let total: string;
		if (i === 0) {
			total = `${records.length} ${records.length === 1 ? 'person' : 'personer'}`;
		} else if (isBoolean) {
			total = `${cells.filter((c) => c.kind === 'yes').length} av ${records.length}`;
		} else if (isNumeric) {
			total = String(numbers.reduce<number>((sum, n) => sum + (n ?? 0), 0));
		} else if (filled.length === records.length) {
			// Kolonner alle har fylt ut er merkelapper, ikke noe å telle. «Rolle: 14»
			// er bare antall rader om igjen.
			total = '';
		} else {
			// Blandede kolonner («Nei», «Telt», «Ja») teller hvor mange som faktisk har
			// oppgitt noe. Tar vi med «Nei» også, blir tallet bare antall utfylte celler,
			// som ikke sier noe – «Trenger utstyr: 11» når to trenger utstyr.
			total = String(filled.filter((c) => c.kind !== 'no').length);
		}

		return { name, group: toRef(groupFor(name)), boolean: isBoolean, numeric: isNumeric, total };
	});

	const rows: Row[] = records.map((record, rowIndex) => ({
		cells: cellsByColumn.map((cells) => cells[rowIndex]),
		highlighted: Object.values(record).some((value) => highlightRow.test(value))
	}));

	// Slår sammen nabokolonner som hører til samme gruppe, til ett fargebånd.
	const bands: Table['bands'] = [];
	for (const column of columns) {
		const last = bands.at(-1);
		if (last && last.group?.label === column.group?.label) last.span++;
		else bands.push({ group: column.group, span: 1 });
	}

	return { columns, rows, bands };
}
