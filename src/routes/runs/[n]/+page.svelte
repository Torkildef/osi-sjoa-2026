<script lang="ts">
	import Icon from '$lib/Icon.svelte';
	import { trip } from '$lib/config';
	import { isRookie, playrunGroups, runs } from '$lib/runs';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const run = $derived(data.run);
	const paddlers = $derived(run.groups.flatMap((g) => g.members));
	const rookies = $derived(paddlers.filter(isRookie).length);
	const playrun = $derived(playrunGroups(run));
	const prev = $derived(runs.find((r) => r.n === run.n - 1));
	const next = $derived(runs.find((r) => r.n === run.n + 1));
</script>

<svelte:head>
	<title>{run.title} – {trip.title}</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="page-head">
	<div>
		<a class="chip link" href="/runs"><Icon name="keyboardArrowUp" size={16} /> Hele dagen</a>
		<h1 class="headline-large" style="margin-top: 0.5rem">{run.title}</h1>
	</div>
	<div class="chip-row">
		{#if prev}<a class="chip link" href="/runs/{prev.n}">← {prev.title}</a>{/if}
		{#if next}<a class="chip link" href="/runs/{next.n}">{next.title} →</a>{/if}
	</div>
</div>

<div class="stats">
	<div class="stat accent">
		<div class="value">{paddlers.length}</div>
		<div class="label"><Icon name="kayaking" size={16} /> Bru-bru</div>
	</div>
	<div class="stat">
		<div class="value">{paddlers.length - rookies}</div>
		<div class="label"><Icon name="waves" size={16} /> Playrun</div>
	</div>
	<div class="stat">
		<div class="value">{rookies}</div>
		<div class="label"><Icon name="person" size={16} /> Rookies</div>
	</div>
	<div class="stat">
		<div class="value">{run.before.length}</div>
		<div class="label"><Icon name="directionsCar" size={16} /> Biler</div>
	</div>
</div>

<section class="block">
	<div class="section-head">
		<h2 class="title-large"><Icon name="groups" size={22} class="primary-text" /> Bru-bru</h2>
	</div>
	<div class="grid">
		{#each run.groups as group (group.name)}
			<div class="card">
				<div class="card-head">
					<h3 class="title-medium">{group.name}</h3>
					<span class="tag primary">{group.members.length}</span>
				</div>
				<div class="chip-row">
					{#each group.members as name (name)}
						<span class="chip" class:tonal={!isRookie(name)} class:rookie={isRookie(name)}>{name}</span>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</section>

<section class="block">
	<div class="section-head">
		<h2 class="title-large"><Icon name="waves" size={22} class="primary-text" /> Playrun</h2>
		<p class="body-small on-surface-variant">Samme grupper, uten rookiene.</p>
	</div>
	<div class="grid">
		{#each playrun as group (group.name)}
			<div class="card">
				<div class="card-head">
					<h3 class="title-medium">{group.name}</h3>
					<span class="tag primary">{group.members.length}</span>
				</div>
				<div class="chip-row">
					{#each group.members as name (name)}<span class="chip tonal">{name}</span>{/each}
				</div>
			</div>
		{/each}
	</div>
</section>

<section class="block">
	<div class="section-head">
		<h2 class="title-large"><Icon name="directionsCar" size={22} class="primary-text" /> Før: bilene til Kruke</h2>
		<p class="body-small on-surface-variant">Mens rookiene varmer opp ved put inn.</p>
	</div>
	<div class="table-wrap">
		<table class="data">
			<thead>
				<tr><th scope="col">Bil</th><th scope="col">Sjåfør</th><th scope="col">Merknad</th></tr>
			</thead>
			<tbody>
				{#each run.before as s (s.car)}
					<tr>
						<td class="name">{s.car}</td>
						<td>{s.driver} {#if s.own}<span class="tag success">Egen bil</span>{/if}</td>
						<td class="wrap">{s.note ?? ''}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</section>

<section class="block">
	<div class="section-head">
		<h2 class="title-large"><Icon name="directionsCar" size={22} class="primary-text" /> Etter Bru-bru</h2>
		<p class="body-small on-surface-variant">Rookiene i land, de erfarne padler Playrun.</p>
	</div>
	<div class="table-wrap">
		<table class="data">
			<thead>
				<tr><th scope="col">Bil</th><th scope="col">Sjåfør</th><th scope="col">Dit</th></tr>
			</thead>
			<tbody>
				{#each run.after as s (s.car)}
					<tr>
						<td class="name">{s.car}</td>
						<td>{s.driver} {#if s.own}<span class="tag success">Egen bil</span>{/if}</td>
						<td class="wrap">{s.note ?? ''}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	<p class="footnote">{run.afterNote}</p>
</section>
