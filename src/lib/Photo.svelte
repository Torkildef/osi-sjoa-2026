<script lang="ts">
	let {
		src,
		alt,
		caption,
		class: className = ''
	}: { src: string; alt: string; caption?: string; class?: string } = $props();

	// Bildene legges inn av arrangørene etter hvert. Mangler filen, skal siden se hel
	// ut framfor å vise et brukket bildeikon.
	let failed = $state(false);
</script>

{#if !failed}
	<figure class="photo {className}">
		<img {src} {alt} loading="lazy" onerror={() => (failed = true)} />
		{#if caption}<figcaption class="muted small">{caption}</figcaption>{/if}
	</figure>
{/if}
