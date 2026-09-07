import type { SupabaseClient } from '@supabase/supabase-js';
import type { TripData } from './types';

/** Cache-nøkkel for invalidate() når Realtime melder om endringer. */
export const TRIP_DATA_KEY = 'sjoa:data';

/** Henter hele datasettet i én runde. 25 deltakere er lite nok til at det er greit. */
export async function loadTripData(client: SupabaseClient): Promise<TripData> {
	const [participants, transport, transportPassengers, accommodation, assignments, announcements] =
		await Promise.all([
			client.from('participants').select('*').order('name'),
			client.from('transport_overview').select('*').order('departure_time'),
			client.from('transport_passengers').select('*'),
			client.from('accommodation_overview').select('*').order('name'),
			client.from('accommodation_assignments').select('*'),
			client.from('announcements').select('*').order('created_at', { ascending: false })
		]);

	for (const result of [
		participants,
		transport,
		transportPassengers,
		accommodation,
		assignments,
		announcements
	]) {
		if (result.error) throw new Error(result.error.message);
	}

	return {
		participants: participants.data ?? [],
		transport: transport.data ?? [],
		transportPassengers: transportPassengers.data ?? [],
		accommodation: accommodation.data ?? [],
		accommodationAssignments: assignments.data ?? [],
		announcements: announcements.data ?? []
	} as TripData;
}

/** Tabellene oversikten avhenger av – alle er med i supabase_realtime-publikasjonen. */
export const REALTIME_TABLES = [
	'participants',
	'transport',
	'transport_passengers',
	'accommodation',
	'accommodation_assignments',
	'announcements'
] as const;

export const EMPTY_TRIP_DATA: TripData = {
	participants: [],
	transport: [],
	transportPassengers: [],
	accommodation: [],
	accommodationAssignments: [],
	announcements: []
};
