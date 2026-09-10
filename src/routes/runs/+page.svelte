<script lang="ts">
	import Icon from '$lib/Icon.svelte';
	import { trip } from '$lib/config';
	import { experienced, isRookie, logic, rank, runs, teams } from '$lib/runs';

	const rookiesIn = (team: string[]) => team.filter(isRookie).length;
</script>

<svelte:head>
	<title>Runs lørdag – {trip.title}</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="page-head">
	<h1 class="headline-large">Runs lørdag</h1>
</div>

<div class="stats">
	<div class="stat accent">
		<div class="value">{teams.A.length + teams.B.length}</div>
		<div class="label"><Icon name="kayaking" size={16} /> Padler</div>
	</div>
	<div class="stat">
		<div class="value">{experienced.length}</div>
		<div class="label"><Icon name="checkCircle" size={16} /> Erfarne</div>
	</div>
	<div class="stat">
		<div class="value">{rookiesIn(teams.A) + rookiesIn(teams.B)}</div>
		<div class="label"><Icon name="person" size={16} /> Rookies</div>
	</div>
	<div class="stat">
		<div class="value">{runs.length}</div>
		<div class="label"><Icon name="waves" size={16} /> Runs på Bru-bru</div>
	</div>
</div>

<section class="block">
	<div class="grid wide">
		{#each runs as run (run.n)}
			<a class="card elevated" href="/runs/{run.n}">
				<div class="card-head">
					<h2 class="title-large">{run.title}</h2>
					<Icon name="arrowForward" size={20} class="on-surface-variant" />
				</div>
				<p class="body-medium on-surface-variant" style="margin-bottom: 0.6rem">
					Lag {run.team} padler, lag {run.team === 'A' ? 'B' : 'A'} kjører shuttle.
				</p>
				<div class="chip-row">
					{#each teams[run.team] as name (name)}
						<span class="chip" class:tonal={!isRookie(name)} class:rookie={isRookie(name)}>
							{name}{rank(name) ? ` · ${rank(name)}` : ''}
						</span>
					{/each}
				</div>
			</a>
		{/each}
	</div>
	<p class="footnote">
		Tallet bak navnet er plassen på erfaringslista, 1 er mest erfaren. Lilla er rookie.
	</p>
</section>

<section class="block">
	<div class="section-head">
		<h2 class="title-large"><Icon name="info" size={22} class="primary-text" /> Logikken</h2>
	</div>
	<ol class="logic">
		{#each logic as line, i (i)}
			<li>{line}</li>
		{/each}
	</ol>
</section>
