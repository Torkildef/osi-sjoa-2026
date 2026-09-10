<script lang="ts">
	import Icon from '$lib/Icon.svelte';
	import { trip } from '$lib/config';
	import { placeByName } from '$lib/places';
	import { schedule, scheduleIsDraft, type ScheduleEntry } from '$lib/schedule';

	/** Én gruppe per dag, i rekkefølgen punktene står i. */
	const days = schedule.reduce<{ day: string; entries: ScheduleEntry[] }[]>((acc, entry) => {
		const last = acc.at(-1);
		if (last && last.day === entry.day) last.entries.push(entry);
		else acc.push({ day: entry.day, entries: [entry] });
		return acc;
	}, []);
</script>

<svelte:head>
	<title>Plan – {trip.title}</title>
</svelte:head>

<div class="page-head">
	<h1 class="headline-large">Plan</h1>
</div>

{#if scheduleIsDraft}
	<div class="card tertiary" style="margin-bottom: 1.5rem; display: flex; gap: 0.85rem; align-items: center">
		<Icon name="warning" size={32} />
		<div>
			<div class="title-large">Planen er ikke ferdig</div>
			<div class="body-medium">Tidene er omtrentlige. Elva bestemmer.</div>
		</div>
	</div>
{/if}

{#each days as group (group.day)}
	<section class="day">
		<div class="day-head">
			<span class="day-badge">{group.day}</span>
		</div>
		<ol class="timeline">
			{#each group.entries as entry ((entry.time ?? '') + entry.title)}
				<li class="entry">
					{#if entry.time}
						<span class="when">{entry.time}</span>
					{:else}
						<span class="when vague">I løpet av dagen</span>
					{/if}
					<div class="what">
						<h3 class="title-medium">{entry.title}</h3>
						{#if entry.note}<p>{entry.note}</p>{/if}
						{#if (entry.people && entry.people.length > 0) || placeByName(entry.place ?? '')}
							<div class="entry-meta">
								{#if entry.place && placeByName(entry.place)}
									<a class="chip link" href="/kart?sted={encodeURIComponent(entry.place)}">
										<Icon name="locationOn" size={16} />
										{entry.place}
									</a>
								{/if}
								{#each entry.people ?? [] as person (person)}
									<span class="chip tonal"><Icon name="person" size={16} /> {person}</span>
								{/each}
							</div>
						{/if}
					</div>
				</li>
			{/each}
		</ol>
	</section>
{/each}
