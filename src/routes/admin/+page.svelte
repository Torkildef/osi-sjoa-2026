<script lang="ts">
	import { enhance } from '$app/forms';
	import { trip } from '$lib/config';
	import { formatTimestamp, isoToLocalInput } from '$lib/format';
	import { subscribeToTripData, type RealtimeState } from '$lib/realtime';
	import { statusLabel, type Participant } from '$lib/types';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let live = $state<RealtimeState>('connecting');
	$effect(() => {
		if (!data.loggedIn) return;
		return subscribeToTripData((state) => (live = state));
	});

	const d = $derived(data.loggedIn ? data.trip : undefined);
	const byId = $derived(new Map((d?.participants ?? []).map((p) => [p.id, p])));
	const active = $derived(
		[...(d?.participants ?? [])]
			.filter((p) => p.status !== 'cancelled')
			.sort((a, b) => a.name.localeCompare(b.name, 'nb'))
	);
	const all = $derived(
		[...(d?.participants ?? [])].sort((a, b) => a.name.localeCompare(b.name, 'nb'))
	);

	const driverIds = $derived(new Set((d?.transport ?? []).map((t) => t.driver_participant_id)));
	const seatedIds = $derived(new Set((d?.transportPassengers ?? []).map((p) => p.participant_id)));
	const housedIds = $derived(
		new Set((d?.accommodationAssignments ?? []).map((a) => a.participant_id))
	);

	const name = (id: string) => byId.get(id)?.name ?? 'Ukjent';

	const passengersFor = (transportId: string) =>
		(d?.transportPassengers ?? [])
			.filter((tp) => tp.transport_id === transportId)
			.map((tp) => tp.participant_id);

	const residentsFor = (accommodationId: string) =>
		(d?.accommodationAssignments ?? [])
			.filter((a) => a.accommodation_id === accommodationId)
			.map((a) => a.participant_id);

	/** Deltakere som ennå ikke er plassert – kandidatene i nedtrekkslistene. */
	const unseated = $derived(active.filter((p) => !seatedIds.has(p.id) && !driverIds.has(p.id)));
	const unhoused = $derived(active.filter((p) => !housedIds.has(p.id)));
	const nonDrivers = $derived(active.filter((p) => !driverIds.has(p.id)));

	/** Sletting er ikke reversibel, og å slette en hytte fjerner tildelingene i den. */
	function confirmDelete(question: string) {
		return (event: SubmitEvent) => {
			if (!confirm(question)) event.preventDefault();
		};
	}

	const preference = (p: Participant) =>
		p.accommodation_preference ? ` (ønsker: ${p.accommodation_preference})` : '';
</script>

<svelte:head>
	<title>Admin – {trip.title}</title>
</svelte:head>

{#if !data.loggedIn}
	<h1>Administrasjon</h1>
	<p class="lede">Skriv inn det delte arrangørpassordet.</p>
	<section class="card" style="max-width: 24rem">
		{#if form && 'loginError' in form && form.loginError}
			<p class="notice error">{form.loginError}</p>
		{/if}
		<form method="POST" action="?/login" use:enhance>
			<label>
				<span>Passord</span>
				<!-- svelte-ignore a11y_autofocus -->
				<input type="password" name="password" required autocomplete="current-password" autofocus />
			</label>
			<button type="submit">Logg inn</button>
		</form>
	</section>
{:else if d}
	<div class="section-head">
		<div>
			<h1>Administrasjon</h1>
			<p class="lede">Endringer vises umiddelbart på oversiktssiden.</p>
		</div>
		<div style="display: flex; gap: 1rem; align-items: center">
			<span class="live" class:live-on={live === 'live'} class:live-off={live === 'offline'}>
				<span class="dot"></span>
				{live === 'live' ? 'Tilkoblet' : live === 'offline' ? 'Frakoblet' : 'Kobler til …'}
			</span>
			<form method="POST" action="?/logout">
				<button type="submit" class="secondary small">Logg ut</button>
			</form>
		</div>
	</div>

	{#if form && 'error' in form && form.error}
		<p class="notice error">{form.error}</p>
	{/if}

	<section class="card">
		<h2>Kunngjøringer</h2>
		<form method="POST" action="?/addAnnouncement" use:enhance>
			<label>
				<span>Ny kunngjøring</span>
				<textarea name="message" required placeholder="Husk å ta med tørrdrakt …"></textarea>
			</label>
			<div class="row">
				<label>
					<span>Fra <span class="muted small">(valgfritt)</span></span>
					<input type="text" name="created_by" placeholder="Turkomiteen" />
				</label>
				<button type="submit">Legg ut</button>
			</div>
		</form>

		{#if d.announcements.length > 0}
			<hr style="border: none; border-top: 1px solid var(--border); margin: 1.1rem 0" />
			{#each d.announcements as a (a.id)}
				<div style="display: flex; gap: 1rem; align-items: flex-start; padding-bottom: 0.75rem">
					<div style="flex: 1">
						<p style="margin: 0 0 0.15rem">{a.message}</p>
						<p class="muted small" style="margin: 0">
							{formatTimestamp(a.created_at)}{a.created_by ? ` · ${a.created_by}` : ''}
						</p>
					</div>
					<form
						method="POST"
						action="?/deleteAnnouncement"
						use:enhance
						onsubmit={confirmDelete('Slette denne kunngjøringen?')}
					>
						<input type="hidden" name="announcement_id" value={a.id} />
						<button type="submit" class="secondary small">Slett</button>
					</form>
				</div>
			{/each}
		{/if}
	</section>

	<section class="card">
		<h2>Deltakere ({active.length} aktive)</h2>
		{#if all.length === 0}
			<p class="empty">Ingen påmeldte ennå.</p>
		{:else}
			<div class="table-scroll">
				<table>
					<thead>
						<tr>
							<th>Navn</th>
							<th>Kontakt</th>
							<th>Status</th>
							<th>Betalt</th>
						</tr>
					</thead>
					<tbody>
						{#each all as p (p.id)}
							<tr>
								<td>
									{p.name}
									{#if p.notes}<div class="muted small">{p.notes}</div>{/if}
								</td>
								<td class="small">
									<a href="mailto:{p.email}">{p.email}</a>
									{#if p.phone}<div class="muted">{p.phone}</div>{/if}
								</td>
								<td>
									<form method="POST" action="?/setStatus" use:enhance>
										<input type="hidden" name="participant_id" value={p.id} />
										<select name="status" onchange={(e) => e.currentTarget.form?.requestSubmit()}>
											{#each ['confirmed', 'waitlist', 'cancelled'] as const as s (s)}
												<option value={s} selected={p.status === s}>{statusLabel[s]}</option>
											{/each}
										</select>
									</form>
								</td>
								<td>
									<form method="POST" action="?/togglePaid" use:enhance>
										<input type="hidden" name="participant_id" value={p.id} />
										<input type="hidden" name="paid" value={String(!p.paid)} />
										<button type="submit" class="secondary small">
											{p.paid ? 'Betalt ✓' : 'Marker betalt'}
										</button>
									</form>
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
		{#each d.transport as t (t.id)}
			{@const passengers = passengersFor(t.id)}
			<div style="border-bottom: 1px solid var(--border); padding-bottom: 1rem; margin-bottom: 1rem">
				<div class="section-head">
					<h3>{name(t.driver_participant_id)} kjører</h3>
					<form
						method="POST"
						action="?/deleteTransport"
						use:enhance
						onsubmit={confirmDelete(`Slette bilen til ${name(t.driver_participant_id)}? Passasjerene mister plassen sin.`)}
					>
						<input type="hidden" name="transport_id" value={t.id} />
						<button type="submit" class="secondary small">Slett bil</button>
					</form>
				</div>

				<form method="POST" action="?/saveTransport" use:enhance class="row">
					<input type="hidden" name="transport_id" value={t.id} />
					<label>
						<span>Kjører fra</span>
						<input type="text" name="departure_location" value={t.departure_location} />
					</label>
					<label>
						<span>Avreise</span>
						<input
							type="datetime-local"
							name="departure_time"
							value={isoToLocalInput(t.departure_time)}
						/>
					</label>
					<label>
						<span>Plasser totalt</span>
						<input type="number" name="seats_total" min="0" value={t.seats_total} />
					</label>
					<button type="submit" class="secondary">Lagre</button>
				</form>

				<p class="small muted" style="margin: 0.6rem 0 0.3rem">
					{t.seats_available} av {t.seats_total} ledig
				</p>

				{#each passengers as pid (pid)}
					<form
						method="POST"
						action="?/removePassenger"
						use:enhance
						style="display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.3rem"
					>
						<input type="hidden" name="participant_id" value={pid} />
						<span class="small" style="flex: 1">{name(pid)}</span>
						<button type="submit" class="secondary small">Fjern</button>
					</form>
				{/each}

				{#if unseated.length > 0}
					<form method="POST" action="?/addPassenger" use:enhance class="row" style="margin-top: 0.5rem">
						<input type="hidden" name="transport_id" value={t.id} />
						<label>
							<span>Legg til passasjer</span>
							<select name="participant_id">
								{#each unseated as p (p.id)}
									<option value={p.id}>{p.name}</option>
								{/each}
							</select>
						</label>
						<button type="submit" class="secondary">Legg til</button>
					</form>
				{/if}
			</div>
		{/each}

		<h3>Ny bil</h3>
		{#if nonDrivers.length === 0}
			<p class="empty">Alle aktive deltakere er allerede registrert som sjåfører.</p>
		{:else}
			<form method="POST" action="?/addTransport" use:enhance class="row">
				<label>
					<span>Sjåfør</span>
					<select name="driver_participant_id">
						{#each nonDrivers as p (p.id)}
							<option value={p.id}>{p.name}</option>
						{/each}
					</select>
				</label>
				<label>
					<span>Kjører fra</span>
					<input type="text" name="departure_location" placeholder="Blindern" />
				</label>
				<label>
					<span>Plasser</span>
					<input type="number" name="seats_total" min="0" value="3" />
				</label>
				<button type="submit">Legg til</button>
			</form>
		{/if}
	</section>

	<section class="card">
		<h2>Overnatting</h2>
		{#each d.accommodation as a (a.id)}
			{@const residents = residentsFor(a.id)}
			<div style="border-bottom: 1px solid var(--border); padding-bottom: 1rem; margin-bottom: 1rem">
				<form method="POST" action="?/saveAccommodation" use:enhance class="row">
					<input type="hidden" name="accommodation_id" value={a.id} />
					<label>
						<span>Navn</span>
						<input type="text" name="name" value={a.name} />
					</label>
					<label>
						<span>Kapasitet</span>
						<input type="number" name="capacity" min="0" value={a.capacity} />
					</label>
					<button type="submit" class="secondary">Lagre</button>
					<button
						type="submit"
						class="secondary"
						formaction="?/deleteAccommodation"
						onclick={(event) => {
							if (!confirm(`Slette ${a.name}? Alle som er tildelt plass der mister den.`))
								event.preventDefault();
						}}
					>
						Slett
					</button>
				</form>

				<p class="small muted" style="margin: 0.6rem 0 0.3rem">
					{residents.length} av {a.capacity} plasser i bruk
				</p>

				{#each residents as pid (pid)}
					<form
						method="POST"
						action="?/removeResident"
						use:enhance
						style="display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.3rem"
					>
						<input type="hidden" name="participant_id" value={pid} />
						<span class="small" style="flex: 1">{name(pid)}</span>
						<button type="submit" class="secondary small">Fjern</button>
					</form>
				{/each}

				{#if unhoused.length > 0}
					<form method="POST" action="?/addResident" use:enhance class="row" style="margin-top: 0.5rem">
						<input type="hidden" name="accommodation_id" value={a.id} />
						<label>
							<span>Tildel plass</span>
							<select name="participant_id">
								{#each unhoused as p (p.id)}
									<option value={p.id}>{p.name}{preference(p)}</option>
								{/each}
							</select>
						</label>
						<button type="submit" class="secondary">Tildel</button>
					</form>
				{/if}
			</div>
		{/each}

		<h3>Ny overnatting</h3>
		<form method="POST" action="?/saveAccommodation" use:enhance class="row">
			<label>
				<span>Navn</span>
				<input type="text" name="name" placeholder="Hytte D" />
			</label>
			<label>
				<span>Kapasitet</span>
				<input type="number" name="capacity" min="0" value="8" />
			</label>
			<button type="submit">Legg til</button>
		</form>

		{#if unhoused.length > 0}
			<p class="small muted" style="margin: 1rem 0 0">
				Uten tildelt plass: {unhoused.map((p) => p.name).join(', ')}
			</p>
		{/if}
	</section>
{/if}
