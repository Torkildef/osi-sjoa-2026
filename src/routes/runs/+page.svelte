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
		planFor,
		planIcon,
		teamLabel,
		teamOf
	} from '$lib/runs';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const KEY = 'sjoa:meg';
	let sending = $state(false);

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
			To runs. Bru-bru for alle, så Playrun for de erfarne. Rookiene padler ett run og venter på Kruke på det andre.
		</p>
	</div>
	<div class="chip-row">
		{#each runs as run (run.n)}
			<a class="chip link" href="/runs/{run.n}"><Icon name="kayaking" size={16} /> {run.title}</a>
		{/each}
	</div>
</div>

<div class="draft-banner">
	<span class="draft-emoji" aria-hidden="true">🚧</span>
	<div>
		<div class="title-medium">Foreløpig plan</div>
		<p class="body-medium">
			Dette er et utkast og kan endres. Velg deg selv under og skriv hva som bør være annerledes, så
			oppdateres planen.
		</p>
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
				class="chip {me === name ? 'me' : teamOf(name)}"
				aria-pressed={me === name}
				onclick={() => pick(name)}
			>
				{#if me === name}<Icon name="check" size={16} />{/if}{name}
			</button>
		{/each}
	</div>
	{#if me}
		<div class="card me-card">
			<div class="card-head">
				<h3 class="title-medium"><Icon name="person" size={20} /> Din plan, {me}</h3>
				<span class="tag {teamOf(me) === 'none' ? 'primary' : teamOf(me)}">{teamLabel[teamOf(me)]}</span>
			</div>
			<div class="plan-parts">
				{#each planFor(me) as part (part.title)}
					<div class="plan-part {part.tone}">
						<span class="tag {part.tone === 'morning' ? 'primary' : part.tone}">{part.title}</span>
						<div class="plan-lines">
							{#each part.lines as line, i (i)}
								<div class="plan-line {line.kind}">
									<span class="plan-icon" aria-hidden="true">{planIcon[line.kind]}</span>
									<span><Linked text={line.text} /></span>
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
					<span>Noe som bør endres, {me}?</span>
					<textarea
						name="text"
						rows="3"
						maxlength="500"
						placeholder="F.eks. «Jeg vil ikke padle run 2», «Jeg vil helst ikke kjøre med henger» eller «Caroline sa hun ikke vil padle Playrun»"
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
							Planen oppdateres innen en time hvis det går opp.
						</span>
					</p>
				{/if}
				<div class="form-row">
					<button type="submit" class="btn btn-filled" disabled={sending}>
						{sending ? 'Sender …' : 'Send inn'}
					</button>
					<span class="body-small on-surface-variant">
						Går rett inn i planen hvis det ikke er noe rart med det. Ellers får du beskjed.
					</span>
				</div>
			</form>
		{/if}
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
					<h3 class="title-medium"><Linked text={step.what} /></h3>
					{#if step.who}<p><Linked text={step.who} /></p>{/if}
					{#if me && step.drivers?.includes(me)}<span class="tag drive">🚗 Du kjører</span>{/if}
				</div>
			</li>
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
				<span class="tag exp">{experienced.length}</span>
			</div>
			<div class="chip-row">
				{#each experienced as name (name)}<span class="chip exp">{name}</span>{/each}
			</div>
		</div>
		<div class="card">
			<div class="card-head">
				<h3 class="title-medium">Rookies · run 1</h3>
				<span class="tag rookie1">{rookiesRun1.length}</span>
			</div>
			<div class="chip-row">
				{#each rookiesRun1 as name (name)}<span class="chip rookie1">{name}</span>{/each}
			</div>
			<p class="body-small on-surface-variant" style="margin-top: 0.6rem">Venter på Kruke på run 2.</p>
		</div>
		<div class="card">
			<div class="card-head">
				<h3 class="title-medium">Rookies · run 2</h3>
				<span class="tag rookie2">{rookiesRun2.length}</span>
			</div>
			<div class="chip-row">
				{#each rookiesRun2 as name (name)}<span class="chip rookie2">{name}</span>{/each}
			</div>
			<p class="body-small on-surface-variant" style="margin-top: 0.6rem">Venter på Kruke på run 1.</p>
		</div>
	</div>
</section>
