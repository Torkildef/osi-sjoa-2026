<script lang="ts">
	import { trip } from '$lib/config';

	/**
	 * Nedtelling, sekund for sekund mens siden er åpen.
	 * Uten props teller den til felles avreise. Send inn `to` for noe annet.
	 */
	let {
		to = trip.meetup.time,
		label = 'Avreise om',
		on = 'Vi er på elva! 🌊',
		done = 'Takk for turen! 🛶',
		until = `${trip.end}T23:59:59+02:00`
	}: { to?: string; label?: string; on?: string; done?: string; until?: string } = $props();

	let now = $state(new Date());

	$effect(() => {
		const timer = setInterval(() => (now = new Date()), 1000);
		return () => clearInterval(timer);
	});

	const target = $derived(new Date(to).getTime());
	const end = $derived(new Date(until).getTime());
	const left = $derived(Math.max(0, target - now.getTime()));
	const parts = $derived.by(() => {
		const total = Math.floor(left / 1000);
		return [
			{ label: 'dager', value: Math.floor(total / 86_400) },
			{ label: 'timer', value: Math.floor((total % 86_400) / 3600) },
			{ label: 'min', value: Math.floor((total % 3600) / 60) },
			{ label: 'sek', value: total % 60 }
		];
	});
	const phase = $derived(left > 0 ? 'before' : now.getTime() < end ? 'on' : 'after');
	const pad = (n: number) => String(n).padStart(2, '0');
</script>

<div class="countdown" role="timer" aria-live="off">
	{#if phase === 'before'}
		<div class="count-label">{label}</div>
		<div class="count-tiles">
			{#each parts as part (part.label)}
				<div class="count-tile">
					{#key part.value}
						<span class="count-num">{pad(part.value)}</span>
					{/key}
					<span class="count-unit">{part.label}</span>
				</div>
			{/each}
		</div>
	{:else if phase === 'on'}
		<div class="count-live"><span class="count-dot"></span> {on}</div>
	{:else}
		<div class="count-live">{done}</div>
	{/if}
</div>
