<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from './Icon.svelte';
	import { photos } from './photos';
	import { directionsUrl, kinds, placed, places, type Place, type PlaceKind } from './places';
	import { featurePosition, featureKinds, isTraced, lineFor, sections, type Section } from './river';

	type LeafletModule = typeof import('leaflet');
	type BaseLayer = 'topo' | 'kart' | 'satellitt';

	let {
		onready,
		section,
		compact = false
	}: {
		/** Kalles når kartet er tegnet, så siden kan zoome til det URL-en peker på. */
		onready?: () => void;
		/** Vis bare denne strekningen, med put inn, take out og punktene langs den. */
		section?: Section;
		/** Lavere kart uten filter, til bruk inne i et kort. */
		compact?: boolean;
	} = $props();

	let container: HTMLDivElement;
	let failed = $state(false);
	let base = $state<BaseLayer>('topo');
	let fallbackNote = $state<string | null>(null);
	let visible = $state<Set<PlaceKind>>(new Set(kinds.map((k) => k.kind)));

	/**
	 * Bakgrunnskartene. Kartverkets topokart viser elva og terrenget best og er
	 * standard; flyfoto er nyttig for å kjenne igjen put inn og take out.
	 */
	const baseLayers: Record<BaseLayer, { label: string; icon: 'landscape' | 'map' | 'satelliteAlt'; url: string; attribution: string; maxZoom: number }> = {
		topo: {
			label: 'Topo',
			icon: 'landscape',
			url: 'https://cache.kartverket.no/v1/wmts/1.0.0/topo/default/webmercator/{z}/{y}/{x}.png',
			attribution: '&copy; <a href="https://www.kartverket.no/">Kartverket</a>',
			maxZoom: 18
		},
		kart: {
			label: 'Kart',
			icon: 'map',
			url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
			maxZoom: 19
		},
		satellitt: {
			label: 'Flyfoto',
			icon: 'satelliteAlt',
			url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
			attribution: '&copy; Esri, Maxar, Earthstar Geographics',
			maxZoom: 18
		}
	};

	let L: LeafletModule | undefined;
	let map: import('leaflet').Map | undefined;
	let tiles: import('leaflet').TileLayer | undefined;
	const markers = new Map<string, import('leaflet').Marker>();
	const groups = new Map<PlaceKind, import('leaflet').LayerGroup>();
	const sectionLines = new Map<string, import('leaflet').Polyline>();
	const featureMarkers = new Map<string, import('leaflet').Marker>();

	// Kartet bygges én gang ved montering, så disse trenger ikke å reagere på endringer.
	const drawnSections = $derived(section ? [section] : sections);
	const shown = $derived(
		placed(section ? places.filter((p) => p.name === section.from || p.name === section.to) : places)
	);

	/** Zoomer til et sted og åpner popupen. Butikkene ligger så tett at nålene dekker
	 *  hverandre når hele området vises; lista er eneste sikre vei til dem. */
	export function focusPlace(name: string) {
		const place = places.find((p) => p.name === name);
		const marker = markers.get(name);
		if (!map || !place?.coords || !marker) return;
		show(place.kind);
		map.flyTo(place.coords, Math.max(map.getZoom(), 15), { duration: 0.6 });
		marker.openPopup();
	}

	/** Viser hele strekningen i kartet. */
	export function focusSection(id: string) {
		const line = sectionLines.get(id);
		if (!map || !line) return;
		show('elv');
		map.flyToBounds(line.getBounds(), { padding: [40, 40], duration: 0.6 });
	}

	/** Zoomer til et punkt langs elva – et stryk, en playspot. */
	export function focusFeature(name: string) {
		const marker = featureMarkers.get(name);
		if (!map || !marker) return;
		show('elv');
		map.flyTo(marker.getLatLng(), Math.max(map.getZoom(), 15), { duration: 0.6 });
		marker.openPopup();
	}

	/** Tilbake til hele turområdet. */
	export function fitAll() {
		if (!map) return;
		map.flyToBounds(allBounds(), { padding: [40, 40], duration: 0.6 });
	}

	function allBounds() {
		const points: [number, number][] = shown.map((p) => p.coords);
		for (const s of drawnSections) points.push(...lineFor(s));
		return L!.latLngBounds(points);
	}

	function show(kind: PlaceKind) {
		if (visible.has(kind)) return;
		visible = new Set([...visible, kind]);
		applyFilter();
	}

	export function toggleKind(kind: PlaceKind) {
		const next = new Set(visible);
		if (next.has(kind)) next.delete(kind);
		else next.add(kind);
		visible = next;
		applyFilter();
	}

	export const isVisible = (kind: PlaceKind) => visible.has(kind);

	function applyFilter() {
		if (!map) return;
		for (const [kind, group] of groups) {
			if (visible.has(kind)) group.addTo(map);
			else group.remove();
		}
	}

	function setBase(next: BaseLayer) {
		base = next;
		fallbackNote = null;
		mountTiles();
	}

	function mountTiles() {
		if (!L || !map) return;
		tiles?.remove();
		const def = baseLayers[base];
		let loaded = 0;
		tiles = L.tileLayer(def.url, { maxZoom: def.maxZoom, attribution: def.attribution });
		tiles.on('tileload', () => loaded++);
		// Svarer ikke tjenesten i det hele tatt, faller vi tilbake til OpenStreetMap
		// framfor å vise et grått kart. Enkeltfliser som mangler er normalt.
		tiles.on('tileerror', () => {
			if (loaded === 0 && base !== 'kart') {
				fallbackNote = `${def.label} svarte ikke – viser OpenStreetMap i stedet.`;
				base = 'kart';
				mountTiles();
			}
		});
		tiles.addTo(map);
	}

	onMount(() => {
		// Leaflet rører window ved import, så den lastes først her – ikke under SSR.
		(async () => {
			try {
				L = (await import('leaflet')).default;
				await import('leaflet/dist/leaflet.css');

				map = L.map(container, { scrollWheelZoom: false, zoomControl: false });
				L.control.zoom({ position: 'bottomright' }).addTo(map);
				mountTiles();

				for (const k of kinds) groups.set(k.kind, L.layerGroup().addTo(map));

				drawSections(L, map);
				drawPlaces(L);
				drawFeatures(L);

				map.fitBounds(allBounds(), { padding: compact ? [24, 24] : [40, 40], maxZoom: section ? 14 : 13 });
				onready?.();
			} catch {
				failed = true;
			}
		})();

		return () => {
			map?.remove();
			map = undefined;
			markers.clear();
			groups.clear();
			sectionLines.clear();
			featureMarkers.clear();
		};
	});

	function drawSections(L: LeafletModule, map: import('leaflet').Map) {
		for (const section of drawnSections) {
			const line = lineFor(section);
			if (line.length < 2) continue;
			const traced = isTraced(section);
			// Hvit kant under fargen, så linja synes både på topokart og flyfoto.
			const casing = L.polyline(line, { color: '#fff', weight: traced ? 8 : 0, opacity: 0.7 });
			const poly = L.polyline(line, {
				color: section.color,
				weight: traced ? 5 : 4,
				opacity: 0.9,
				// Stiplet så lenge det bare er en rett strek mellom put inn og take out.
				dashArray: traced ? undefined : '8 10',
				lineCap: 'round'
			}).bindTooltip(
				`${section.name} · ${section.grade}${traced ? '' : ' (rett strek, ikke elveløpet)'}`,
				{ sticky: true, className: 'river-label' }
			);
			poly.on('click', () => focusSection(section.id));
			const group = groups.get('elv')!;
			casing.addTo(group);
			poly.addTo(group);
			sectionLines.set(section.id, poly);
		}
	}

	function drawPlaces(L: LeafletModule) {
		for (const place of shown) {
			// Emoji som markør: da slipper vi Leaflets bildefiler, som ellers må
			// kopieres inn manuelt og ofte ender som 404 etter bygging.
			const icon = L.divIcon({
				html: `<span class="pin pin-${place.kind}">${place.emoji}</span>`,
				className: 'pin-wrap',
				iconSize: [36, 36],
				iconAnchor: [18, 18],
				popupAnchor: [0, -18]
			});
			const direction = place.labelDirection ?? 'right';
			const marker = L.marker(place.coords, { icon, title: place.name })
				.bindPopup(popupHtml(place))
				// Navnet står permanent ved siden av markøren, så kartet kan leses
				// uten å klikke seg gjennom hver enkelt nål.
				.bindTooltip(place.name, {
					permanent: true,
					direction,
					offset: labelOffset(direction),
					className: 'map-label'
				})
				.addTo(groups.get(place.kind)!);
			markers.set(place.name, marker);
		}
	}

	function drawFeatures(L: LeafletModule) {
		for (const section of drawnSections) {
			// Nummerert som i elveprofilen, så kart og liste kan leses sammen.
			section.features.forEach((f, i) => {
				const at = featurePosition(section, f);
				if (!at) return;
				const icon = L.divIcon({
					html: `<span class="river-pin" style="--river: ${section.color}">${i + 1}</span>`,
					className: 'pin-wrap',
					iconSize: [26, 26],
					iconAnchor: [13, 13],
					popupAnchor: [0, -14]
				});
				const marker = L.marker(at, { icon, title: f.name })
					.bindTooltip(`${featureKinds[f.kind].emoji} ${f.name}`, { direction: 'top', offset: [0, -12], className: 'map-label' })
					.bindPopup(featurePopupHtml(section, f))
					.addTo(groups.get('elv')!);
				featureMarkers.set(f.name, marker);
			});
		}
	}

	/** Dytter navnet klar av den 36 px brede nåla, uansett hvilken vei det peker. */
	function labelOffset(direction: string): [number, number] {
		if (direction === 'top') return [0, -20];
		if (direction === 'bottom') return [0, 20];
		if (direction === 'left') return [-20, 0];
		return [20, 0];
	}

	function popupHtml(place: Place): string {
		const url = directionsUrl(place.coords!);
		// this.remove(): logoene legges inn etter hvert, og popupen skal se hel ut uten dem.
		const logo = place.logo
			? `<img class="popup-logo" src="${photos[place.logo].src}" alt="${escape(
					photos[place.logo].alt
				)}" onerror="this.remove()">`
			: '';
		return `
			${logo}
			<span class="popup-title">${place.emoji} ${escape(place.name)}</span>
			${place.note ? `<span class="popup-note">${escape(place.note)}</span>` : ''}
			${place.address ? `<span class="popup-note">${escape(place.address)}</span>` : ''}
			<a href="${url}" target="_blank" rel="noopener">Veibeskrivelse ↗</a>`;
	}

	function featurePopupHtml(section: Section, f: Section['features'][number]): string {
		const kind = featureKinds[f.kind];
		return `
			<span class="popup-title">${kind.emoji} ${escape(f.name)}${f.grade ? ` · ${escape(f.grade)}` : ''}</span>
			<span class="popup-note">${escape(kind.label)} på ${escape(section.name)}</span>
			${f.note ? `<span class="popup-note">${escape(f.note)}</span>` : ''}`;
	}

	function escape(text: string): string {
		return text.replace(
			/[&<>"']/g,
			(c) =>
				({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string
		);
	}
</script>

<div class="map-frame" class:compact>
	<div class="map" bind:this={container}></div>

	<div class="map-tools">
		<div class="segmented" role="group" aria-label="Bakgrunnskart">
			{#each Object.entries(baseLayers) as [key, def] (key)}
				<button
					type="button"
					aria-pressed={base === key}
					onclick={() => setBase(key as BaseLayer)}
				>
					<Icon name={def.icon} size={16} />
					<span>{def.label}</span>
				</button>
			{/each}
		</div>
		<button type="button" class="icon-btn" title="Vis hele området" aria-label="Vis hele området" onclick={fitAll}>
			<Icon name="explore" size={22} />
		</button>
	</div>

	{#if failed}
		<p class="notice error map-fallback">
			<Icon name="error" size={20} />
			Klarte ikke å laste kartet.
		</p>
	{:else if fallbackNote}
		<p class="notice map-fallback">
			<Icon name="info" size={20} />
			{fallbackNote}
		</p>
	{/if}
</div>
