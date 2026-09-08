<script lang="ts">
	import Icon from '$lib/Icon.svelte';
	import RiverProfile from '$lib/RiverProfile.svelte';
	import WaterChart from '$lib/WaterChart.svelte';
	import WaterNow from '$lib/WaterNow.svelte';
	import { trip, water as waterConfig } from '$lib/config';
	import { geometryInfo, riverIsDraft, sections, isTraced } from '$lib/river';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const untraced = sections.filter((s) => !isTraced(s));
</script>

<svelte:head>
	<title>Elven – {trip.title}</title>
</svelte:head>

<div class="page-head">
	<div>
		<h1 class="headline-large">Elven</h1>
		<p class="lede">Hvordan Sjoa går akkurat nå, og strekningene vi padler.</p>
	</div>
</div>

<section>
	<div class="section-head">
		<h2 class="title-large"><Icon name="waves" size={22} class="primary-text" /> Vannføring</h2>
		<a class="chip link" href={waterConfig.stationUrl} target="_blank" rel="noopener">
			NVE Sildre
			<Icon name="openInNew" size={16} />
		</a>
	</div>

	{#if data.water.status === 'ok'}
		<div class="card">
			<WaterNow readings={data.water.readings} unit={data.water.unit} />
			<WaterChart readings={data.water.readings} unit={data.water.unit} />
			<p class="footnote">
				Siste {waterConfig.hours} timer, målt av NVE ved stasjon {waterConfig.stationId}. Det grønne
				båndet er vannføringen vi regner som perfekt. Hold pekeren over grafen for enkeltmålinger.
			</p>
		</div>
	{:else if data.water.status === 'unconfigured'}
		<div class="empty">
			<Icon name="waterDrop" size={36} />
			<div class="title-medium">Vannføringen er ikke koblet til</div>
			<p class="body-medium">
				Sett <code>NVE_API_KEY</code> for å vise grafen. Nøkkelen er gratis og hentes på
				<a href="https://hydapi.nve.no/Users" target="_blank" rel="noopener">hydapi.nve.no</a>.
			</p>
		</div>
	{:else}
		<p class="notice error">
			<Icon name="error" size={20} />
			{data.water.message}
		</p>
	{/if}
</section>

<section class="block">
	<div class="section-head">
		<h2 class="title-large"><Icon name="kayaking" size={22} class="primary-text" /> Strekningene</h2>
		<a class="chip link" href="/kart?strekning={sections[0]?.id}">
			<Icon name="map" size={16} />
			Se alt på kartet
		</a>
	</div>
	<p class="body-medium on-surface-variant" style="margin-bottom: 1rem; max-width: 46rem">
		Vi padler to strekninger etter hverandre: først Bru-bru gjennom Heidal, så Playrun videre
		nedover. Take out på den første er put inn på den neste, så det går an å ta begge i ett.
	</p>

	<div class="stack" style="gap: 1.25rem">
		{#each sections as section (section.id)}
			<RiverProfile {section} />
		{/each}
	</div>

	{#if riverIsDraft}
		<p class="notice" style="margin-top: 1.25rem">
			<Icon name="edit" size={20} />
			<span>
				Gradering og beskrivelser er foreløpige. Stryk, playspots og ting å passe på legges inn i
				<code>src/lib/river.ts</code> etter hvert som noen har padlet strekningene.
			</span>
		</p>
	{/if}

	{#if untraced.length > 0}
		<p class="notice" style="margin-top: 0.6rem">
			<Icon name="info" size={20} />
			<span>
				Elveløpet er ikke hentet inn ennå, så kartet tegner strekningene som rette streker. Kjør
				<code>node scripts/hent-elv.mjs</code> for å hente det fra OpenStreetMap.
			</span>
		</p>
	{:else if geometryInfo.fetched}
		<p class="footnote">Elveløp fra {geometryInfo.source}, hentet {geometryInfo.fetched}.</p>
	{/if}
</section>
