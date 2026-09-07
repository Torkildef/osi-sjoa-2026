<script lang="ts">
	import { trip } from '$lib/config';
	import { formatDateTime, formatTimestamp } from '$lib/format';
	import { subscribeToTripData, type RealtimeState } from '$lib/realtime';
	import { statusLabel, type Participant } from '$lib/types';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let live = $state<RealtimeState>('connecting');
	$effect(() => subscribeToTripData((state) => (live = state)));

	const d = $derived(data.trip);
	const byId = $derived(new Map(d.participants.map((p) => [p.id, p])));
	const active = $derived(d.participants.filter((p) => p.status !== 'cancelled'));
	const confirmed = $derived(d.participants.filter((p) => p.status === 'confirmed'));
	const waitlist = $derived(d.participants.filter((p) => p.status === 'waitlist'));
	const paidCount = $derived(confirmed.filter((p) => p.paid).length);
	const seatsAvailable = $derived(d.transport.reduce((sum, t) => sum + t.seats_available, 0));

	const name = (id: string) => byId.get(id)?.name ?? 'Ukjent';

	const passengersFor = (transportId: string) =>
		d.transportPassengers.filter((tp) => tp.transport_id === transportId).map((tp) => tp.participant_id);

	const residentsFor = (accommodationId: string) =>
		d.accommodationAssignments
			.filter((a) => a.accommodation_id === accommodationId)
			.map((a) => a.participant_id);

	const assignedIds = $derived(new Set(d.accommodationAssignments.map((a) => a.participant_id)));
	const seatedIds = $derived(new Set(d.transportPassengers.map((tp) => tp.participant_id)));
	const driverIds = $derived(new Set(d.transport.map((t) => t.driver_participant_id)));

	const withoutBed = $derived(active.filter((p) => !assignedIds.has(p.id)));
	const withoutSeat = $derived(
		active.filter((p) => !seatedIds.has(p.id) && !driverIds.has(p.id))
	);

	const liveText: Record<RealtimeState, string> = {
		connecting: 'Kobler til …',
		live: 'Oppdateres automatisk',
		offline: 'Frakoblet – last siden på nytt'
	};

	function sortByName(list: Participant[]) {
		return [...list].sort((a, b) => a.name.localeCompare(b.name, 'nb'));
	}
</script>

<svelte:head>
	<title>{trip.title} – {trip.organiser}</title>
</svelte:head>

<div class="section-head">
	<div>
		<h1>{trip.title}</h1>
		<p class="lede">{trip.dates} · {trip.location}</p>
	</div>
	<span class="live" class:live-on={live === 'live'} class:live-off={live === 'offline'}>
		<span class="dot"></span>{liveText[live]}
	</span>
</div>

{#if data.loadFailed}
	<p class="notice error">
		Får ikke kontakt med databasen akkurat nå, så listene under kan være tomme. Prøv å laste
		siden på nytt om litt.
	</p>
{/if}

<div class="grid" style="margin-bottom: 1.25rem">
	<div class="stat">
		<div class="value">{confirmed.length}</div>
		<div class="label">Påmeldte</div>
	</div>
	<div class="stat">
		<div class="value">{waitlist.length}</div>
		<div class="label">På venteliste</div>
	</div>
	<div class="stat">
		<div class="value">{paidCount} / {confirmed.length}</div>
		<div class="label">Har betalt</div>
	</div>
	<div class="stat">
		<div class="value">{seatsAvailable}</div>
		<div class="label">Ledige bilplasser</div>
	</div>
</div>

<section class="card">
	<h2>Nøkkelinfo</h2>
	<dl class="facts">
		<dt>Når</dt>
		<dd>{trip.dates}</dd>
		<dt>Hvor</dt>
		<dd>{trip.location}</dd>
		<dt>Pris</dt>
		<dd>{trip.price} <span class="muted small">– {trip.priceIncludes}</span></dd>
		<dt>Betaling</dt>
		<dd>{trip.paymentInfo}</dd>
		<dt>Kontakt</dt>
		<dd><a href="mailto:{trip.contact}">{trip.contact}</a></dd>
	</dl>
	<p style="margin: 1rem 0 0"><a href="/pamelding">Meld deg på eller av →</a></p>
</section>

<section class="card">
	<h2>Kunngjøringer</h2>
	{#if d.announcements.length === 0}
		<p class="empty">Ingenting fra arrangørene ennå.</p>
	{:else}
		{#each d.announcements as a (a.id)}
			<article style="padding-bottom: 0.75rem">
				<p style="margin: 0 0 0.15rem">{a.message}</p>
				<p class="muted small" style="margin: 0">
					{formatTimestamp(a.created_at)}{a.created_by ? ` · ${a.created_by}` : ''}
				</p>
			</article>
		{/each}
	{/if}
</section>

<section class="card">
	<h2>Deltakere</h2>
	{#if active.length === 0}
		<p class="empty">Ingen påmeldte ennå.</p>
	{:else}
		<div class="table-scroll">
			<table>
				<thead>
					<tr>
						<th>Navn</th>
						<th>Status</th>
						<th>Betalt</th>
					</tr>
				</thead>
				<tbody>
					{#each sortByName(active) as p (p.id)}
						<tr>
							<td>{p.name}</td>
							<td><span class="badge {p.status}">{statusLabel[p.status]}</span></td>
							<td>
								{#if p.paid}<span class="badge paid">Betalt</span>{:else}<span class="muted">–</span>{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</section>

<section class="card">
	<h2>Samkjøring</h2>
	{#if d.transport.length === 0}
		<p class="empty">Ingen biler registrert ennå.</p>
	{:else}
		{#each d.transport as t (t.id)}
			{@const passengers = passengersFor(t.id)}
			<article style="padding-bottom: 1rem">
				<h3>{name(t.driver_participant_id)} kjører</h3>
				<p class="muted small" style="margin: 0 0 0.35rem">
					Fra {t.departure_location} · {formatDateTime(t.departure_time)} ·
					{t.seats_available} av {t.seats_total}
					{t.seats_total === 1 ? 'plass' : 'plasser'} ledig
				</p>
				{#if passengers.length === 0}
					<p class="small muted" style="margin: 0">Ingen passasjerer ennå.</p>
				{:else}
					<p class="small" style="margin: 0">
						Passasjerer: {passengers.map(name).join(', ')}
					</p>
				{/if}
			</article>
		{/each}
	{/if}
	{#if withoutSeat.length > 0}
		<p class="small muted" style="margin: 0">
			Uten bilplass: {sortByName(withoutSeat).map((p) => p.name).join(', ')}
		</p>
	{/if}
</section>

<section class="card">
	<h2>Overnatting</h2>
	{#if d.accommodation.length === 0}
		<p class="empty">Ingen overnatting registrert ennå.</p>
	{:else}
		{#each d.accommodation as a (a.id)}
			{@const residents = residentsFor(a.id)}
			<article style="padding-bottom: 1rem">
				<h3>{a.name}</h3>
				<p class="muted small" style="margin: 0 0 0.35rem">
					{residents.length} av {a.capacity} plasser i bruk
				</p>
				{#if residents.length === 0}
					<p class="small muted" style="margin: 0">Ingen tildelt ennå.</p>
				{:else}
					<p class="small" style="margin: 0">{sortByName(residents.map((id) => byId.get(id)!).filter(Boolean)).map((p) => p.name).join(', ')}</p>
				{/if}
			</article>
		{/each}
	{/if}
	{#if withoutBed.length > 0}
		<p class="small muted" style="margin: 0">
			Uten tildelt overnatting: {sortByName(withoutBed).map((p) => p.name).join(', ')}
		</p>
	{/if}
</section>
