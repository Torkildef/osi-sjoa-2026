<script lang="ts">
	import { base } from '$app/paths';

	type Slide = { title: string; points?: string[]; link?: boolean };

	const slides: Slide[] = [
		{ title: 'Faglig innlegg' },
		{ title: 'Elvepadling' },
		{ title: 'Arrangement nettside' },
		{ title: 'Verktøy', points: ['GitHub-konto', 'Claude Pro-abonnement', 'Vercel – gratis konto'] },
		{ title: 'Til nettsiden', link: true }
	];

	let i = $state(0);
	const slide = $derived(slides[i]);

	function go(d: number) {
		i = Math.min(slides.length - 1, Math.max(0, i + d));
	}

	function onkey(e: KeyboardEvent) {
		if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') go(1);
		else if (e.key === 'ArrowLeft' || e.key === 'PageUp') go(-1);
	}
</script>

<svelte:head>
	<title>Faglig innlegg</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<svelte:window onkeydown={onkey} />

<section class="slide" aria-live="polite">
	<h1 class={i === 0 ? 'display-medium' : 'headline-large'}>{slide.title}</h1>
	{#if slide.points}
		<ul class="points">
			{#each slide.points as p (p)}<li class="title-large">{p}</li>{/each}
		</ul>
	{/if}
	{#if slide.link}
		<p><a class="title-large" href="{base}/">Gå til hovedsiden</a></p>
	{/if}
</section>

<nav class="controls" aria-label="Lysbilder">
	<button type="button" onclick={() => go(-1)} disabled={i === 0}>← Forrige</button>
	<span class="body-medium">{i + 1} / {slides.length}</span>
	<button type="button" onclick={() => go(1)} disabled={i === slides.length - 1}>Neste →</button>
</nav>

<style>
	.slide {
		min-height: 55vh;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		text-align: center;
		gap: 1.5rem;
	}
	.points {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: 0.75rem;
	}
	.controls {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 1.5rem;
		margin-top: 1.5rem;
	}
	button {
		font: inherit;
		padding: 0.6rem 1.2rem;
		border-radius: 999px;
		border: 1px solid currentColor;
		background: transparent;
		color: inherit;
		cursor: pointer;
	}
	button:disabled {
		opacity: 0.35;
		cursor: default;
	}
</style>
