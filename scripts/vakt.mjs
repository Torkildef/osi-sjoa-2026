#!/usr/bin/env node
/**
 * Vakten: stopper commits som lekker det som ikke skal på en åpen side.
 *
 *   node scripts/vakt.mjs <fra-commit> <til-commit>
 *
 * Leser linjene som er lagt til mellom de to commitene, og feiler hvis noen av
 * dem inneholder noe som ligner et telefonnummer, en e-postadresse eller en
 * nøkkel. Kjøres i CI på hver push og pull request.
 *
 * Filer som naturlig inneholder lange tall – lockfila, elveløpet, bilder –
 * hoppes over.
 */
import { execFileSync } from 'node:child_process';

const [from, to] = process.argv.slice(2);
if (!from || !to) {
	console.error('Bruk: node scripts/vakt.mjs <fra> <til>');
	process.exit(2);
}

const SKIP = [/package-lock\.json$/, /\.json$/, /\.(png|jpe?g|webp|svg|ico|woff2?)$/, /^scripts\/vakt\.mjs$/];

const RULES = [
	{
		name: 'telefonnummer',
		pattern: /(\+|00)\s?\d{2}[\s.-]?\d{2,3}[\s.-]?\d{2,3}[\s.-]?\d{2,3}(?:[\s.-]?\d{2,3})?|\b[49]\d{7}\b|\b[49]\d{2}\s\d{2}\s\d{3}\b/
	},
	{ name: 'e-postadresse', pattern: /[\w.+-]+@[\w-]+\.[\w.-]+/ },
	{
		name: 'nøkkel eller token',
		pattern: /\b(ghp|gho|ghs|ghu|github_pat)_[A-Za-z0-9_]{20,}|\bsk-ant-[A-Za-z0-9_-]{20,}|\bAKIA[0-9A-Z]{16}\b|-----BEGIN [A-Z ]*PRIVATE KEY-----/
	}
];

/** E-postadresser som med vilje står på siden. */
const ALLOW = [/elvepadling@osi\.no/, /noreply@anthropic\.com/];

const diff = execFileSync('git', ['diff', '--unified=0', `${from}..${to}`, '--'], {
	encoding: 'utf8',
	maxBuffer: 64 * 1024 * 1024
});

let file = '';
const hits = [];
for (const line of diff.split('\n')) {
	if (line.startsWith('+++ ')) {
		file = line.slice(4).replace(/^b\//, '');
		continue;
	}
	if (!line.startsWith('+') || line.startsWith('+++')) continue;
	if (SKIP.some((p) => p.test(file))) continue;
	const added = line.slice(1);
	if (ALLOW.some((p) => p.test(added))) continue;
	for (const rule of RULES) {
		if (rule.pattern.test(added)) hits.push({ file, rule: rule.name, line: added.trim().slice(0, 120) });
	}
}

if (hits.length > 0) {
	console.error('Vakten stoppet dette – det ser ut som noe som ikke skal på en åpen side:\n');
	for (const h of hits) console.error(`  ${h.file}: ${h.rule}\n    ${h.line}\n`);
	process.exit(1);
}
console.log('Vakten fant ingenting å stoppe.');
