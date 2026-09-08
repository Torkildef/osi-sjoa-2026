<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/state';
	import { signupFormUrl, trip } from '$lib/config';
	import { pages } from '$lib/nav';
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<header class="site-header">
	<div class="inner">
		<strong>{trip.organiser} · {trip.title}</strong>
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
