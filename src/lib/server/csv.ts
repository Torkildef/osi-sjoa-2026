/**
 * Minimal CSV-leser etter RFC 4180, som er formatet Google Sheets publiserer.
 *
 * Vi skriver den selv framfor å dra inn et bibliotek: regnearket kan inneholde
 * fritekstsvar med komma, linjeskift og anførselstegn, og det er nøyaktig de
 * tilfellene en naiv split(',') ryker på.
 */
export function parseCsv(input: string): string[][] {
	const text = input.charCodeAt(0) === 0xfeff ? input.slice(1) : input; // fjern BOM
	const rows: string[][] = [];
	let row: string[] = [];
	let field = '';
	let quoted = false;
	let touched = false; // skiller en tom siste linje fra en rad med ett tomt felt

	for (let i = 0; i < text.length; i++) {
		const ch = text[i];

		if (quoted) {
			if (ch === '"') {
				if (text[i + 1] === '"') {
					field += '"'; // doblet anførselstegn betyr ett literært
					i++;
				} else {
					quoted = false;
				}
			} else {
				field += ch; // linjeskift og komma inne i anførselstegn er data
			}
			continue;
		}

		if (ch === '"') {
			quoted = true;
			touched = true;
		} else if (ch === ',') {
			row.push(field);
			field = '';
			touched = true;
		} else if (ch === '\n') {
			row.push(field);
			rows.push(row);
			row = [];
			field = '';
			touched = false;
		} else if (ch !== '\r') {
			field += ch;
			touched = true;
		}
	}

	if (touched || field !== '') {
		row.push(field);
		rows.push(row);
	}
	return rows;
}

/**
 * Gjør rader om til oppslag med kolonnenavn som nøkkel. Første rad er overskrifter.
 * Tomme rader hoppes over – regneark har gjerne noen på slutten.
 */
export function parseCsvRecords(input: string): {
	headers: string[];
	records: Record<string, string>[];
} {
	const rows = parseCsv(input);
	if (rows.length === 0) return { headers: [], records: [] };

	const headers = rows[0].map((h) => h.trim());
	const records = rows
		.slice(1)
		.filter((r) => r.some((cell) => cell.trim() !== ''))
		.map((r) => Object.fromEntries(headers.map((h, i) => [h, (r[i] ?? '').trim()])));

	return { headers, records };
}
