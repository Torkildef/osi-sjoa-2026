<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { trip } from '$lib/config';
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
			<a href="/">Oversikt</a>
			<a href="/pamelding">Påmelding</a>
			<a href="/admin">Admin</a>
		</nav>
	</div>
</header>

<main class="page">
	{@render children()}
</main>
