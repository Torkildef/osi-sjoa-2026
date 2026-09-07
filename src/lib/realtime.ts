import { invalidate } from '$app/navigation';
import { REALTIME_TABLES, TRIP_DATA_KEY } from './data';
import { supabase } from './supabase';

export type RealtimeState = 'connecting' | 'live' | 'offline';

/**
 * Abonnerer på endringer i alle relevante tabeller og ber SvelteKit hente data
 * på nytt. Vi laster hele datasettet om igjen framfor å flette inn enkeltrader –
 * enklere, og billig nok når det er snakk om 25 deltakere.
 *
 * Returnerer en oppryddingsfunksjon ment for $effect.
 */
export function subscribeToTripData(onState: (state: RealtimeState) => void) {
	const channel = supabase.channel('sjoa-oversikt');

	for (const table of REALTIME_TABLES) {
		channel.on('postgres_changes', { event: '*', schema: 'public', table }, () => {
			invalidate(TRIP_DATA_KEY);
		});
	}

	channel.subscribe((status) => {
		if (status === 'SUBSCRIBED') onState('live');
		else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED')
			onState('offline');
		else onState('connecting');
	});

	return () => {
		supabase.removeChannel(channel);
	};
}
