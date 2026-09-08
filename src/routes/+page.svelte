<script lang="ts">
	import { invalidate } from '$app/navigation';
	import Map from '$lib/Map.svelte';
	import WaterChart from '$lib/WaterChart.svelte';
	import { SHEET_KEY, refreshSeconds, signupFormUrl, trip } from '$lib/config';
	import { missing, places } from '$lib/places';
	import { water as waterConfig } from '$lib/config';
	import type { Cell } from '$lib/cells';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const sheet = $derived(data.sheet);
	const roster = $derived(sheet.status === 'ok' ? sheet.roster : null);

	/** Hvilken deltaker som er åpen i detaljpanelet. */
	let selected = $state<number | null>(null);

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

	/**
	 * Navn og rolle leses som tekst og hører til venstre. Avkrysningene midtstilles,
	 * så ✓-ene danner en kolonne øyet kan skanne nedover.
	 */
	function align(cell: Cell, grouped: boolean): string {
		if (!grouped) return 'left';
		return cell.kind === 'text' && cell.value.length > 14 ? 'left' : 'center';
	}
</script>

{#snippet mark(cell: Cell | null)}
	{#if cell?.kind === 'yes'}
		<span class="mark yes" aria-label="Ja">✓</span>
	{:else if cell?.kind === 'no'}
		<span class="mark no" aria-label="Nei">✕</span>
	{:else if cell?.kind === 'text'}
		{cell.value}
	{:else}
		<span class="mark none" aria-label="Ikke oppgitt">–</span>
	{/if}
{/snippet}

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
{:else if roster && roster.people.length === 0}
	<div class="card">
		<h2>Ingen svar ennå</h2>
		<p class="muted">
			Første påmelding dukker opp her automatisk.
			<a href={signupFormUrl} target="_blank" rel="noopener">Åpne påmeldingsskjemaet →</a>
		</p>
	</div>
{:else if roster}
	<div class="grid stats">
		<div class="stat">
			<div class="value">{roster.people.length}</div>
			<div class="label">Påmeldte</div>
		</div>
		<div class="stat">
			<div class="value">{roster.cars.length}</div>
			<div class="label">{roster.cars.length === 1 ? 'Bil' : 'Biler'}</div>
		</div>
		{#if roster.totalSeats !== null}
			<div class="stat">
				<div class="value">{roster.totalSeats}</div>
				<div class="label">Plasser i bilene</div>
			</div>
		{/if}
		{#if roster.borrowing !== null}
			<div class="stat">
				<div class="value">{roster.borrowing}</div>
				<div class="label">Låner utstyr</div>
			</div>
		{/if}
	</div>

	<section class="section-block">
		<h2>Biler</h2>
		{#if roster.cars.length === 0}
			<p class="empty">Ingen har meldt at de tar med bil ennå.</p>
		{:else}
			<div class="sheet-wrap">
				<table class="sheet cars-table">
					<thead>
						<tr>
							<th scope="col">Bileier</th>
							<th scope="col" class="center">Plasser</th>
							{#if roster.cars.some((c) => c.towHitch)}
								<th scope="col" class="center">Hengerfeste</th>
							{/if}
							{#if roster.cars.some((c) => c.roofRack)}
								<th scope="col" class="center">Takstativ</th>
							{/if}
						</tr>
					</thead>
					<tbody>
						{#each roster.cars as car (car.id)}
							<tr>
								<td class="name">{car.driver}</td>
								<td class="center">{car.seats ?? '–'}</td>
								{#if roster.cars.some((c) => c.towHitch)}
									<td class="center">{@render mark(car.towHitch)}</td>
								{/if}
								{#if roster.cars.some((c) => c.roofRack)}
									<td class="center">{@render mark(car.roofRack)}</td>
								{/if}
							</tr>
						{/each}
					</tbody>
					<tfoot>
						<tr>
							<td>{roster.cars.length} {roster.cars.length === 1 ? 'bil' : 'biler'}</td>
							<td class="center">{roster.totalSeats ?? '–'}</td>
							{#if roster.cars.some((c) => c.towHitch)}
								<td class="center">{roster.cars.filter((c) => c.towHitch?.kind === 'yes').length}</td>
							{/if}
							{#if roster.cars.some((c) => c.roofRack)}
								<td class="center">{roster.cars.filter((c) => c.roofRack?.kind === 'yes').length}</td>
							{/if}
						</tr>
					</tfoot>
				</table>
			</div>
		{/if}
	</section>

	<section class="section-block">
		<h2>Deltakere</h2>
		<div class="roster-split">
			<ul class="person-menu">
				{#each roster.people as person, i (person.name + i)}
					<li>
						<button
							type="button"
							class="person"
							class:selected={selected === i}
							onclick={() => (selected = selected === i ? null : i)}
							aria-expanded={selected === i}
						>
							<span class="person-name">{person.name}</span>
							<span class="person-tags">
								{#if person.professional?.kind === 'yes'}<span class="badge pro">Proff</span>{/if}
								{#if person.carId}<span class="badge car">Bil</span>{/if}
								{#if person.borrowedGear}<span class="badge gear">Låner</span>{/if}
								{#if person.absence}<span class="badge warn">Avvik</span>{/if}
							</span>
						</button>
					</li>
				{/each}
			</ul>

			<div class="person-detail">
				{#if selected === null}
					<p class="muted">Velg en deltaker for å se detaljer.</p>
				{:else}
					{@const person = roster.people[selected]}
					<h3>{person.name}</h3>
					<dl class="facts">
						{#if roster.mapping.departure}
							<dt>Drar</dt>
							<dd>{person.departure ?? '–'}</dd>
						{/if}
						{#if roster.mapping.licence}
							<dt>Lappen</dt>
							<dd>{@render mark(person.licence)}</dd>
						{/if}
						{#if roster.mapping.professional}
							<dt>Proff</dt>
							<dd>{@render mark(person.professional)}</dd>
						{/if}
						<dt>Bil</dt>
						<dd>
							{#if person.carId}
								Stiller med bil{roster.cars[person.carId - 1]?.seats
									? ` · ${roster.cars[person.carId - 1].seats} plasser`
									: ''}
							{:else}
								<span class="mark none">–</span>
							{/if}
						</dd>
						{#if roster.mapping.borrowedGear}
							<dt>Låner utstyr</dt>
							<dd>{person.borrowedGear ?? '–'}</dd>
						{/if}
						{#if roster.mapping.absence}
							<dt>Kan ikke møte til planlagt tid</dt>
							<dd>{person.absence ?? '–'}</dd>
						{/if}
						{#each person.extras as extra (extra.label)}
							<dt>{extra.label}</dt>
							<dd>{extra.value}</dd>
						{/each}
					</dl>
				{/if}
			</div>
		</div>
	</section>

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
