<script lang="ts">
	import Icon from '$lib/Icon.svelte';
	import { trip } from '$lib/config';
	import {
		everyone,
		experienced,
		facts,
		isRookie,
		rookiesRun1,
		rookiesRun2,
		runs,
		steps,
		summaryFor,
		verdict,
		waiting
	} from '$lib/runs';

	const KEY = 'sjoa:meg';

	/** Får Tiril tak i takstativ? Endrer kajakkregnestykket. */
	let rack = $state(false);
	/** Hvem som ser på. Huskes i nettleseren. */
	let me = $state('');

	$effect(() => {
		try {
			const saved = localStorage.getItem(KEY);
			if (saved && everyone.includes(saved)) me = saved;
		} catch {
			/* ingen lagring */
		}
	});

	const pick = (name: string) => {
		me = me === name ? '' : name;
		try {
			if (me) localStorage.setItem(KEY, me);
			else localStorage.removeItem(KEY);
		} catch {
			/* ingen lagring */
		}
	};

	const day = $derived(steps(rack));
	const mine = $derived(me ? day.map((s, i) => (s.names.includes(me) ? i : -1)).filter((i) => i >= 0) : []);
</script>

<svelte:head>
	<title>Lørdag på elva – {trip.title}</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="page-head">
	<div>
		<h1 class="headline-large">Lørdag på elva</h1>
		<p class="body-medium on-surface-variant">
			To runs. Bru-bru for alle, så Playrun for de erfarne. Rookiene padler ett run og kjører på det andre.
		</p>
	</div>
	<div class="chip-row">
		{#each runs as run (run.n)}
			<a class="chip link" href="/runs/{run.n}"><Icon name="kayaking" size={16} /> {run.title}</a>
		{/each}
	</div>
</div>

<section class="block">
	<div class="section-head">
		<h2 class="title-large"><Icon name="person" size={22} class="primary-text" /> Velg deg selv</h2>
	</div>
	<div class="chip-row">
		{#each everyone as name (name)}
			<button
				type="button"
				class="chip"
				class:selected={me === name}
				class:rookie={me !== name && isRookie(name)}
				class:tonal={me !== name && !isRookie(name)}
				aria-pressed={me === name}
				onclick={() => pick(name)}>{name}</button
			>
		{/each}
	</div>
	{#if me}
		<div class="card me-card">
			<div class="card-head">
				<h3 class="title-medium">Din dag, {me}</h3>
				<span class="tag" class:rookie={isRookie(me)} class:primary={!isRookie(me)}>
					{isRookie(me) ? 'Rookie' : experienced.includes(me) ? 'Erfaren' : 'Med'}
				</span>
			</div>
			<ul class="facts">
				{#each summaryFor(me) as line, i (i)}<li>{line}</li>{/each}
			</ul>
			<p class="body-small on-surface-variant" style="margin-top: 0.6rem">
				Dine steg er uthevet under: {mine.map((i) => i + 1).join(', ')}.
			</p>
		</div>
	{/if}
</section>

<section class="block">
	<div class="card rack-card">
		<div>
			<h2 class="title-medium">Får Tiril tak i takstativ?</h2>
			<p class="body-small on-surface-variant">
				{rack ? 'Ja: 4 kajakker til på Tirils bil. Ingen ekstraturer.' : 'Nei: Carolines bil tar to korte ekstraturer.'}
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
		<h2 class="title-large"><Icon name="schedule" size={22} class="primary-text" /> Dagen, steg for steg</h2>
	</div>
	<ol class="timeline" class:filtered={!!me}>
		{#each day as step, i (i)}
			<li class="entry" class:mine={me && step.names.includes(me)}>
				<span class="when">Steg {i + 1}</span>
				<div class="what">
					<h3 class="title-medium">{step.what}</h3>
					{#if step.who}<p>{step.who}</p>{/if}
				</div>
			</li>
		{/each}
	</ol>
</section>

<section class="block">
	<div class="section-head">
		<h2 class="title-large"><Icon name="info" size={22} class="primary-text" /> Det vi vet</h2>
	</div>
	<ul class="facts">
		{#each facts(rack) as line, i (i)}<li>{line}</li>{/each}
	</ul>
</section>

<section class="block">
	<div class="section-head">
		<h2 class="title-large"><Icon name="localCafe" size={22} class="primary-text" /> Hvor man venter</h2>
	</div>
	<ul class="facts">
		{#each waiting as line, i (i)}<li>{line}</li>{/each}
	</ul>
</section>

<section class="block">
	<div class="section-head">
		<h2 class="title-large"><Icon name="explore" size={22} class="primary-text" /> Vurdering</h2>
	</div>
	<ol class="logic">
		{#each verdict as line, i (i)}<li>{line}</li>{/each}
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
				{#each experienced as name (name)}<span class="chip tonal">{name}</span>{/each}
			</div>
		</div>
		<div class="card">
			<div class="card-head">
				<h3 class="title-medium">Rookies · run 1</h3>
				<span class="tag rookie">{rookiesRun1.length}</span>
			</div>
			<div class="chip-row">
				{#each rookiesRun1 as name (name)}<span class="chip rookie">{name}</span>{/each}
			</div>
			<p class="body-small on-surface-variant" style="margin-top: 0.6rem">Kjører på run 2.</p>
		</div>
		<div class="card">
			<div class="card-head">
				<h3 class="title-medium">Rookies · run 2</h3>
				<span class="tag rookie">{rookiesRun2.length}</span>
			</div>
			<div class="chip-row">
				{#each rookiesRun2 as name (name)}<span class="chip rookie">{name}</span>{/each}
			</div>
			<p class="body-small on-surface-variant" style="margin-top: 0.6rem">Kjører på run 1.</p>
		</div>
	</div>
</section>
