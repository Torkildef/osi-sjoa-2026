<script lang="ts">
	import { enhance } from '$app/forms';
	import { trip } from '$lib/config';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const values = $derived(form && 'values' in form ? form.values : undefined);
	let canDrive = $state(false);
	$effect(() => {
		if (values) canDrive = values.can_drive;
	});

	let submitting = $state(false);
	const trackSubmit = () => {
		submitting = true;
		return async ({ update }: { update: () => Promise<void> }) => {
			await update();
			submitting = false;
		};
	};
</script>

<svelte:head>
	<title>Påmelding – {trip.title}</title>
</svelte:head>

<h1>Påmelding</h1>
<p class="lede">{trip.dates} · {trip.location} · {trip.price}</p>

{#if form?.success === 'signup'}
	<p class="notice success">
		Takk, {form.name}! Du er påmeldt. Du finner deg selv i <a href="/">oversikten</a>.
	</p>
{/if}
{#if form?.success === 'withdraw'}
	<p class="notice success">{form.name} er meldt av. Si fra til arrangørene om noe skal endres.</p>
{/if}

<section class="card">
	<h2>Meld deg på</h2>
	{#if form && 'error' in form && form.error}
		<p class="notice error">{form.error}</p>
	{/if}

	<form method="POST" action="?/signup" use:enhance={trackSubmit}>
		<label>
			<span>Navn</span>
			<input type="text" name="name" required autocomplete="name" value={values?.name ?? ''} />
		</label>

		<label>
			<span>E-post</span>
			<input type="email" name="email" required autocomplete="email" value={values?.email ?? ''} />
		</label>

		<label>
			<span>Telefon <span class="muted small">(valgfritt)</span></span>
			<input type="tel" name="phone" autocomplete="tel" value={values?.phone ?? ''} />
		</label>

		<label>
			<span>Ønsket overnatting</span>
			<select name="accommodation_preference">
				<option value="">Spiller ingen rolle</option>
				{#each data.accommodationOptions as option (option)}
					<option value={option} selected={values?.accommodation_preference === option}>
						{option}
					</option>
				{/each}
				<option value="Ordner selv" selected={values?.accommodation_preference === 'Ordner selv'}>
					Ordner selv
				</option>
			</select>
		</label>

		<label class="inline" style="margin-bottom: 0.75rem">
			<input type="checkbox" name="can_drive" bind:checked={canDrive} />
			<span>Jeg kan kjøre og ta med andre</span>
		</label>

		{#if canDrive}
			<div class="row" style="margin-bottom: 0.85rem">
				<label>
					<span>Kjører fra</span>
					<input
						type="text"
						name="departure_location"
						placeholder="Blindern"
						value={values?.departure_location ?? ''}
					/>
				</label>
				<label>
					<span>Avreise</span>
					<input type="datetime-local" name="departure_time" value={values?.departure_time ?? ''} />
				</label>
				<label>
					<span>Ledige plasser</span>
					<input
						type="number"
						name="seats_total"
						min="0"
						max="8"
						value={values?.seats_total ?? '3'}
					/>
				</label>
			</div>
		{/if}

		<label>
			<span>Kommentar til arrangørene <span class="muted small">(valgfritt)</span></span>
			<textarea name="notes" placeholder="Utstyr du trenger å låne, når du kan reise, o.l.">{values?.notes ?? ''}</textarea>
		</label>

		<button type="submit" disabled={submitting}>
			{submitting ? 'Sender …' : 'Meld meg på'}
		</button>
	</form>
</section>

<section class="card">
	<h2>Meld deg av</h2>
	{#if form && 'withdrawError' in form && form.withdrawError}
		<p class="notice error">{form.withdrawError}</p>
	{/if}
	<p class="small muted">
		Skriv inn e-postadressen du meldte deg på med. Plassen din i bil og hytte blir frigjort.
	</p>
	<form method="POST" action="?/withdraw" use:enhance={trackSubmit} class="row">
		<label>
			<span>E-post</span>
			<input type="email" name="withdraw_email" required />
		</label>
		<button type="submit" class="secondary" disabled={submitting}>Meld meg av</button>
	</form>
</section>
