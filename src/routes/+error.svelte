<script lang="ts">
	import { page } from '$app/state';
	import Icon from '$lib/Icon.svelte';
	import { trip } from '$lib/config';
</script>

<svelte:head>
	<title>Noe gikk galt – {trip.title}</title>
</svelte:head>

<div class="empty" style="padding: 3rem 1rem">
	<Icon name={page.status === 404 ? 'explore' : 'error'} size={48} />
	<h1 class="headline-medium">{page.status === 404 ? 'Her var det tørt' : 'Noe gikk galt'}</h1>
	<p class="on-surface-variant">
		{page.status === 404
			? 'Denne lenken fører ingen steder. Bakevja er den veien.'
			: (page.error?.message ?? 'Prøv å laste siden på nytt.')}
	</p>
	<a class="btn btn-filled" href="/" style="margin-top: 0.5rem">
		<Icon name="home" />
		Til oversikten
	</a>
</div>
