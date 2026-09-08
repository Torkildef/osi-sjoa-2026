<script lang="ts">
	import Photo from '$lib/Photo.svelte';
	import { trip } from '$lib/config';
	import { photos } from '$lib/photos';
	import { pages } from '$lib/nav';
	import { schedule } from '$lib/schedule';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const roster = $derived(data.sheet.status === 'ok' ? data.sheet.roster : null);

	const blurbs: Record<string, string> = {
		'/heidal': 'Kart over hvor vi bor, put inn og take out, butikk og kafé.',
		'/elven': 'Vannføring siste 48 timer, og strekningene vi padler.',
		'/logistikk': 'Hvem som kommer, hvilke biler vi har og hvem som låner utstyr.',
		'/plan': 'Tidsskjema for helgen.'
	};

	const next = $derived(schedule[0]);
</script>

<svelte:head>
	<title>{trip.title} – {trip.organiser}</title>
</svelte:head>

<h1>{trip.title}</h1>
<p class="lede">{trip.dates} · {trip.location}</p>

<Photo
	class="hero"
	src={photos.kruke.src}
	alt={photos.kruke.alt}
	caption="Kruke gård, der vi bor"
/>

{#if roster}
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
{/if}

{#if next}
	<div class="card next-up">
		<div class="muted small">Først på planen</div>
		<strong>{next.day}{next.time ? ` kl. ${next.time}` : ''} · {next.title}</strong>
		<a class="small" href="/plan">Hele planen →</a>
	</div>
{/if}

<div class="grid page-links">
	{#each pages.filter((p) => p.href !== '/') as page (page.href)}
		<a class="page-link" href={page.href}>
			<strong>{page.label}</strong>
			<span class="muted small">{blurbs[page.href]}</span>
		</a>
	{/each}
</div>
