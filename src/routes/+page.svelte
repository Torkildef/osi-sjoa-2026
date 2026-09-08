<script lang="ts">
	import { invalidate } from '$app/navigation';
	import Map from '$lib/Map.svelte';
	import WaterChart from '$lib/WaterChart.svelte';
	import { SHEET_KEY, refreshSeconds, signupFormUrl, trip } from '$lib/config';
	import { missing, places } from '$lib/places';
	import { water as waterConfig } from '$lib/config';
	import type { Cell } from '$lib/table';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const sheet = $derived(data.sheet);
	const table = $derived(sheet.status === 'ok' ? sheet.table : null);

	// Uten database er det ingen Realtime å lytte på, så vi henter regnearket
	// på nytt med jevne mellomrom i stedet.
	let refreshing = $state(false);
	$effect(() => {
		const timer = setInterval(() => refresh(), refreshSeconds * 1000);
		return () => clearInterval(timer);
	});

	async function refresh() {
		refreshing = true;
		await invalidate(SHEET_KEY);
		refreshing = false;
	}

	const timeFormat = new Intl.DateTimeFormat('nb-NO', {
		timeZone: 'Europe/Oslo',
		hour: '2-digit',
		minute: '2-digit'
	});

	/** Første kolonne er navnet og skal stå fast når tabellen scrolles sidelengs. */
	const isSticky = (index: number) => index === 0;

	/**
	 * Navn og rolle leses som tekst og hører til venstre. Avkrysningene midtstilles,
	 * så ✓-ene danner en kolonne øyet kan skanne nedover.
	 */
	function align(cell: Cell, grouped: boolean): string {
		if (!grouped) return 'left';
		return cell.kind === 'text' && cell.value.length > 14 ? 'left' : 'center';
	}
</script>

<svelte:head>
	<title>{trip.title} – {trip.organiser}</title>
</svelte:head>

<div class="section-head">
	<div>
		<h1>{trip.title}</h1>
		<p class="lede">{trip.dates} · {trip.location} · {trip.price}</p>
	</div>
	<div class="head-actions">
		{#if sheet.status === 'ok'}
			<span class="muted small">
				Oppdatert {timeFormat.format(new Date(sheet.fetchedAt))}
			</span>
		{/if}
		<button class="secondary small" onclick={refresh} disabled={refreshing}>
			{refreshing ? 'Henter …' : 'Oppdater'}
		</button>
	</div>
</div>

{#if sheet.status === 'unconfigured'}
	<div class="card">
		<h2>Regnearket er ikke koblet til ennå</h2>
		<p class="muted">
			Sett miljøvariabelen <code>GOOGLE_SHEET_CSV_URL</code> til CSV-lenken fra
			<strong>Fil → Del → Publiser på nettet</strong> i regnearket skjemaet skriver til.
		</p>
	</div>
{:else if sheet.status === 'error'}
	<div class="card">
		<p class="notice error" style="margin: 0">{sheet.message}</p>
	</div>
{:else if table && table.rows.length === 0}
	<div class="card">
		<h2>Ingen svar ennå</h2>
		<p class="muted">
			Første påmelding dukker opp her automatisk.
			<a href={signupFormUrl} target="_blank" rel="noopener">Åpne påmeldingsskjemaet →</a>
		</p>
	</div>
{:else if table}
	<div class="sheet-wrap">
		<table class="sheet">
			<thead>
				<tr class="bands">
					{#each table.bands as band, i (i)}
						{#if band.group}
							<th class="band tone-{band.group.tone}" colspan={band.span} scope="colgroup">
								{band.group.emoji}
								{band.group.label}
							</th>
						{:else}
							{#each { length: band.span } as _, j (j)}
								<th class="band band-empty" rowspan="2" scope="col" class:sticky={isSticky(j)}>
									{table.columns[j].name}
								</th>
							{/each}
						{/if}
					{/each}
				</tr>
				<tr class="labels">
					{#each table.columns as column, i (column.name)}
						{#if column.group}
							<th class="tone-{column.group.tone} soft" scope="col">{column.name}</th>
						{/if}
					{/each}
				</tr>
			</thead>

			<tbody>
				{#each table.rows as row, r (r)}
					<tr class:highlighted={row.highlighted}>
						{#each row.cells as cell, c (c)}
							<td
								class:sticky={isSticky(c)}
								class:name={isSticky(c)}
								class="tone-{table.columns[c].group?.tone ?? 'plain'}"
								style="text-align: {align(cell, table.columns[c].group !== null)}"
							>
								{#if cell.kind === 'yes'}
									<span class="mark yes" aria-label="Ja">✓</span>
								{:else if cell.kind === 'no'}
									<span class="mark no" aria-label="Nei">✕</span>
								{:else if cell.kind === 'empty'}
									<span class="mark none" aria-label="Ikke oppgitt">–</span>
								{:else}
									{cell.value}
								{/if}
							</td>
						{/each}
					</tr>
				{/each}
			</tbody>

			<tfoot>
				<tr>
					{#each table.columns as column, i (column.name)}
						<td
							class:sticky={isSticky(i)}
							class="tone-{column.group?.tone ?? 'plain'}"
							style="text-align: {i === 0 ? 'left' : 'center'}"
						>
							{column.total}
						</td>
					{/each}
				</tr>
			</tfoot>
		</table>
	</div>

	<p class="muted small footnote">
		Hentet fra påmeldingsskjemaet, og oppdaterer seg selv hvert {refreshSeconds}. sekund.
		<a href={signupFormUrl} target="_blank" rel="noopener">Åpne skjemaet →</a>
	</p>
{/if}

<section class="water-section">
	<div class="section-head">
		<h2>Vannføring</h2>
		<a class="small" href={waterConfig.stationUrl} target="_blank" rel="noopener">
			NVE Sildre ↗
		</a>
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

<section class="map-section">
	<h2>Kart</h2>

	<Map />

	<ul class="places">
		{#each places as place (place.name)}
			<li class:unplaced={place.coords === null}>
				<span class="place-emoji">{place.emoji}</span>
				<span>
					<strong>{place.name}</strong>
					{#if place.note}<span class="muted small"> · {place.note}</span>{/if}
					{#if place.coords}
						<a
							class="small"
							href="https://www.google.com/maps/search/?api=1&query={place.coords[0]},{place
								.coords[1]}"
							target="_blank"
							rel="noopener">Veibeskrivelse →</a
						>
					{:else}
						<span class="muted small"> · mangler koordinat</span>
					{/if}
					{#if place.address}<span class="muted small block">{place.address}</span>{/if}
				</span>
			</li>
		{/each}
	</ul>

	{#if missing().length > 0}
		<p class="notice small">
			{missing().length} steder mangler koordinat og vises ikke på kartet. Høyreklikk stedet i
			Google Maps, kopier tallene øverst i menyen, og lim dem inn i
			<code>src/lib/places.ts</code>.
		</p>
	{/if}
</section>
