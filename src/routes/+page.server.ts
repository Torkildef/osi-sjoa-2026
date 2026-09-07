import { TRIP_DATA_KEY, loadTripData } from '$lib/data';
import { syncIfStale } from '$lib/server/formSync';
import { toPublicTripData } from '$lib/server/publicView';
import { supabaseAdmin } from '$lib/server/supabase';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ depends }) => {
	// Realtime kaller invalidate(TRIP_DATA_KEY) og kjører denne på nytt.
	depends(TRIP_DATA_KEY);

	// Henter nye skjemasvar dersom det er over et minutt siden sist. Det holder
	// oversikten fersk uten en planlagt jobb, og kaster aldri om Google er nede.
	await syncIfStale();

	try {
		return { trip: toPublicTripData(await loadTripData(supabaseAdmin)), loadFailed: false };
	} catch {
		// Er Supabase nede, viser vi fortsatt nøkkelinfo om turen framfor en feilside.
		const { EMPTY_TRIP_DATA } = await import('$lib/data');
		return { trip: EMPTY_TRIP_DATA, loadFailed: true };
	}
};
