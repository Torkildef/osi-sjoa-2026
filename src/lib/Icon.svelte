<script lang="ts">
	import { icons, type IconName } from './icons';

	/**
	 * Ett Material Symbol som inline-SVG. Arver farge fra teksten rundt, og
	 * størrelse fra `size` (i piksler) eller `font-size` via 1em.
	 */
	let {
		name,
		size = 24,
		label,
		class: className = ''
	}: { name: IconName; size?: number | string; label?: string; class?: string } = $props();
</script>

<svg
	class="icon {className}"
	viewBox="0 -960 960 960"
	width={size}
	height={size}
	fill="currentColor"
	aria-hidden={label ? undefined : 'true'}
	role={label ? 'img' : undefined}
	aria-label={label}
>
	<path d={icons[name]} />
</svg>
