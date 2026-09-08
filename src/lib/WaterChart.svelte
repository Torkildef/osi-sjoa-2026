<script lang="ts">
	import { water } from './config';
	import type { Reading } from './nve';

	let { readings, unit }: { readings: Reading[]; unit: string } = $props();

	const [low, high] = water.perfect;

	const W = 760;
	const H = 220;
	const PAD = { top: 14, right: 16, bottom: 26, left: 42 };
	const plotW = W - PAD.left - PAD.right;
	const plotH = H - PAD.top - PAD.bottom;

	const values = $derived(readings.map((r) => r.value));
	const times = $derived(readings.map((r) => new Date(r.time).getTime()));
	const latest = $derived(readings.at(-1)!);

	// Skalaen rommer alltid hele perfekt-sonen, ellers ville båndet forsvunnet ut av
	// bildet når vannføringen ligger langt utenfor, og grafen mistet referansen sin.
	const min = $derived(Math.min(...values, low));
	const max = $derived(Math.max(...values, high));
	const pad = $derived((max - min || 1) * 0.12);
	const yMin = $derived(min - pad);
	const yMax = $derived(max + pad);

	const x = (t: number) =>
		PAD.left + ((t - times[0]) / (times.at(-1)! - times[0] || 1)) * plotW;
	const y = (v: number) => PAD.top + (1 - (v - yMin) / (yMax - yMin || 1)) * plotH;

	const line = $derived(readings.map((r, i) => `${i ? 'L' : 'M'}${x(times[i])},${y(r.value)}`).join(' '));

	const bandTop = $derived(y(Math.min(high, yMax)));
	const bandBottom = $derived(y(Math.max(low, yMin)));

	const ticks = $derived(
		[yMin, (yMin + yMax) / 2, yMax].map((v, i) => ({ i, v, y: y(v), label: Math.round(v) }))
	);

	/** Klokkeslett langs x-aksen, med norsk tid uansett hvor serveren står. */
	const clock = new Intl.DateTimeFormat('nb-NO', {
		timeZone: 'Europe/Oslo',
		hour: '2-digit',
		minute: '2-digit'
	});
	const weekday = new Intl.DateTimeFormat('nb-NO', { timeZone: 'Europe/Oslo', weekday: 'short' });

	/** «man 14» – ukedagen skiller de to endene av et 48-timers vindu fra hverandre. */
	function dayHourLabel(date: Date): string {
		return `${weekday.format(date).replace('.', '')} ${clock.format(date).slice(0, 2)}`;
	}
	const dayTime = new Intl.DateTimeFormat('nb-NO', {
		timeZone: 'Europe/Oslo',
		weekday: 'short',
		hour: '2-digit',
		minute: '2-digit'
	});

	const xTicks = $derived(
		[0, Math.floor(readings.length / 2), readings.length - 1]
			.filter((i, n, a) => a.indexOf(i) === n && i >= 0)
			.map((i) => ({ i, x: x(times[i]), label: dayHourLabel(new Date(times[i])) }))
	);

	const level = $derived(
		latest.value < low ? 'lav' : latest.value > high ? 'hoy' : 'perfekt'
	);
	const levelText = { lav: 'Under perfekt', hoy: 'Over perfekt', perfekt: 'Perfekt' } as const;
	const levelIcon = { lav: '▼', hoy: '▲', perfekt: '✓' } as const;

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
</script>

<div class="water">
	<div class="water-head">
		<div>
			<div class="water-value">
				{latest.value.toLocaleString('nb-NO', { maximumFractionDigits: 1 })}
				<span class="water-unit">{unit}</span>
			</div>
			<div class="muted small">
				Målt {dayTime.format(new Date(latest.time))} · NVE stasjon {water.stationId}
			</div>
		</div>
		<span class="state state-{level}">{levelIcon[level]} {levelText[level]}</span>
	</div>

	<svg
		viewBox="0 0 {W} {H}"
		class="water-chart"
		role="img"
		aria-label="Vannføring siste {water.hours} timer. Nå {latest.value} {unit}. {levelText[level]}, der {low} til {high} {unit} regnes som perfekt."
		onpointermove={onMove}
		onpointerleave={() => (hover = null)}
	>
		<!-- Perfekt-sonen. Båndet er merket med tekst, så fargen ikke er eneste signal. -->
		<rect
			x={PAD.left}
			y={bandTop}
			width={plotW}
			height={Math.max(0, bandBottom - bandTop)}
			class="band"
		/>
		<text x={PAD.left + 6} y={bandTop + 13} class="band-label">
			{low}–{high} {unit} · perfekt
		</text>

		{#each ticks as tick (tick.i)}
			<line x1={PAD.left} x2={W - PAD.right} y1={tick.y} y2={tick.y} class="grid" />
			<text x={PAD.left - 8} y={tick.y + 4} class="axis" text-anchor="end">{tick.label}</text>
		{/each}

		{#each xTicks as tick (tick.i)}
			<text x={tick.x} y={H - 8} class="axis" text-anchor="middle">{tick.label}</text>
		{/each}

		<path d={line} class="series" />

		<!-- Siste punkt merkes direkte; resten leses av aksen og hover. -->
		<circle cx={x(times.at(-1)!)} cy={y(latest.value)} r="4.5" class="last-dot" />

		{#if hover !== null}
			<line
				x1={x(times[hover])}
				x2={x(times[hover])}
				y1={PAD.top}
				y2={PAD.top + plotH}
				class="crosshair"
			/>
			<circle cx={x(times[hover])} cy={y(values[hover])} r="4.5" class="hover-dot" />
			<text
				x={Math.min(Math.max(x(times[hover]), PAD.left + 46), W - PAD.right - 46)}
				y={PAD.top + 10}
				class="hover-label"
				text-anchor="middle"
			>
				{values[hover].toLocaleString('nb-NO', { maximumFractionDigits: 1 })}
				{unit} · {clock.format(new Date(readings[hover].time))}
			</text>
		{/if}
	</svg>
</div>
