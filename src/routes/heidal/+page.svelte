<script lang="ts">
	import Map from '$lib/Map.svelte';
	import { trip } from '$lib/config';
	import { missing, places } from '$lib/places';
</script>

<svelte:head>
	<title>Heidal – {trip.title}</title>
</svelte:head>

<h1>Heidal</h1>
<p class="lede">Hvor vi bor, hvor vi padler, og hvor du får tak i mat og utstyr.</p>

<Map />

<ul class="places">
	{#each places as place (place.name)}
		<li class:unplaced={place.coords === null}>
			<span class="place-emoji">{place.emoji}</span>
			<span>
				<strong>{place.name}</strong>
				{#if place.note}<span class="muted small"> · {place.note}</span>{/if}
				{#if place.coords}
					<a
						class="small"
						href="https://www.google.com/maps/search/?api=1&query={place.coords[0]},{place
							.coords[1]}"
						target="_blank"
						rel="noopener">Veibeskrivelse →</a
					>
				{:else}
					<span class="muted small"> · mangler koordinat</span>
				{/if}
				{#if place.address}<span class="muted small block">{place.address}</span>{/if}
			</span>
		</li>
	{/each}
</ul>

{#if missing().length > 0}
	<p class="notice small">
		{missing().length} steder mangler koordinat og vises ikke på kartet. Høyreklikk stedet i Google
		Maps, kopier tallene øverst i menyen, og lim dem inn i <code>src/lib/places.ts</code>.
	</p>
{/if}
