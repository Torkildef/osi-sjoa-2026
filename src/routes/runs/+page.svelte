<script lang="ts">
	import { enhance } from '$app/forms';
	import Icon from '$lib/Icon.svelte';
	import Linked from '$lib/Linked.svelte';
	import { trip } from '$lib/config';
	import {
		everyone,
		experienced,
		rookiesRun1,
		rookiesRun2,
		runs,
		steps,
		carNames,
		carPlan,
		isCar,
		planFor,
		planIcon,
		shown,
		teamLabel,
		teamOf
	} from '$lib/runs';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const KEY = 'sjoa:meg';
	let sending = $state(false);

	/** Hvem som ser på. Huskes i nettleseren. */
	let me = $state('');

	$effect(() => {
		try {
			const saved = localStorage.getItem(KEY);
			if (saved && (everyone.includes(saved) || isCar(saved))) me = saved;
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

	const day = steps();
	const car = $derived(me && isCar(me) ? carPlan(me) : undefined);
</script>

<svelte:head>
	<title>Lørdag på elva – {trip.title}</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="page-head">
	<div>
		<h1 class="headline-large">Lørdag på elva</h1>
		<p class="body-medium on-surface-variant">
			To runs. Bru-bru for alle, så Playrun for de erfarne. Rookiene padler ett run og har fri på det andre.
		</p>
	</div>
	<div class="chip-row">
		{#each runs as run (run.n)}
			<a class="chip link run{run.n}" href="/runs/{run.n}"><Icon name="kayaking" size={16} /> {run.title}</a>
		{/each}
	</div>
</div>

<div class="draft-banner">
	<span class="draft-emoji" aria-hidden="true">🚧</span>
	<div>
		<div class="title-medium">Foreløpig plan</div>
		<p class="body-medium">Kan endres. Velg deg selv og si fra.</p>
	</div>
</div>

<section class="block">
	<div class="section-head">
		<h2 class="title-large"><Icon name="person" size={22} class="primary-text" /> Velg deg selv, eller en bil</h2>
	</div>
	<div class="chip-row">
		{#each everyone as name (name)}
			<button
				type="button"
				class="chip {me === name ? 'me' : teamOf(name)}"
				aria-pressed={me === name}
				onclick={() => pick(name)}
			>
				{#if me === name}<Icon name="check" size={16} />{/if}{shown(name)}
			</button>
		{/each}
		{#each carNames as name (name)}
			<button
				type="button"
				class="chip {me === name ? 'me' : 'car'}"
				aria-pressed={me === name}
				onclick={() => pick(name)}
			>
				{#if me === name}<Icon name="check" size={16} />{:else}🚗{/if}
				{name}
			</button>
		{/each}
	</div>
	{#if car}
		<div class="card me-card">
			<div class="card-head">
				<h3 class="title-medium"><Icon name="directionsCar" size={20} /> {car.car}</h3>
				<span class="tag car">{car.legs.length} {car.legs.length === 1 ? 'etappe' : 'etapper'}</span>
			</div>
			{#if car.idle}
				<p class="body-medium">{car.idle}</p>
			{:else}
				<ol class="car-legs">
					{#each car.legs as leg, i (i)}
						<li class="car-leg">
							<span class="car-when"><span class="tag run{leg.run}">Run {leg.run}</span> <Linked text={leg.when} /></span>
							<span class="car-driver">
								{#if leg.parked}
									<span class="tag car">🅿️ Står</span>
								{:else}
									<span class="chip {teamOf(leg.driver)} small">🚗 {leg.driver}</span>
									{#if leg.own}<span class="tag success">Egen bil</span>{/if}
									{#if leg.alt?.length}<span class="car-alt">kan også: {leg.alt.join(', ')}</span>{/if}
								{/if}
							</span>
							{#if leg.note}<span class="car-note"><Linked text={leg.note} /></span>{/if}
						</li>
					{/each}
				</ol>
			{/if}
		</div>
	{:else if me}
		<div class="card me-card">
			<div class="card-head">
				<h3 class="title-medium"><Icon name="person" size={20} /> Din plan, {shown(me)}</h3>
				<span class="tag {teamOf(me) === 'none' ? 'primary' : teamOf(me)}">{teamLabel[teamOf(me)]}</span>
			</div>
			<div class="plan-parts">
				{#each planFor(me) as part (part.title)}
					<div class="plan-part {part.tone}">
						<span class="tag {part.tone}">{part.title}</span>
						<div class="plan-lines">
							{#each part.lines as line, i (i)}
								<div class="plan-line {line.kind}">
									<span class="plan-icon" aria-hidden="true">{planIcon[line.kind]}</span>
									<span>
										{#if line.when}<span class="plan-when"><Linked text={line.when} /></span>{/if}
										<Linked text={line.text} />
									</span>
								</div>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		</div>

		{#if data.configured}
			<form
				method="POST"
				action="?/submit"
				class="card admin-form change-form"
				use:enhance={() => {
					sending = true;
					return async ({ update }) => {
						await update({ reset: true });
						sending = false;
					};
				}}
			>
				<input type="hidden" name="name" value={me} />
				<input type="text" name="nettside" tabindex="-1" autocomplete="off" class="honey" aria-hidden="true" />
				<label class="field">
					<span class="field-title">Noe som bør endres, <strong>{me}</strong>?</span>
					<textarea
						name="text"
						rows="3"
						maxlength="500"
						placeholder="F.eks. «Jeg vil ikke padle run 2», «Jeg vil helst ikke kjøre med henger», «Bytt Caroline og Helene til gruppe 3» eller «Gi meg en blomsteremoji»"
						required>{form?.ok ? '' : (form?.text ?? '')}</textarea
					>
				</label>
				{#if form?.error}
					<p class="notice error"><Icon name="error" size={20} /> {form.error}</p>
				{/if}
				{#if form?.ok}
					<p class="notice info">
						<Icon name="checkCircle" size={20} />
						<span>
							{#if form.issue}
								Mottatt som <a href={form.issue.url} target="_blank" rel="noopener">#{form.issue.number}</a>.
							{:else}
								Mottatt.
							{/if}
							Inne i planen om ca. 5 minutter hvis det går opp.
						</span>
					</p>
				{/if}
				<div class="form-row">
					{#if !data.loggedIn}
						<label class="field inline">
							<span>Passord</span>
							<input type="password" name="password" autocomplete="current-password" required />
						</label>
					{/if}
					<button type="submit" class="btn btn-filled" disabled={sending}>
						{sending ? 'Sender …' : 'Send inn'}
					</button>
				</div>
				<p class="body-small on-surface-variant">
					Inne i planen om ca. 5 minutter hvis det går opp. Gjelder også ønsker for andre. Ellers får du beskjed.
				</p>
			</form>
		{/if}
	{/if}
</section>

<section class="block">
	<div class="section-head">
		<h2 class="title-large"><Icon name="groups" size={22} class="primary-text" /> Grupper</h2>
	</div>
	<div class="grid wide">
		<div class="card">
			<div class="card-head">
				<h3 class="title-medium">Erfarne · begge runs</h3>
				<span class="tag exp">{experienced.length}</span>
			</div>
			<div class="chip-row">
				{#each experienced as name (name)}<span class="chip exp">{shown(name)}</span>{/each}
			</div>
		</div>
		<div class="card">
			<div class="card-head">
				<h3 class="title-medium">Rookies · run 1</h3>
				<span class="tag rookie1">{rookiesRun1.length}</span>
			</div>
			<div class="chip-row">
				{#each rookiesRun1 as name (name)}<span class="chip rookie1">{shown(name)}</span>{/each}
			</div>
			<p class="body-small on-surface-variant" style="margin-top: 0.6rem">Fri på run 2.</p>
		</div>
		<div class="card">
			<div class="card-head">
				<h3 class="title-medium">Rookies · run 2</h3>
				<span class="tag rookie2">{rookiesRun2.length}</span>
			</div>
			<div class="chip-row">
				{#each rookiesRun2 as name (name)}<span class="chip rookie2">{shown(name)}</span>{/each}
			</div>
			<p class="body-small on-surface-variant" style="margin-top: 0.6rem">Fri på run 1.</p>
		</div>
	</div>
</section>

<section class="block">
	<div class="section-head">
		<h2 class="title-large"><Icon name="schedule" size={22} class="primary-text" /> Dagen, steg for steg</h2>
	</div>
	<ol class="timeline" class:filtered={!!me && !car}>
		{#each day as step, i (i)}
			<li class="entry" class:mine={me && step.names.includes(me)}>
				<span class="when">Steg {i + 1}</span>
				<div class="what">
					<h3 class="title-medium"><Linked text={step.what} /></h3>
					{#if step.who}<p><Linked text={step.who} /></p>{/if}
					{#if me && step.drivers?.includes(me)}<span class="tag drive">🚗 Du kjører</span>{/if}
				</div>
			</li>
		{/each}
	</ol>
</section>
