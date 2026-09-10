<script lang="ts">
	import { page } from '$app/state';
	import Icon from '$lib/Icon.svelte';
	import { signupFormUrl, trip } from '$lib/config';
	import { pages } from '$lib/nav';
	import { photos } from '$lib/photos';
	import '../app.css';

	let { children } = $props();

	const isCurrent = (href: string) =>
		href === '/' ? page.url.pathname === '/' : page.url.pathname.startsWith(href);
</script>

<svelte:head>
	<meta name="description" content="Turside for {trip.organiser} sin tur til Sjoa, {trip.dates}." />
</svelte:head>

<header class="top-bar">
	<div class="inner">
		<a class="brand" href="/">
			<img src={photos.logo.src} alt={photos.logo.alt} class="logo" />
			<span class="brand-text">
				<strong>{trip.title}</strong>
				<span>{trip.organiser}</span>
			</span>
		</a>
		<span class="spacer"></span>
		<nav class="main-nav" aria-label="Hovedmeny">
			{#each pages as item (item.href)}
				<a
					href={item.href}
					aria-current={isCurrent(item.href) ? 'page' : undefined}
					class:current={isCurrent(item.href)}
				>
					<Icon name={item.icon} size={20} />
					<span>{item.label}</span>
				</a>
			{/each}
		</nav>
		<a class="btn btn-tonal btn-small signup" href={signupFormUrl} target="_blank" rel="noopener">
			Lenke til skjema
			<Icon name="openInNew" size={16} class="trailing" />
		</a>
	</div>
</header>

<main class="page">
	{@render children()}
</main>

<footer class="site-footer">
	<span>{trip.organiser} · {trip.title}</span>
	<span>Kart: © OpenStreetMap, Kartverket · Vannføring: NVE</span>
</footer>
