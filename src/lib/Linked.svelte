<script lang="ts">
	import { linkify } from '$lib/runs';

	let { text }: { text: string } = $props();
</script>

{#each linkify(text) as seg, i (i)}{#if seg.href}<a href={seg.href}>{seg.text}</a>{:else}{seg.text}{/if}{/each}
