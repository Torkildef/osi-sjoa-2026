<script lang="ts">
	import { SHEET_KEY, refreshSeconds, signupFormUrl, trip } from '$lib/config';
	import type { Cell } from '$lib/cells';
	import { invalidate } from '$app/navigation';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const sheet = $derived(data.sheet);
	const roster = $derived(sheet.status === 'ok' ? sheet.roster : null);

	/** Hvilken deltaker som er åpen i detaljpanelet. */
	let selected = $state<number | null>(null);

	$effect(() => {
		const timer = setInterval(() => invalidate(SHEET_KEY), refreshSeconds * 1000);
		return () => clearInterval(timer);
	});
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
	<title>Logistikk – {trip.title}</title>
</svelte:head>

<h1>Logistikk</h1>
<p class="lede">Hvem som kommer, og hvilke biler vi har.</p>

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
