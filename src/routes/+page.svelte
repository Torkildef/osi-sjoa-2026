<script lang="ts">
	import Countdown from '$lib/Countdown.svelte';
	import Icon from '$lib/Icon.svelte';
	import PackingList from '$lib/PackingList.svelte';
	import WaterNow from '$lib/WaterNow.svelte';
	import { signupFormUrl, trip } from '$lib/config';
	import { practical, warnings } from '$lib/info';
	import { confirmed, unconfirmed } from '$lib/participants';
	import { photos } from '$lib/photos';
	import { schedule } from '$lib/schedule';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const next = schedule[0];
	const signedUp = confirmed();
	const maybe = unconfirmed();
	const seats = fridaySeats();
	const borrowing = signedUp.filter(borrowsGear).length;

	let heroFailed = $state(false);
</script>

<svelte:head>
	<title>{trip.title} – {trip.organiser}</title>
</svelte:head>

<section class="hero">
	{#if !heroFailed}
		<img src={photos.kruke.src} alt={photos.kruke.alt} onerror={() => (heroFailed = true)} />
	{/if}
	<Countdown />
	<div class="hero-body">
		<div>
			<div class="overline" style="color: rgb(255 255 255 / 0.8)">{trip.organiser}</div>
			<h1 class="display-large">{trip.title}</h1>
		</div>
		<div class="hero-sub">
			<span><Icon name="event" size={18} /> {trip.dates}</span>
			<span><Icon name="house" size={18} /> {trip.base}, {trip.location}</span>
			<span><Icon name="schedule" size={18} /> Avreise {trip.meetup.label.toLowerCase()}</span>
			<a href="/logistikk" class="hero-count">
				<Icon name="groups" size={18} />
				{signedUp.length} kommer{maybe.length ? ` · ${maybe.length} kanskje` : ''}
			</a>
		</div>
		<div class="hero-actions">
			<a class="btn btn-filled" href={signupFormUrl} target="_blank" rel="noopener">
				Lenke til skjema
				<Icon name="openInNew" size={18} class="trailing" />
			</a>
			<a class="btn btn-tonal" href="/plan">
				<Icon name="calendarMonth" size={18} />
				Se planen
			</a>
		</div>
	</div>
</section>

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
		<h2 class="title-large">Pakkeliste</h2>
		<span class="body-small on-surface-variant">Huskes i nettleseren din</span>
	</div>
	<PackingList />
</section>

<section class="block">
	<div class="section-head">
		<h2 class="title-large">Praktisk</h2>
	</div>
	<div class="grid wide">
		{#each warnings as w (w.title)}
			<div class="card warning-card">
				<span class="info-emoji">{w.emoji}</span>
				<div>
					<div class="headline-small">{w.title}</div>
					<div class="body-medium">{w.text}</div>
				</div>
			</div>
		{/each}
		{#each practical as card (card.title)}
			<div class="card info-card">
				<span class="info-emoji">{card.emoji}</span>
				<div class="overline">{card.title}</div>
				<div class="info-lead">{card.lead}</div>
				<ul>
					{#each card.lines as line (line)}
						<li>{line}</li>
					{/each}
				</ul>
				{#if card.link}
					<div class="info-actions">
						<a
							class="chip link"
							href={card.link.href}
							target={card.link.href.startsWith('http') ? '_blank' : undefined}
							rel={card.link.href.startsWith('http') ? 'noopener' : undefined}
						>
							<Icon name={card.link.href.startsWith('http') ? 'directions' : 'map'} size={16} />
							{card.link.label}
						</a>
					</div>
				{/if}
			</div>
		{/each}
	</div>
</section>
