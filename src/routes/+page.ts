import { EMPTY_TRIP_DATA, TRIP_DATA_KEY, loadTripData } from '$lib/data';
import { supabase } from '$lib/supabase';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ depends }) => {
	// Realtime kaller invalidate(TRIP_DATA_KEY) og kjører denne på nytt.
	depends(TRIP_DATA_KEY);

	try {
		return { trip: await loadTripData(supabase), loadFailed: false };
	} catch {
		// Er Supabase nede, viser vi fortsatt nøkkelinfo om turen framfor en feilside.
		return { trip: EMPTY_TRIP_DATA, loadFailed: true };
	}
};
