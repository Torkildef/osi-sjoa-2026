<script lang="ts">
	import WaterChart from '$lib/WaterChart.svelte';
	import { trip, water as waterConfig } from '$lib/config';
	import { places, runs } from '$lib/places';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const coordsFor = (name: string) => places.find((p) => p.name === name)?.coords ?? null;
	const mapsUrl = (name: string) => {
		const c = coordsFor(name);
		return c ? `https://www.google.com/maps/search/?api=1&query=${c[0]},${c[1]}` : null;
	};
</script>

<svelte:head>
	<title>Elven – {trip.title}</title>
</svelte:head>

<h1>Elven</h1>
<p class="lede">Vannføring og strekningene vi padler.</p>

<section class="section-block">
	<div class="section-head">
		<h2>Vannføring</h2>
		<a class="small" href={waterConfig.stationUrl} target="_blank" rel="noopener">NVE Sildre ↗</a>
	</div>

	{#if data.water.status === 'ok'}
		<WaterChart readings={data.water.readings} unit={data.water.unit} />
		<p class="muted small footnote">
			Siste {waterConfig.hours} timer, målt av NVE. Hold pekeren over grafen for enkeltmålinger.
		</p>
	{:else if data.water.status === 'unconfigured'}
		<div class="card">
			<p class="muted" style="margin: 0">
				Sett <code>NVE_API_KEY</code> for å vise vannføringen. Nøkkelen er gratis og hentes på
				<a href="https://hydapi.nve.no/Users" target="_blank" rel="noopener">hydapi.nve.no</a>.
			</p>
		</div>
	{:else}
		<div class="card">
			<p class="notice error" style="margin: 0">{data.water.message}</p>
		</div>
	{/if}
</section>

<section class="section-block">
	<h2>Strekninger</h2>
	<div class="grid runs">
		{#each runs as run (run.name)}
			<div class="run">
				<h3>{run.name}</h3>
				<dl class="facts small">
					<dt>Put inn</dt>
					<dd>
						{run.from}
						{#if mapsUrl(run.from)}
							<a href={mapsUrl(run.from)} target="_blank" rel="noopener">→</a>
						{/if}
					</dd>
					<dt>Take out</dt>
					<dd>
						{run.to}
						{#if mapsUrl(run.to)}
							<a href={mapsUrl(run.to)} target="_blank" rel="noopener">→</a>
						{/if}
					</dd>
				</dl>
			</div>
		{/each}
	</div>
	<p class="muted small footnote">
		Strekningene er tegnet inn på <a href="/heidal">kartet</a>. Mer om gradering, sikkerhet og
		nøkkelstryk kommer senere.
	</p>
</section>
