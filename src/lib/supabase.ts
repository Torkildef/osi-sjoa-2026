import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';

/**
 * Leseklient for nettleseren. Anon-nøkkelen er offentlig, og RLS gir den kun
 * lesetilgang – skriving går gjennom form actions på serveren.
 */
export const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
	auth: { persistSession: false }
});
