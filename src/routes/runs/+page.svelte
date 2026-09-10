<script lang="ts">
	import Icon from '$lib/Icon.svelte';
	import { trip } from '$lib/config';
	import {
		experienced,
		facts,
		plans,
		rookiesRun1,
		rookiesRun2,
		runs,
		verdict,
		waiting
	} from '$lib/runs';

	/** Får Tiril tak i takstativ? Endrer kajakkregnestykket i alle planene. */
	let rack = $state(false);
</script>

<svelte:head>
	<title>Lørdag på elva – {trip.title}</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="page-head">
	<div>
		<h1 class="headline-large">Lørdag på elva</h1>
		<p class="body-medium on-surface-variant">Tre måter å gjøre det på. Grunnplanen er anbefalt.</p>
	</div>
	<div class="chip-row">
		{#each runs as run (run.n)}
			<a class="chip link" href="/runs/{run.n}"><Icon name="kayaking" size={16} /> {run.title}</a>
		{/each}
	</div>
</div>

<section class="block">
	<div class="card rack-card">
		<div>
			<h2 class="title-medium">Får Tiril tak i takstativ?</h2>
			<p class="body-small on-surface-variant">
				{rack
					? 'Ja: 4 kajakker til på Tirils bil. Alle 17 går i én tur.'
					: 'Nei: 16 kajakkplasser til 17 kajakker. Kajakk 17 hentes fra Kruke underveis.'}
			</p>
		</div>
		<button
			type="button"
			class="chip"
			class:tonal={!rack}
			class:selected={rack}
			aria-pressed={rack}
			onclick={() => (rack = !rack)}
		>
			<Icon name={rack ? 'checkCircle' : 'directionsCar'} size={16} />
			{rack ? 'Med takstativ' : 'Uten takstativ'}
		</button>
	</div>
</section>

<section class="block">
	<div class="section-head">
		<h2 class="title-large"><Icon name="info" size={22} class="primary-text" /> Det vi vet</h2>
	</div>
	<ul class="facts">
		{#each facts(rack) as line, i (i)}
			<li>{line}</li>
		{/each}
	</ul>
</section>

{#each plans as plan, p (plan.id)}
	<section class="block plan" id={plan.id}>
		<div class="section-head">
			<div>
				<h2 class="title-large">
					<Icon name="kayaking" size={22} class="primary-text" />
					{plan.title}
					{#if p === 0}<span class="tag success">Anbefalt</span>{/if}
				</h2>
				<p class="body-medium on-surface-variant">{plan.tagline}</p>
			</div>
		</div>
		<ol class="timeline">
			{#each plan.steps(rack) as step, i (i)}
				<li class="entry">
					<span class="when">Steg {i + 1}</span>
					<div class="what">
						<h3 class="title-medium">{step.what}</h3>
						{#if step.who}<p>{step.who}</p>{/if}
					</div>
				</li>
			{/each}
		</ol>
		<div class="grid wide proscons">
			<div class="card">
				<h3 class="title-small"><Icon name="checkCircle" size={18} class="primary-text" /> For</h3>
				<ul class="pros">
					{#each plan.pros as line, i (i)}<li>{line}</li>{/each}
				</ul>
			</div>
			<div class="card">
				<h3 class="title-small"><Icon name="warning" size={18} class="warn-text" /> Mot</h3>
				<ul class="cons">
					{#each plan.cons as line, i (i)}<li>{line}</li>{/each}
				</ul>
			</div>
		</div>
	</section>
{/each}

<section class="block">
	<div class="section-head">
		<h2 class="title-large"><Icon name="home" size={22} class="primary-text" /> Kruke som venterom</h2>
	</div>
	<ul class="facts">
		{#each waiting as line, i (i)}
			<li>{line}</li>
		{/each}
	</ul>
</section>

<section class="block">
	<div class="section-head">
		<h2 class="title-large"><Icon name="explore" size={22} class="primary-text" /> Vurdering</h2>
	</div>
	<ol class="logic">
		{#each verdict as line, i (i)}
			<li>{line}</li>
		{/each}
	</ol>
</section>

<section class="block">
	<div class="section-head">
		<h2 class="title-large"><Icon name="groups" size={22} class="primary-text" /> Hvem</h2>
	</div>
	<div class="grid wide">
		<div class="card">
			<div class="card-head">
				<h3 class="title-medium">Erfarne · begge runs</h3>
				<span class="tag primary">{experienced.length}</span>
			</div>
			<div class="chip-row">
				{#each experienced as name (name)}
					<span class="chip tonal">{name}</span>
				{/each}
			</div>
		</div>
		<div class="card">
			<div class="card-head">
				<h3 class="title-medium">Rookies · run 1</h3>
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
				<h3 class="title-medium">Rookies · run 2</h3>
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
