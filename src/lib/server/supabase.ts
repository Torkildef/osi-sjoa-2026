import { createClient } from '@supabase/supabase-js';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';

/**
 * Skriveklient. Service role-nøkkelen går utenom RLS, så denne modulen må aldri
 * importeres fra kode som havner i nettleseren ($lib/server er sperret av SvelteKit).
 */
export const supabaseAdmin = createClient(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
	auth: { persistSession: false, autoRefreshToken: false }
});
