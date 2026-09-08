#!/usr/bin/env node
/**
 * Henter elveløpet til Sjoa fra OpenStreetMap og skriver det til
 * src/lib/data/sjoa.json, delt opp i strekningene i src/lib/river.ts.
 *
 *   node scripts/hent-elv.mjs
 *
 * Krever bare nettilgang – ingen nøkkel, ingen konto. Overpass API kan være treg
 * på kveldstid; skriptet venter opptil et minutt.
 *
 * Slik virker det: OSM har elva som mange små «ways» som deler endepunkter. Vi
 * henter alle med navnet Sjoa i området rundt Heidal, syr dem sammen til én
 * sammenhengende linje, og klipper ut biten mellom put inn og take out for hver
 * strekning – nærmeste punkt på elva til hvert av stedene.
 *
 * Får du en strekning som ser gal ut (for kort, hopper over en sving), er det
 * som regel en øy: elva deler seg, og vi tok feil løp. Da hjelper det å justere
 * put inn/take out et par hundre meter, eller redigere lista i sjoa.json for hånd.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(here, '../src/lib/data/sjoa.json');
const OVERPASS = 'https://overpass-api.de/api/interpreter';

/** Området vi spør om: hele Heidal ned til der Sjoa møter Lågen. */
const BBOX = '61.66,9.20,61.80,9.60';
const QUERY = `[out:json][timeout:60];
(
  way["waterway"="river"]["name"="Sjoa"](${BBOX});
);
out geom;`;

/**
 * Strekningene, med endepunktene sine. Hentes fra river.ts/places.ts ved å lese
 * fila som tekst: skriptet skal kunne kjøres uten å bygge prosjektet først.
 */
function readSections() {
	const places = readFileSync(resolve(here, '../src/lib/places.ts'), 'utf8');
	const river = readFileSync(resolve(here, '../src/lib/river.ts'), 'utf8');

	const coords = new Map();
	for (const m of places.matchAll(
		/name:\s*'([^']+)'[\s\S]*?coords:\s*\[\s*([\d.]+),\s*([\d.]+)\s*\]/g
	)) {
		coords.set(m[1], [Number(m[2]), Number(m[3])]);
	}

	const sections = [];
	for (const m of river.matchAll(
		/id:\s*'([^']+)'[\s\S]*?from:\s*'([^']+)'[\s\S]*?to:\s*'([^']+)'/g
	)) {
		const [, id, from, to] = m;
		if (!coords.has(from) || !coords.has(to)) {
			console.warn(`Hopper over ${id}: ${from} eller ${to} mangler koordinat.`);
			continue;
		}
		sections.push({ id, from: coords.get(from), to: coords.get(to) });
	}
	return sections;
}

/** Syr OSM-ways sammen til én linje av [lat, lon]. */
export function stitch(ways) {
	const remaining = new Set(ways);
	const endsAt = (way, node) => way.nodes[0] === node || way.nodes.at(-1) === node;

	// Start i den enden som ikke henger sammen med noe annet – det er
	// oppstrøms- eller nedstrømsenden av elva.
	let start = ways.find((w) => !ways.some((o) => o !== w && endsAt(o, w.nodes[0])));
	start ??= ways[0];
	remaining.delete(start);

	let line = start.geometry.map((p) => [p.lat, p.lon]);
	let node = start.nodes.at(-1);
	const visited = new Set(start.nodes);
	const otherEnd = (way) => (way.nodes[0] === node ? way.nodes.at(-1) : way.nodes[0]);

	while (remaining.size > 0) {
		// Aldri tilbake til et punkt vi har vært: der elva har delt seg rundt en øy,
		// ville det andre løpet ellers blitt sydd på baklengs når løpene møtes igjen.
		const candidates = [...remaining].filter((w) => endsAt(w, node) && !visited.has(otherEnd(w)));
		if (candidates.length === 0) break;
		// Ved en øy finnes to løp videre. Ta det lengste – hovedløpet.
		const next = candidates.sort((a, b) => b.geometry.length - a.geometry.length)[0];
		remaining.delete(next);
		next.nodes.forEach((n) => visited.add(n));
		let pts = next.geometry.map((p) => [p.lat, p.lon]);
		if (next.nodes[0] !== node) pts = pts.reverse();
		line = line.concat(pts.slice(1));
		node = next.nodes[0] === node ? next.nodes.at(-1) : next.nodes[0];
	}
	if (remaining.size > 0) {
		console.warn(`${remaining.size} biter av elva ble ikke brukt (sideløp rundt øyer, eller biter som ikke henger sammen).`);
	}
	return line;
}

/** Elva skal gå nedover. Første punkt skal ligge nærmest Heidal (vest), så snu om ikke. */
export function orientDownstream(line) {
	return line[0][1] > line.at(-1)[1] ? line.reverse() : line;
}

const nearestIndex = (line, [lat, lon]) => {
	let best = 0;
	let bestD = Infinity;
	line.forEach(([a, b], i) => {
		const d = (a - lat) ** 2 + ((b - lon) * Math.cos((lat * Math.PI) / 180)) ** 2;
		if (d < bestD) {
			bestD = d;
			best = i;
		}
	});
	return best;
};

/** Biten av elva mellom to steder, i elvas retning. */
export function clip(line, from, to) {
	let a = nearestIndex(line, from);
	let b = nearestIndex(line, to);
	if (a > b) [a, b] = [b, a];
	return line.slice(a, b + 1).map(([lat, lon]) => [round(lat), round(lon)]);
}

const round = (n) => Math.round(n * 1e6) / 1e6;

async function main() {
	const sections = readSections();
	console.log(`Henter Sjoa fra OpenStreetMap …`);
	const response = await fetch(OVERPASS, {
		method: 'POST',
		body: new URLSearchParams({ data: QUERY }),
		signal: AbortSignal.timeout(90_000)
	});
	if (!response.ok) throw new Error(`Overpass svarte ${response.status}`);
	const { elements } = await response.json();
	const ways = elements.filter((e) => e.type === 'way' && e.geometry && e.nodes);
	if (ways.length === 0) throw new Error('Fant ingen elv med navnet Sjoa i området.');
	console.log(`${ways.length} biter, syr sammen …`);

	const line = orientDownstream(stitch(ways));
	const out = { source: 'OpenStreetMap-bidragsytere, ODbL', fetched: new Date().toISOString().slice(0, 10), sections: {} };
	for (const s of sections) {
		out.sections[s.id] = clip(line, s.from, s.to);
		console.log(`${s.id}: ${out.sections[s.id].length} punkter`);
	}
	writeFileSync(OUT, JSON.stringify(out, null, '\t') + '\n');
	console.log(`Skrev ${OUT}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
	main().catch((err) => {
		console.error(err.message);
		process.exit(1);
	});
}
