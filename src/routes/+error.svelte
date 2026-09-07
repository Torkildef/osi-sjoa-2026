<script lang="ts">
	import { page } from '$app/state';
	import { trip } from '$lib/config';
</script>

<svelte:head>
	<title>Noe gikk galt – {trip.title}</title>
</svelte:head>

<h1>{page.status === 404 ? 'Fant ikke siden' : 'Noe gikk galt'}</h1>
<p class="lede">
	{page.status === 404
		? 'Lenken finnes ikke.'
		: (page.error?.message ?? 'Prøv å laste siden på nytt.')}
</p>
<p><a href="/">Tilbake til oversikten</a></p>
