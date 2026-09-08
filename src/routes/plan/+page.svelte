<script lang="ts">
	import { trip } from '$lib/config';
	import { places } from '$lib/places';
	import { schedule, scheduleIsDraft } from '$lib/schedule';

	/** Én overskrift per dag, ikke én per punkt. */
	const isNewDay = (index: number) =>
		index === 0 || schedule[index].day !== schedule[index - 1].day;

	const hasPlace = (name?: string) => name !== undefined && places.some((p) => p.name === name);
</script>

<svelte:head>
	<title>Plan – {trip.title}</title>
</svelte:head>

<h1>Plan</h1>
<p class="lede">Foreløpig tidsskjema for turen.</p>

<ol class="timeline">
	{#each schedule as entry, i (entry.day + (entry.time ?? '') + entry.title)}
		{#if isNewDay(i)}
			<li class="day-heading">{entry.day}</li>
		{/if}
		<li class="entry">
			<div class="when">
				{#if entry.time}
					<span class="time">{entry.time}</span>
				{:else}
					<span class="muted small">i løpet av dagen</span>
				{/if}
			</div>
			<div class="what">
				<h3>{entry.title}</h3>
				{#if entry.note}<p class="muted small">{entry.note}</p>{/if}
				{#if entry.people && entry.people.length > 0}
					<p class="small">Med: {entry.people.join(', ')}</p>
				{/if}
				{#if hasPlace(entry.place)}
					<p class="small"><a href="/heidal">{entry.place} på kartet →</a></p>
				{/if}
			</div>
		</li>
	{/each}
</ol>

{#if scheduleIsDraft}
	<p class="notice small">
		Planen er ikke ferdig. Hvem som er med på hvert punkt fylles ut etter hvert, og redigeres i
		<code>src/lib/schedule.ts</code>.
	</p>
{/if}
