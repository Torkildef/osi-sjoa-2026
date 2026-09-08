<script lang="ts">
	import Icon from '$lib/Icon.svelte';
	import WaterNow from '$lib/WaterNow.svelte';
	import { daysUntilTrip, signupFormUrl, trip, tripIsOn } from '$lib/config';
	import { photos } from '$lib/photos';
	import { pages } from '$lib/nav';
	import { schedule } from '$lib/schedule';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const roster = $derived(data.sheet.status === 'ok' ? data.sheet.roster : null);
	const next = schedule[0];

	const days = daysUntilTrip();
	const countdown = tripIsOn()
		? 'Vi er på elva! 🎉'
		: days > 1
			? `Om ${days} dager`
			: days === 1
				? 'I morgen!'
				: days === 0
					? 'I dag!'
					: null;

	let heroFailed = $state(false);
</script>

<svelte:head>
	<title>{trip.title} – {trip.organiser}</title>
</svelte:head>

<section class="hero">
	{#if !heroFailed}
		<img src={photos.kruke.src} alt={photos.kruke.alt} onerror={() => (heroFailed = true)} />
	{/if}
	{#if countdown}
		<span class="countdown">{countdown}</span>
	{/if}
	<div class="hero-body">
		<div>
			<div class="overline" style="color: rgb(255 255 255 / 0.8)">{trip.organiser}</div>
			<h1 class="display-large">{trip.title}</h1>
		</div>
		<div class="hero-sub">
			<span><Icon name="event" size={18} /> {trip.dates}</span>
			<span><Icon name="house" size={18} /> {trip.base}, {trip.location}</span>
		</div>
		<div class="hero-actions">
			<a class="btn btn-filled" href={signupFormUrl} target="_blank" rel="noopener">
				Meld deg på
				<Icon name="openInNew" size={18} class="trailing" />
			</a>
			<a class="btn btn-tonal" href="/plan">
				<Icon name="calendarMonth" size={18} />
				Se planen
			</a>
		</div>
	</div>
</section>

{#if roster && roster.people.length > 0}
	<section class="block">
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
					<div class="label"><Icon name="person" size={16} /> Plasser i bilene</div>
				</div>
			{/if}
			{#if roster.borrowing !== null}
				<div class="stat">
					<div class="value">{roster.borrowing}</div>
					<div class="label"><Icon name="kayaking" size={16} /> Låner utstyr</div>
				</div>
			{/if}
		</div>
	</section>
{/if}

<section class="block grid wide">
	{#if data.water.status === 'ok'}
		<a class="card elevated" href="/elven">
			<div class="card-head">
				<h2 class="title-medium"><Icon name="waves" size={20} /> Vannføring nå</h2>
				<Icon name="arrowForward" size={20} class="on-surface-variant" />
			</div>
			<WaterNow readings={data.water.readings} unit={data.water.unit} compact />
		</a>
	{/if}

	{#if next}
		<a class="card elevated" href="/plan">
			<div class="card-head">
				<h2 class="title-medium"><Icon name="schedule" size={20} /> Først på planen</h2>
				<Icon name="arrowForward" size={20} class="on-surface-variant" />
			</div>
			<div class="headline-small">{next.title}</div>
			<div class="body-medium on-surface-variant" style="margin-top: 0.2rem">
				{next.day}{next.time ? ` kl. ${next.time}` : ''}{next.note ? ` · ${next.note}` : ''}
			</div>
		</a>
	{/if}
</section>

<section class="block">
	<div class="section-head">
		<h2 class="title-large">Utforsk</h2>
	</div>
	<div class="grid">
		{#each pages.filter((p) => p.href !== '/') as item (item.href)}
			<a class="card" href={item.href}>
				<div class="card-head">
					<h3 class="title-medium"><Icon name={item.icon} size={22} class="primary-text" /> {item.label}</h3>
				</div>
				<p class="body-medium on-surface-variant">{item.blurb}</p>
			</a>
		{/each}
	</div>
</section>

<section class="block">
	<div class="card filled" style="display: flex; flex-wrap: wrap; gap: 0.75rem 1.5rem; align-items: center; justify-content: space-between">
		<div>
			<div class="title-medium">Spørsmål om turen?</div>
			<div class="body-medium on-surface-variant">Arrangørene svarer på e-post.</div>
		</div>
		<a class="btn btn-outlined" href="mailto:{trip.contact}">
			<Icon name="mail" size={18} />
			{trip.contact}
		</a>
	</div>
</section>
