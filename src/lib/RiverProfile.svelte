<script lang="ts">
	import Icon from './Icon.svelte';
	import { placeByName } from './places';
	import { featureKinds, isTraced, lengthKm, lineFor, profileFor, type Section } from './river';

	/**
	 * Elveprofil: strekningen tegnet som en linje fra put inn til take out, med
	 * stryk og andre punkter i rekkefølge. Enklere å lese enn kartet når man vil
	 * vite hva som kommer – kartet viser hvor.
	 */
	let { section }: { section: Section } = $props();

	const traced = $derived(isTraced(section));
	const km = $derived(lengthKm(lineFor(section)));
	const nodes = $derived(profileFor(section));
	const from = $derived(placeByName(section.from));
	const to = $derived(placeByName(section.to));

	const mapLink = (node: (typeof nodes)[number]) =>
		node.kind === 'putin' || node.kind === 'takeout'
			? `/kart?sted=${encodeURIComponent(node.name)}`
			: node.coords
				? `/kart?punkt=${encodeURIComponent(node.name)}`
				: null;

	const shortName = (name: string) => name.replace(/^(Put inn|Take out)\s*[–-]?\s*/i, '');
</script>

<article class="river-section" style="--river: {section.color}" id={section.id}>
	<header class="river-head">
		<div class="title-row">
			<h3 class="headline-small">🛶 {section.name}</h3>
			<span class="chip-row">
				{#each section.tags ?? [] as tag (tag)}
					<span class="chip warning">{tag}</span>
				{/each}
				<span class="grade" title="Gradering">Grad {section.grade}</span>
			</span>
		</div>
		<p class="body-medium on-surface-variant">{section.description}</p>
		<div class="river-facts">
			<span><Icon name="tripOrigin" size={16} /> {from ? shortName(from.name) : section.from}</span>
			<span><Icon name="sportsScore" size={16} /> {to ? shortName(to.name) : section.to}</span>
			{#if km > 0}
				<span title={traced ? 'Langs elveløpet' : 'I luftlinje – elveløpet er ikke hentet inn ennå'}>
					<Icon name="straighten" size={16} />
					{traced ? `${km} km` : `ca. ${km} km i luftlinje`}
				</span>
			{/if}
			<a class="chip link" href="/kart?strekning={section.id}">
				<Icon name="map" size={16} />
				Vis på kartet
			</a>
		</div>
	</header>

	<ol class="profile">
		{#each nodes as node (node.kind + node.name)}
			<li class={node.kind}>
				<span class="node" title={featureKinds[node.kind].label}>{featureKinds[node.kind].emoji}</span>
				<div class="node-body">
					<div class="node-title">
						{node.kind === 'putin' || node.kind === 'takeout'
							? `${featureKinds[node.kind].label} · ${shortName(node.name)}`
							: node.name}
						{#if node.grade}<span class="tag primary">{node.grade}</span>{/if}
						{#if node.kind !== 'putin' && node.kind !== 'takeout' && node.kind !== 'rapid'}
							<span class="tag">{featureKinds[node.kind].label}</span>
						{/if}
					</div>
					{#if node.note}<div class="node-note">{node.note}</div>{/if}
					{#if mapLink(node)}
						<div class="node-actions">
							<a class="chip link" href={mapLink(node)}>
								<Icon name="locationOn" size={16} />
								Kart
							</a>
						</div>
					{/if}
				</div>
			</li>
			{#if node.kind === 'putin' && section.features.length === 0}
				<li class="empty-features">
					<div class="node-note">
						Stryk og nøkkelpunkter er ikke lagt inn ennå. De kommer her, i rekkefølge nedover elva.
					</div>
				</li>
			{/if}
		{/each}
	</ol>
</article>
