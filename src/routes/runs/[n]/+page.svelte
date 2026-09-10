<script lang="ts">
	import Icon from '$lib/Icon.svelte';
	import { trip } from '$lib/config';
	import { isRookie, rank, runs, teams } from '$lib/runs';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const run = $derived(data.run);
	const other = $derived(run.team === 'A' ? 'B' : 'A');
	const paddlers = $derived(run.groups.flatMap((g) => [g.lead, ...g.members]));
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
		<a class="chip link" href="/runs"><Icon name="keyboardArrowUp" size={16} /> Alle runs</a>
		<h1 class="headline-large" style="margin-top: 0.5rem">{run.title}</h1>
	</div>
	<div class="chip-row">
		{#if prev}<a class="chip link" href="/runs/{prev.n}">← Run {prev.n}</a>{/if}
		{#if next}<a class="chip link" href="/runs/{next.n}">Run {next.n} →</a>{/if}
	</div>
</div>

<div class="stats">
	<div class="stat accent">
		<div class="value">{paddlers.length}</div>
		<div class="label"><Icon name="kayaking" size={16} /> Padler · lag {run.team}</div>
	</div>
	<div class="stat">
		<div class="value">{paddlers.length - rookies}</div>
		<div class="label"><Icon name="checkCircle" size={16} /> Erfarne</div>
	</div>
	<div class="stat">
		<div class="value">{rookies}</div>
		<div class="label"><Icon name="person" size={16} /> Rookies</div>
	</div>
	<div class="stat">
		<div class="value">{run.shuttle.length}</div>
		<div class="label"><Icon name="directionsCar" size={16} /> Biler i shuttle · lag {other}</div>
	</div>
</div>

<section class="block">
	<div class="section-head">
		<h2 class="title-large"><Icon name="groups" size={22} class="primary-text" /> På elva</h2>
		<span class="body-small on-surface-variant">Lederen går først, sistemann bakerst</span>
	</div>
	<div class="grid">
		{#each run.groups as group (group.name)}
			<div class="card">
				<div class="card-head">
					<h3 class="title-medium">{group.name}</h3>
					<span class="tag primary">{1 + group.members.length}</span>
				</div>
				<ol class="crew">
					<li class="lead">
						<span class="crew-role">Leder</span>
						<span class="chip tonal">{group.lead}{rank(group.lead) ? ` · ${rank(group.lead)}` : ''}</span>
					</li>
					{#each group.members as name, i (name)}
						<li>
							<span class="crew-role">{i === group.members.length - 1 && !isRookie(name) ? 'Bakerst' : ''}</span>
							<span class="chip" class:tonal={!isRookie(name)} class:rookie={isRookie(name)}>
								{name}{rank(name) ? ` · ${rank(name)}` : ''}
							</span>
						</li>
					{/each}
				</ol>
			</div>
		{/each}
	</div>
</section>

<section class="block">
	<div class="section-head">
		<h2 class="title-large"><Icon name="directionsCar" size={22} class="primary-text" /> Shuttle · lag {other}</h2>
	</div>
	<div class="table-wrap">
		<table class="data">
			<thead>
				<tr>
					<th scope="col">Bil</th>
					<th scope="col">Sjåfør</th>
					<th scope="col">Merknad</th>
				</tr>
			</thead>
			<tbody>
				{#each run.shuttle as s (s.car)}
					<tr>
						<td class="name">{s.car}</td>
						<td>
							{s.driver}
							{#if s.own}<span class="tag success">Egen bil</span>{:else}<span class="tag">Lånt</span>{/if}
						</td>
						<td class="wrap">{s.note ?? ''}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	<p class="footnote">
		Resten av lag {other} blir med i bilene: {teams[other].filter((n) => !run.shuttle.some((s) => s.driver === n)).join(', ')}.
	</p>
</section>

<section class="block">
	<div class="section-head">
		<h2 class="title-large"><Icon name="schedule" size={22} class="primary-text" /> Slik går det</h2>
	</div>
	<ol class="logic">
		{#each run.steps as step, i (i)}
			<li>{step}</li>
		{/each}
	</ol>
</section>
