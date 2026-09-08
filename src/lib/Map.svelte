<script lang="ts">
	import { onMount } from 'svelte';
	import { photos } from './photos';
	import { places, placed, runs, type Place } from './places';

	let container: HTMLDivElement;
	let failed = $state(false);

	const shown = placed();

	let map: import('leaflet').Map | undefined;
	const markers = new Map<string, import('leaflet').Marker>();

	/**
	 * Zoomer til et sted og åpner popupen. Kalles fra stedslista, fordi butikkene
	 * ligger så tett at nålene dekker hverandre når hele området vises – uten dette
	 * er de nederste umulige å treffe med musa.
	 */
	export function focusPlace(name: string) {
		const place = places.find((p) => p.name === name);
		const marker = markers.get(name);
		if (!map || !place?.coords || !marker) return;
		map.flyTo(place.coords, Math.max(map.getZoom(), 15), { duration: 0.6 });
		marker.openPopup();
	}

	onMount(() => {

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

					const marker = L.marker(place.coords, { icon, title: place.name })
						.bindPopup(popupHtml(place))
						// Navnet står permanent ved siden av markøren, så kartet kan leses
						// uten å klikke seg gjennom hver enkelt nål.
						.bindTooltip(place.name, {
							permanent: true,
							direction: place.labelDirection ?? 'right',
							offset: labelOffset(place.labelDirection ?? 'right'),
							className: `map-label map-label-${place.kind}`
						})
						.addTo(map);
					markers.set(place.name, marker);
				}

				map.fitBounds(
					shown.map((p) => p.coords),
					{ padding: [45, 45], maxZoom: 13 }
				);
			} catch {
				failed = true;
			}
		})();

		return () => {
			map?.remove();
			map = undefined;
			markers.clear();
		};
	});

	/** Dytter navnet klar av den 34 px brede nåla, uansett hvilken vei det peker. */
	function labelOffset(direction: string): [number, number] {
		if (direction === 'top') return [0, -18];
		if (direction === 'bottom') return [0, 18];
		if (direction === 'left') return [-18, 0];
		return [18, 0];
	}

	function popupHtml(place: Place): string {
		const [lat, lon] = place.coords!;
		const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
		// this.remove(): logoene legges inn etter hvert, og popupen skal se hel ut uten dem.
		const logo = place.logo
			? `<img class="popup-logo" src="${photos[place.logo].src}" alt="${escape(
					photos[place.logo].alt
				)}" onerror="this.remove()">`
			: '';
		return `
			${logo}
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
