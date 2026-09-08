<script lang="ts">
	import { onMount } from 'svelte';
	import { places, placed, runs, type Place } from './places';

	let container: HTMLDivElement;
	let failed = $state(false);

	const shown = placed();

	onMount(() => {
		let map: import('leaflet').Map | undefined;

		// Leaflet rører window ved import, så den lastes først her – ikke under SSR.
		(async () => {
			try {
				const L = (await import('leaflet')).default;
				await import('leaflet/dist/leaflet.css');

				map = L.map(container, { scrollWheelZoom: false });

				L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
					maxZoom: 18,
					attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
				}).addTo(map);

				const at = (name: string) => places.find((p) => p.name === name)?.coords ?? null;

				for (const run of runs) {
					const from = at(run.from);
					const to = at(run.to);
					if (from && to) {
						L.polyline([from, to], {
							color: '#14607a',
							weight: 3,
							opacity: 0.55,
							dashArray: '6 8'
						})
							.bindTooltip(`${run.name} (strekning, ikke elveløpet)`, { sticky: true })
							.addTo(map);
					}
				}

				for (const place of shown) {
					// Emoji som markør: da slipper vi Leaflets bildefiler, som ellers må
					// kopieres inn manuelt og ofte ender som 404 etter bygging.
					const icon = L.divIcon({
						html: `<span class="pin pin-${place.kind}">${place.emoji}</span>`,
						className: 'pin-wrap',
						iconSize: [34, 34],
						iconAnchor: [17, 17],
						popupAnchor: [0, -16]
					});

					L.marker(place.coords, { icon, title: place.name })
						.bindPopup(popupHtml(place))
						.addTo(map);
				}

				map.fitBounds(
					shown.map((p) => p.coords),
					{ padding: [45, 45], maxZoom: 13 }
				);
			} catch {
				failed = true;
			}
		})();

		return () => map?.remove();
	});

	function popupHtml(place: Place): string {
		const [lat, lon] = place.coords!;
		const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
		return `
			<strong>${place.emoji} ${escape(place.name)}</strong>
			${place.note ? `<br><span class="muted">${escape(place.note)}</span>` : ''}
			${place.address ? `<br><span class="muted">${escape(place.address)}</span>` : ''}
			<br><a href="${url}" target="_blank" rel="noopener">Veibeskrivelse →</a>`;
	}

	function escape(text: string): string {
		return text.replace(
			/[&<>"']/g,
			(c) =>
				({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string
		);
	}
</script>

<div class="map-frame">
	<div class="map" bind:this={container}></div>
	{#if failed}
		<p class="notice error map-fallback">Klarte ikke å laste kartet.</p>
	{/if}
</div>
