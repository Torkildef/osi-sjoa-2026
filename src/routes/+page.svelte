<script lang="ts">
	import Countdown from '$lib/Countdown.svelte';
	import Icon from '$lib/Icon.svelte';
	import WaterNow from '$lib/WaterNow.svelte';
	import { signupFormUrl, trip } from '$lib/config';
	import { practical } from '$lib/info';
	import { borrowsGear, cars, confirmed, fridaySeats, unconfirmed } from '$lib/participants';
	import { photos } from '$lib/photos';
	import { pages } from '$lib/nav';
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

<section class="block">
	<div class="stats">
		<a class="stat accent" href="/logistikk">
			<div class="value">{signedUp.length}</div>
			<div class="label"><Icon name="groups" size={16} /> Kommer{maybe.length ? ` · +${maybe.length} kanskje` : ''}</div>
		</a>
		<a class="stat" href="/logistikk">
			<div class="value">{cars.length}</div>
			<div class="label"><Icon name="directionsCar" size={16} /> Biler</div>
		</a>
		<a class="stat" href="/logistikk">
			<div class="value">{seats.seats}{seats.tight > seats.seats ? `–${seats.tight}` : ''}</div>
			<div class="label"><Icon name="person" size={16} /> Seter fredag</div>
		</a>
		<a class="stat" href="/logistikk">
			<div class="value">{borrowing}</div>
			<div class="label"><Icon name="kayaking" size={16} /> Låner utstyr</div>
		</a>
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
		<h2 class="title-large">Praktisk</h2>
	</div>
	<div class="grid wide">
		{#each practical as card (card.title)}
			<div class="card info-card">
				<span class="info-emoji">{card.emoji}</span>
				<h3 class="title-medium">{card.title}</h3>
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
