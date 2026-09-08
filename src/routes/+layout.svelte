<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { signupFormUrl, trip } from '$lib/config';
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
			<a href={signupFormUrl} target="_blank" rel="noopener">Påmeldingsskjemaet ↗</a>
		</nav>
	</div>
</header>

<main class="page">
	{@render children()}
</main>
