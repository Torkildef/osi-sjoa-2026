<script lang="ts">
	import Icon from '$lib/Icon.svelte';
	import RiverProfile from '$lib/RiverProfile.svelte';
	import WaterChart from '$lib/WaterChart.svelte';
	import WaterNow from '$lib/WaterNow.svelte';
	import { trip, water as waterConfig } from '$lib/config';
	import { riverIsDraft, sections } from '$lib/river';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Elven – {trip.title}</title>
</svelte:head>

<div class="page-head">
	<h1 class="headline-large">Elven</h1>
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
			<div class="chip-row" style="margin-top: 0.5rem">
				<span class="chip warning">🪨 Under {waterConfig.good[0]} · hompete</span>
				<span class="chip primary">👍 {waterConfig.good[0]}–{waterConfig.good[1]} · bra</span>
				<span class="chip success">🤙 {waterConfig.perfect[0]}–{waterConfig.perfect[1]} · perfekt</span>
				<span class="chip tertiary">🌊 Over {waterConfig.perfect[1]} · spennende</span>
			</div>
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
	<div class="stack" style="gap: 1.25rem">
		{#each sections as section (section.id)}
			<RiverProfile {section} />
		{/each}
	</div>

	{#if riverIsDraft}
		<p class="notice" style="margin-top: 1.25rem">
			<Icon name="edit" size={20} />
			<span>Gradering og beskrivelser er foreløpige.</span>
		</p>
	{/if}
</section>
