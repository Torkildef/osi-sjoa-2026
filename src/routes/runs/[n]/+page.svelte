<script lang="ts">
	import Icon from '$lib/Icon.svelte';
	import { trip } from '$lib/config';
	import Linked from '$lib/Linked.svelte';
	import { allLegs, isRookie, legsOf, runs, shown, teamOf } from '$lib/runs';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const run = $derived(data.run);
	const paddlers = $derived(run.groups.flatMap((g) => g.members));
	const rookies = $derived(paddlers.filter(isRookie).length);
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
		<div class="value">{allLegs(run).length}</div>
		<div class="label"><Icon name="directionsCar" size={16} /> Kjørelegg</div>
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
						<span class="chip {teamOf(name)}">{shown(name)}</span>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</section>

<section class="block">
	<div class="section-head">
		<h2 class="title-large"><Icon name="directionsCar" size={22} class="primary-text" /> Bilene</h2>
	</div>
	<div class="table-wrap">
		<table class="data">
			<thead>
				<tr><th scope="col">Bil</th><th scope="col">Sjåfør</th><th scope="col">Dit</th></tr>
			</thead>
			<tbody>
				{#each legsOf(run) as block (block.when)}
					<tr class="group"><th scope="rowgroup" colspan="3"><Linked text={block.when} /></th></tr>
					{#each block.legs as s, i (i)}
						<tr>
							<td class="name">{s.car}</td>
							<td>{s.driver} {#if s.own}<span class="tag success">Egen bil</span>{/if}</td>
							<td class="wrap">{#if s.note}<Linked text={s.note} />{/if}</td>
						</tr>
					{/each}
				{/each}
			</tbody>
		</table>
	</div>
</section>
