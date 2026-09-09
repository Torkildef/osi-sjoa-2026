<script lang="ts">
	import { page } from '$app/state';
	import Icon from '$lib/Icon.svelte';
	import Map from '$lib/Map.svelte';
	import { trip } from '$lib/config';
	import { directionsUrl, kinds, missing, places, type PlaceKind } from '$lib/places';
	import { photos } from '$lib/photos';
	import { isTraced, sections } from '$lib/river';

	let map = $state<ReturnType<typeof Map> | undefined>();
	/** Speiler filteret i kartet, så chipsene oppdaterer seg. */
	let hidden = $state<Set<PlaceKind>>(new Set());

	function toggle(kind: PlaceKind) {
		map?.toggleKind(kind);
		const next = new Set(hidden);
		if (next.has(kind)) next.delete(kind);
		else next.add(kind);
		hidden = next;
	}

	/** Zoomer til det URL-en peker på, når kartet er klart. Lenkene kommer fra
	 *  planen og elveprofilen: /kart?sted=…, /kart?strekning=… og /kart?punkt=… */
	function onready() {
		const q = page.url.searchParams;
		if (q.get('sted')) map?.focusPlace(q.get('sted')!);
		else if (q.get('strekning')) map?.focusSection(q.get('strekning')!);
		else if (q.get('punkt')) map?.focusFeature(q.get('punkt')!);
	}

	function focus(name: string) {
		map?.focusPlace(name);
		document.querySelector('.map-frame')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}

	const byKind = (kind: PlaceKind) => places.filter((p) => p.kind === kind);
	const unplaced = missing();
</script>

<svelte:head>
	<title>Kart – {trip.title}</title>
</svelte:head>

<div class="page-head">
	<h1 class="headline-large">Kart</h1>
</div>

<Map bind:this={map} {onready} />

<div class="chip-row" style="margin-top: 0.85rem">
	{#each kinds as k (k.kind)}
		<button
			type="button"
			class="chip"
			class:selected={!hidden.has(k.kind)}
			aria-pressed={!hidden.has(k.kind)}
			onclick={() => toggle(k.kind)}
		>
			{#if !hidden.has(k.kind)}<Icon name="check" size={16} />{/if}
			{k.label}
		</button>
	{/each}
</div>

<div class="map-legend">
	{#each sections as s (s.id)}
		<span>
			<i class="swatch" class:dashed={!isTraced(s)} style="--swatch: {s.color}"></i>
			{s.name} · {s.grade}
		</span>
	{/each}
	{#if sections.some((s) => !isTraced(s))}
		<span class="on-surface-variant">Stiplet = rett strek mellom put inn og take out, ikke elveløpet</span>
	{/if}
</div>

{#each kinds as k (k.kind)}
	{@const list = byKind(k.kind)}
	{#if list.length > 0}
		<section class="block">
			<div class="section-head">
				<h2 class="title-large">{k.label}</h2>
				<span class="body-small on-surface-variant">Trykk for å vise på kartet</span>
			</div>
			<ul class="list">
				{#each list as place (place.name)}
					<li style="display: flex; gap: 0.35rem; align-items: stretch">
						<button
							type="button"
							class="list-item"
							disabled={place.coords === null}
							onclick={() => focus(place.name)}
						>
							{#if place.logo}
								<span class="leading logo">
									<img
										src={photos[place.logo].src}
										alt={photos[place.logo].alt}
										onerror={(e) => e.currentTarget.replaceWith(document.createTextNode(place.emoji))}
									/>
								</span>
							{:else}
								<span class="leading">{place.emoji}</span>
							{/if}
							<span class="content">
								<span class="headline">{place.name}</span>
								<span class="supporting">
									{place.note ?? ''}{place.note && place.address ? ' · ' : ''}{place.address ?? ''}
									{#if place.coords === null}<span class="tag warning">Mangler koordinat</span>{/if}
								</span>
							</span>
						</button>
						{#if place.coords}
							<a
								class="icon-btn tonal"
								style="align-self: center"
								href={directionsUrl(place.coords)}
								target="_blank"
								rel="noopener"
								title="Veibeskrivelse i Google Maps"
								aria-label="Veibeskrivelse til {place.name}"
							>
								<Icon name="directions" size={22} />
							</a>
						{/if}
					</li>
				{/each}
			</ul>
		</section>
	{/if}
{/each}

{#if unplaced.length > 0}
	<p class="notice" style="margin-top: 1.5rem">
		<Icon name="info" size={20} />
		<span>
			{unplaced.length} {unplaced.length === 1 ? 'sted mangler' : 'steder mangler'} koordinat og vises ikke
			på kartet. Høyreklikk stedet i Google Maps, kopier tallene øverst i menyen, og lim dem inn i
			<code>src/lib/places.ts</code>.
		</span>
	</p>
{/if}
