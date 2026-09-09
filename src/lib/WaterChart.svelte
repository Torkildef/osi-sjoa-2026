<script lang="ts">
	import { water } from './config';
	import type { Reading } from './nve';
	import { formatFlow, levelFor, levelInfo } from './level';

	let { readings, unit }: { readings: Reading[]; unit: string } = $props();

	const [low, high] = water.perfect;
	const goodLow = water.good[0];

	const W = 760;
	const H = 230;
	const PAD = { top: 18, right: 16, bottom: 28, left: 44 };
	const plotW = W - PAD.left - PAD.right;
	const plotH = H - PAD.top - PAD.bottom;

	const values = $derived(readings.map((r) => r.value));
	const times = $derived(readings.map((r) => new Date(r.time).getTime()));
	const latest = $derived(readings.at(-1)!);

	// Skalaen rommer alltid hele perfekt-sonen, ellers ville båndet forsvunnet ut av
	// bildet når vannføringen ligger langt utenfor, og grafen mistet referansen sin.
	const min = $derived(Math.min(...values, goodLow));
	const max = $derived(Math.max(...values, high));
	const pad = $derived((max - min || 1) * 0.12);
	const yMin = $derived(Math.max(0, min - pad));
	const yMax = $derived(max + pad);

	const x = (t: number) => PAD.left + ((t - times[0]) / (times.at(-1)! - times[0] || 1)) * plotW;
	const y = (v: number) => PAD.top + (1 - (v - yMin) / (yMax - yMin || 1)) * plotH;

	const line = $derived(
		readings.map((r, i) => `${i ? 'L' : 'M'}${x(times[i])},${y(r.value)}`).join(' ')
	);
	const area = $derived(
		`${line} L${x(times.at(-1)!)},${PAD.top + plotH} L${x(times[0])},${PAD.top + plotH} Z`
	);

	const bandTop = $derived(y(Math.min(high, yMax)));
	const bandBottom = $derived(y(Math.max(low, yMin)));
	const goodBottom = $derived(y(Math.max(goodLow, yMin)));

	const ticks = $derived(
		[yMin, (yMin + yMax) / 2, yMax].map((v, i) => ({ i, v, y: y(v), label: Math.round(v) }))
	);

	const clock = new Intl.DateTimeFormat('nb-NO', {
		timeZone: 'Europe/Oslo',
		hour: '2-digit',
		minute: '2-digit'
	});
	const weekday = new Intl.DateTimeFormat('nb-NO', { timeZone: 'Europe/Oslo', weekday: 'short' });

	/** «man 14» – ukedagen skiller de to endene av et 48-timers vindu fra hverandre. */
	const dayHourLabel = (date: Date) =>
		`${weekday.format(date).replace('.', '')} ${clock.format(date).slice(0, 2)}`;

	const xTicks = $derived(
		[0, Math.floor(readings.length / 4), Math.floor(readings.length / 2), Math.floor((3 * readings.length) / 4), readings.length - 1]
			.filter((i, n, a) => a.indexOf(i) === n && i >= 0)
			.map((i) => ({ i, x: x(times[i]), label: dayHourLabel(new Date(times[i])) }))
	);

	const level = $derived(levelFor(latest.value));

	// Hover: nærmeste måling til pekeren.
	let hover = $state<number | null>(null);

	function onMove(event: PointerEvent) {
		const svg = event.currentTarget as SVGSVGElement;
		const box = svg.getBoundingClientRect();
		const px = ((event.clientX - box.left) / box.width) * W;
		let best = 0;
		let bestDist = Infinity;
		for (let i = 0; i < times.length; i++) {
			const d = Math.abs(x(times[i]) - px);
			if (d < bestDist) {
				bestDist = d;
				best = i;
			}
		}
		hover = best;
	}

	const hoverText = $derived(
		hover === null
			? ''
			: `${formatFlow(values[hover])} ${unit} · ${clock.format(new Date(readings[hover].time))}`
	);
	const hoverX = $derived(
		hover === null ? 0 : Math.min(Math.max(x(times[hover]), PAD.left + 70), W - PAD.right - 70)
	);
</script>

<svg
	viewBox="0 0 {W} {H}"
	class="water-chart"
	role="img"
	aria-label="Vannføring siste {water.hours} timer. Nå {formatFlow(latest.value)} {unit}. {levelInfo[level].text}, der {low} til {high} {unit} regnes som perfekt."
	onpointermove={onMove}
	onpointerleave={() => (hover = null)}
>
	<defs>
		<linearGradient id="water-fill" x1="0" x2="0" y1="0" y2="1">
			<stop offset="0" stop-color="var(--primary)" stop-opacity="0.28" />
			<stop offset="1" stop-color="var(--primary)" stop-opacity="0" />
		</linearGradient>
	</defs>

	<!-- Bra-sonen under perfekt-sonen, i en svakere tone. -->
	<rect
		x={PAD.left}
		y={bandBottom}
		width={plotW}
		height={Math.max(0, goodBottom - bandBottom)}
		class="band good"
	/>
	<!-- Perfekt-sonen. Båndet er merket med tekst, så fargen ikke er eneste signal. -->
	<rect
		x={PAD.left}
		y={bandTop}
		width={plotW}
		height={Math.max(0, bandBottom - bandTop)}
		class="band"
	/>
	<line x1={PAD.left} x2={W - PAD.right} y1={bandTop} y2={bandTop} class="band-edge" />
	<line x1={PAD.left} x2={W - PAD.right} y1={bandBottom} y2={bandBottom} class="band-edge" />
	<text x={W - PAD.right - 6} y={bandTop + 14} class="band-label" text-anchor="end">
		{low}–{high} {unit} · perfekt
	</text>
	{#if goodBottom - bandBottom > 14}
		<text x={W - PAD.right - 6} y={goodBottom - 4} class="band-label good" text-anchor="end">
			{goodLow}–{low} · bra
		</text>
	{/if}

	{#each ticks as tick (tick.i)}
		<line x1={PAD.left} x2={W - PAD.right} y1={tick.y} y2={tick.y} class="grid" />
		<text x={PAD.left - 8} y={tick.y + 4} class="axis" text-anchor="end">{tick.label}</text>
	{/each}

	{#each xTicks as tick (tick.i)}
		<text x={tick.x} y={H - 8} class="axis" text-anchor="middle">{tick.label}</text>
	{/each}

	<path d={area} class="area" />
	<path d={line} class="series" />

	<!-- Siste punkt merkes direkte; resten leses av aksen og hover. -->
	<circle cx={x(times.at(-1)!)} cy={y(latest.value)} r="5" class="last-dot" />

	{#if hover !== null}
		<line
			x1={x(times[hover])}
			x2={x(times[hover])}
			y1={PAD.top}
			y2={PAD.top + plotH}
			class="crosshair"
		/>
		<circle cx={x(times[hover])} cy={y(values[hover])} r="5" class="hover-dot" />
		<rect x={hoverX - 68} y={PAD.top - 12} width="136" height="22" class="hover-bg" />
		<text x={hoverX} y={PAD.top + 3} class="hover-label" text-anchor="middle">{hoverText}</text>
	{/if}
</svg>
