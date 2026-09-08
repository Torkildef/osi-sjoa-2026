<script lang="ts">
	import { invalidate } from '$app/navigation';
	import Icon from '$lib/Icon.svelte';
	import { SHEET_KEY, refreshSeconds, signupFormUrl, trip } from '$lib/config';
	import type { Cell } from '$lib/cells';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const sheet = $derived(data.sheet);
	const roster = $derived(sheet.status === 'ok' ? sheet.roster : null);

	/** Hvilken deltaker som er åpnet i lista. */
	let selected = $state<number | null>(null);

	$effect(() => {
		const timer = setInterval(() => invalidate(SHEET_KEY), refreshSeconds * 1000);
		return () => clearInterval(timer);
	});

	/**
	 * Hvem drar når. Svaret er fritekst, så vi grupperer på teksten slik den står.
	 * Blir det for mange ulike svar til å være nyttig, vises det ikke.
	 */
	const departures = $derived.by(() => {
		if (!roster?.mapping.departure) return [];
		const counts = new Map<string, number>();
		for (const p of roster.people) {
			const key = (p.departure ?? 'Ikke oppgitt').trim();
			counts.set(key, (counts.get(key) ?? 0) + 1);
		}
		const list = [...counts].map(([label, count]) => ({ label, count }));
		return list.length <= 6 ? list.sort((a, b) => b.count - a.count) : [];
	});

	const initials = (name: string) =>
		name
			.split(/\s+/)
			.filter(Boolean)
			.slice(0, 2)
			.map((w) => w[0]?.toUpperCase() ?? '')
			.join('');

	const showTow = $derived(roster?.cars.some((c) => c.towHitch) ?? false);
	const showRack = $derived(roster?.cars.some((c) => c.roofRack) ?? false);
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

<div class="page-head">
	<div>
		<h1 class="headline-large">Logistikk</h1>
		<p class="lede">Hvem som kommer, hvilke biler vi har, og hvem som trenger utstyr.</p>
	</div>
	<a class="btn btn-tonal btn-small" href={signupFormUrl} target="_blank" rel="noopener">
		Åpne skjemaet
		<Icon name="openInNew" size={16} class="trailing" />
	</a>
</div>

{#if sheet.status === 'unconfigured'}
	<div class="empty">
		<Icon name="groups" size={36} />
		<div class="title-medium">Regnearket er ikke koblet til ennå</div>
		<p class="body-medium">
			Sett miljøvariabelen <code>GOOGLE_SHEET_CSV_URL</code> til CSV-lenken fra
			<strong>Fil → Del → Publiser på nettet</strong> i regnearket skjemaet skriver til.
		</p>
	</div>
{:else if sheet.status === 'error'}
	<p class="notice error">
		<Icon name="error" size={20} />
		{sheet.message}
	</p>
{:else if roster && roster.people.length === 0}
	<div class="empty">
		<Icon name="celebration" size={36} />
		<div class="title-medium">Ingen påmeldte ennå</div>
		<p class="body-medium">Første påmelding dukker opp her av seg selv.</p>
		<a class="btn btn-filled" href={signupFormUrl} target="_blank" rel="noopener">
			Vær førstemann
			<Icon name="openInNew" size={18} class="trailing" />
		</a>
	</div>
{:else if roster}
	<div class="stats">
		<div class="stat accent">
			<div class="value">{roster.people.length}</div>
			<div class="label"><Icon name="groups" size={16} /> Påmeldte</div>
		</div>
		<div class="stat">
			<div class="value">{roster.cars.length}</div>
			<div class="label"><Icon name="directionsCar" size={16} /> {roster.cars.length === 1 ? 'Bil' : 'Biler'}</div>
		</div>
		{#if roster.totalSeats !== null}
			<div class="stat">
				<div class="value">{roster.totalSeats}</div>
				<div class="label"><Icon name="person" size={16} /> Plasser</div>
			</div>
		{/if}
		{#if roster.borrowing !== null}
			<div class="stat">
				<div class="value">{roster.borrowing}</div>
				<div class="label"><Icon name="kayaking" size={16} /> Låner utstyr</div>
			</div>
		{/if}
		{#if roster.professionals !== null}
			<div class="stat">
				<div class="value">{roster.professionals}</div>
				<div class="label"><Icon name="checkCircle" size={16} /> Proffer</div>
			</div>
		{/if}
	</div>

	{#if roster.totalSeats !== null && roster.totalSeats < roster.people.length}
		<p class="notice warning" style="margin-top: 0.85rem">
			<Icon name="warning" size={20} />
			<span>
				{roster.people.length - roster.totalSeats}
				{roster.people.length - roster.totalSeats === 1 ? 'person' : 'personer'} mangler plass i bil.
			</span>
		</p>
	{/if}

	{#if departures.length > 0}
		<section class="block">
			<div class="section-head">
				<h2 class="title-large"><Icon name="schedule" size={22} class="primary-text" /> Hvem drar når</h2>
			</div>
			<div class="chip-row">
				{#each departures as d (d.label)}
					<span class="chip tonal">{d.label} <strong>· {d.count}</strong></span>
				{/each}
			</div>
		</section>
	{/if}

	<section class="block">
		<div class="section-head">
			<h2 class="title-large"><Icon name="directionsCar" size={22} class="primary-text" /> Biler</h2>
		</div>
		{#if roster.cars.length === 0}
			<div class="empty">
				<Icon name="directionsCar" size={32} />
				<p class="body-medium">Ingen har meldt at de tar med bil ennå.</p>
			</div>
		{:else}
			<div class="table-wrap">
				<table class="data">
					<thead>
						<tr>
							<th scope="col">Bileier</th>
							<th scope="col" class="center">Plasser</th>
							{#if roster.mapping.departure || roster.mapping.carDeparture}
								<th scope="col">Drar</th>
							{/if}
							{#if showTow}<th scope="col" class="center">Hengerfeste</th>{/if}
							{#if showRack}<th scope="col" class="center">Takstativ</th>{/if}
						</tr>
					</thead>
					<tbody>
						{#each roster.cars as car (car.id)}
							<tr>
								<td class="name">{car.driver}</td>
								<td class="center">{car.seats ?? '–'}</td>
								{#if roster.mapping.departure || roster.mapping.carDeparture}
									<td>{car.departure ?? '–'}</td>
								{/if}
								{#if showTow}<td class="center">{@render mark(car.towHitch)}</td>{/if}
								{#if showRack}<td class="center">{@render mark(car.roofRack)}</td>{/if}
							</tr>
						{/each}
					</tbody>
					<tfoot>
						<tr>
							<td>{roster.cars.length} {roster.cars.length === 1 ? 'bil' : 'biler'}</td>
							<td class="center">{roster.totalSeats ?? '–'}</td>
							{#if roster.mapping.departure || roster.mapping.carDeparture}<td></td>{/if}
							{#if showTow}
								<td class="center">{roster.cars.filter((c) => c.towHitch?.kind === 'yes').length}</td>
							{/if}
							{#if showRack}
								<td class="center">{roster.cars.filter((c) => c.roofRack?.kind === 'yes').length}</td>
							{/if}
						</tr>
					</tfoot>
				</table>
			</div>
		{/if}
	</section>

	<section class="block">
		<div class="section-head">
			<h2 class="title-large"><Icon name="groups" size={22} class="primary-text" /> Deltakere</h2>
			<span class="body-small on-surface-variant">Trykk på et navn for detaljer</span>
		</div>
		<ul class="list">
			{#each roster.people as person, i (person.name + i)}
				<li>
					<button
						type="button"
						class="list-item"
						class:selected={selected === i}
						onclick={() => (selected = selected === i ? null : i)}
						aria-expanded={selected === i}
					>
						<span class="leading avatar">{initials(person.name)}</span>
						<span class="content">
							<span class="headline">{person.name}</span>
							{#if person.departure}
								<span class="supporting">Drar {person.departure}</span>
							{/if}
						</span>
						<span class="trailing">
							{#if person.professional?.kind === 'yes'}<span class="tag primary">Proff</span>{/if}
							{#if person.carId}<span class="tag tertiary">Bil</span>{/if}
							{#if person.borrowedGear}<span class="tag success">Låner</span>{/if}
							{#if person.absence}<span class="tag warning">Avvik</span>{/if}
							<Icon name="keyboardArrowDown" size={22} class="chevron" />
						</span>
					</button>
					{#if selected === i}
						<div class="person-details">
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
						</div>
					{/if}
				</li>
			{/each}
		</ul>
	</section>

	<p class="footnote">
		Hentet fra påmeldingsskjemaet. Siden oppdaterer seg selv hvert {refreshSeconds}. sekund.
	</p>
{/if}
