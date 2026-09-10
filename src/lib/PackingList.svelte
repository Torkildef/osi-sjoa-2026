<script lang="ts">
	import Icon from './Icon.svelte';
	import { PACKING_KEY, packing } from './packing';

	/** Hva som er krysset av. Leses fra nettleseren etter at siden er lastet. */
	let checked = $state<Set<string>>(new Set());

	$effect(() => {
		try {
			const saved = localStorage.getItem(PACKING_KEY);
			if (saved) checked = new Set(JSON.parse(saved) as string[]);
		} catch {
			// Ingen lagring tilgjengelig – lista virker fortsatt, bare uten å huske.
		}
	});

	function toggle(id: string) {
		const next = new Set(checked);
		if (next.has(id)) next.delete(id);
		else next.add(id);
		checked = next;
		try {
			localStorage.setItem(PACKING_KEY, JSON.stringify([...next]));
		} catch {
			// Se over.
		}
	}

	function reset() {
		checked = new Set();
		try {
			localStorage.removeItem(PACKING_KEY);
		} catch {
			// Se over.
		}
	}

	const done = $derived(checked.size);
	const all = $derived(done === packing.length);
</script>

<div class="card packing" class:all>
	<div class="card-head">
		<h3 class="title-medium">
			{#if all}🎉 Alt pakket!{:else}{done} av {packing.length} pakket{/if}
		</h3>
		{#if done > 0}
			<button type="button" class="btn btn-text btn-small" onclick={reset}>Nullstill</button>
		{/if}
	</div>
	<ul class="packing-list">
		{#each packing as item (item.id)}
			<li>
				<label class="packing-item" class:checked={checked.has(item.id)}>
					<input type="checkbox" checked={checked.has(item.id)} onchange={() => toggle(item.id)} />
					<span class="packing-box"><Icon name="check" size={16} /></span>
					<span class="packing-emoji">{item.emoji}</span>
					<span class="packing-text">
						<span class="packing-label">{item.label}</span>
						{#if item.note}<span class="packing-note">{item.note}</span>{/if}
					</span>
				</label>
			</li>
		{/each}
	</ul>
</div>
