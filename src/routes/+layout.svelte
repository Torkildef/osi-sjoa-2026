<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/state';
	import { signupFormUrl, trip } from '$lib/config';
	import { pages } from '$lib/nav';
	import { photos } from '$lib/photos';
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<header class="site-header">
	<div class="inner">
		<a class="brand" href="/">
			<!-- onerror: logoen legges inn av arrangørene, og toppen skal se hel ut uten den. -->
			<img
				src={photos.logo.src}
				alt={photos.logo.alt}
				class="logo"
				onerror={(e) => e.currentTarget.remove()}
			/>
			<strong>{trip.organiser} · {trip.title}</strong>
		</a>
		<nav>
			{#each pages as item (item.href)}
				<a
					href={item.href}
					aria-current={page.url.pathname === item.href ? 'page' : undefined}
					class:current={page.url.pathname === item.href}>{item.label}</a
				>
			{/each}
			<a class="external" href={signupFormUrl} target="_blank" rel="noopener">Skjema ↗</a>
		</nav>
	</div>
</header>

<main class="page">
	{@render children()}
</main>
