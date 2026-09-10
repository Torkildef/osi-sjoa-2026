<script lang="ts">
	import Icon from '$lib/Icon.svelte';
	import { trip } from '$lib/config';
	import { experienced, logic, rank, rookiesRun1, rookiesRun2, runs, timeline } from '$lib/runs';
</script>

<svelte:head>
	<title>Lørdag på elva – {trip.title}</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="page-head">
	<h1 class="headline-large">Lørdag på elva</h1>
	<div class="chip-row">
		{#each runs as run (run.n)}
			<a class="chip link" href="/runs/{run.n}"><Icon name="kayaking" size={16} /> {run.title}</a>
		{/each}
	</div>
</div>

<ol class="timeline">
	{#each timeline as step, i (i)}
		<li class="entry">
			<span class="when">{step.time}</span>
			<div class="what">
				<h3 class="title-medium">{step.what}</h3>
				{#if step.who}<p>{step.who}</p>{/if}
			</div>
		</li>
	{/each}
</ol>

<section class="block">
	<div class="grid wide">
		<div class="card">
			<div class="card-head">
				<h2 class="title-medium">Erfarne · begge runs</h2>
				<span class="tag primary">{experienced.length}</span>
			</div>
			<div class="chip-row">
				{#each experienced as name (name)}
					<span class="chip tonal">{name} · {rank(name)}</span>
				{/each}
			</div>
		</div>
		<div class="card">
			<div class="card-head">
				<h2 class="title-medium">Rookies · run 1</h2>
				<span class="tag rookie">{rookiesRun1.length}</span>
			</div>
			<div class="chip-row">
				{#each rookiesRun1 as name (name)}
					<span class="chip rookie">{name}</span>
				{/each}
			</div>
			<p class="body-small on-surface-variant" style="margin-top: 0.6rem">Kjører shuttle på run 2.</p>
		</div>
		<div class="card">
			<div class="card-head">
				<h2 class="title-medium">Rookies · run 2</h2>
				<span class="tag rookie">{rookiesRun2.length}</span>
			</div>
			<div class="chip-row">
				{#each rookiesRun2 as name (name)}
					<span class="chip rookie">{name}</span>
				{/each}
			</div>
			<p class="body-small on-surface-variant" style="margin-top: 0.6rem">Kjører shuttle på run 1.</p>
		</div>
	</div>
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
