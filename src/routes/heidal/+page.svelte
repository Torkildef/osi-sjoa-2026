<script lang="ts">
	import Map from '$lib/Map.svelte';
	import { trip } from '$lib/config';
	import { missing, places } from '$lib/places';
	import { photos } from '$lib/photos';

	let map = $state<ReturnType<typeof Map> | undefined>();
</script>

<svelte:head>
	<title>Heidal – {trip.title}</title>
</svelte:head>

<h1>Heidal</h1>
<p class="lede">Hvor vi bor, hvor vi padler, og hvor du får tak i mat og utstyr.</p>

<Map bind:this={map} />

<ul class="places">
	{#each places as place (place.name)}
		<li class:unplaced={place.coords === null}>
			<!-- Knapp, ikke bare tekst: butikkene ligger så tett at nålene dekker
			     hverandre, og dette er eneste sikre vei til dem på kartet. -->
			<button
				type="button"
				class="place-button"
				disabled={place.coords === null}
				onclick={() => map?.focusPlace(place.name)}
			>
				{#if place.logo}
					<img
						class="place-logo"
						src={photos[place.logo].src}
						alt={photos[place.logo].alt}
						onerror={(e) => e.currentTarget.replaceWith(document.createTextNode(place.emoji))}
					/>
				{:else}
					<span class="place-emoji">{place.emoji}</span>
				{/if}
				<span>
					<strong>{place.name}</strong>
					{#if place.note}<span class="muted small"> · {place.note}</span>{/if}
					{#if place.address}<span class="muted small block">{place.address}</span>{/if}
					{#if place.coords === null}
						<span class="muted small block">Mangler koordinat</span>
					{/if}
				</span>
			</button>
			{#if place.coords}
				<a
					class="small route"
					href="https://www.google.com/maps/search/?api=1&query={place.coords[0]},{place
						.coords[1]}"
					target="_blank"
					rel="noopener">Veibeskrivelse →</a
				>
			{/if}
		</li>
	{/each}
</ul>

{#if missing().length > 0}
	<p class="notice small">
		{missing().length} steder mangler koordinat og vises ikke på kartet. Høyreklikk stedet i Google
		Maps, kopier tallene øverst i menyen, og lim dem inn i <code>src/lib/places.ts</code>.
	</p>
{/if}
