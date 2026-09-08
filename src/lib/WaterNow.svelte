<script lang="ts">
	import Icon from './Icon.svelte';
	import { water } from './config';
	import { dayTime, formatFlow, levelFor, levelInfo } from './level';
	import type { Reading } from './nve';

	/** Siste måling som stort tall med status. Brukes på forsiden og Elven-siden. */
	let {
		readings,
		unit,
		compact = false
	}: { readings: Reading[]; unit: string; compact?: boolean } = $props();

	const latest = $derived(readings.at(-1)!);
	const level = $derived(levelFor(latest.value));
	const info = $derived(levelInfo[level]);

	/** Endring siste seks timer, så man ser om elva stiger eller synker. */
	const trend = $derived.by(() => {
		const sixHoursAgo = new Date(latest.time).getTime() - 6 * 3600_000;
		const earlier = readings.find((r) => new Date(r.time).getTime() >= sixHoursAgo);
		if (!earlier || earlier === latest) return null;
		const diff = latest.value - earlier.value;
		if (Math.abs(diff) < 0.5) return { dir: 'flat' as const, diff };
		return { dir: diff > 0 ? ('up' as const) : ('down' as const), diff };
	});
</script>

<div class="water-now">
	<div>
		<div class="water-value">
			{formatFlow(latest.value)}<span class="unit">{unit}</span>
		</div>
		{#if !compact}
			<div class="body-small on-surface-variant" style="margin-top: 0.3rem">
				Målt {dayTime.format(new Date(latest.time))} · NVE-stasjon {water.stationId}
			</div>
		{/if}
	</div>
	<div class="chip-row">
		<span class="chip {info.tone}">{info.emoji} {compact ? info.short : info.text}</span>
		{#if trend && trend.dir !== 'flat'}
			<span class="chip tonal" title="Endring siste seks timer">
				<Icon name={trend.dir === 'up' ? 'trendingUp' : 'trendingDown'} size={18} />
				{trend.dir === 'up' ? '+' : ''}{formatFlow(trend.diff)} / 6 t
			</span>
		{/if}
	</div>
</div>
