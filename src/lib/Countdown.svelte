<script lang="ts">
	import { trip, tripIsOn, untilMeetup } from '$lib/config';

	/** Nedtelling til felles avreise. Oppdaterer seg hvert minutt mens siden er åpen. */
	let now = $state(new Date());

	$effect(() => {
		const timer = setInterval(() => (now = new Date()), 60_000);
		return () => clearInterval(timer);
	});

	const text = $derived.by(() => {
		const left = untilMeetup(now);
		if (left) return `Avreise om ${left}`;
		if (tripIsOn(now)) return 'Vi er på elva! 🎉';
		if (now.getTime() < new Date(`${trip.end}T23:59:59+02:00`).getTime()) return 'God tur!';
		return 'Takk for turen!';
	});
</script>

<span class="countdown">{text}</span>
