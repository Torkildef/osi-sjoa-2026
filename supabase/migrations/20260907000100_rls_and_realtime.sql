-- Tilgangsstyring.
--
-- Nettleseren snakker med Supabase med anon-nøkkelen, og den nøkkelen ligger åpent
-- i frontend-koden. Derfor er anon strengt lesetilgang: alle skriveoperasjoner går
-- gjennom SvelteKit sine form actions på serveren, som bruker service role-nøkkelen.
-- Uten dette kunne hvem som helst med nøkkelen markert seg selv som betalt eller
-- lagt ut kunngjøringer.

alter table participants enable row level security;
alter table transport enable row level security;
alter table transport_passengers enable row level security;
alter table accommodation enable row level security;
alter table accommodation_assignments enable row level security;
alter table announcements enable row level security;

create policy "les for alle" on participants for select using (true);
create policy "les for alle" on transport for select using (true);
create policy "les for alle" on transport_passengers for select using (true);
create policy "les for alle" on accommodation for select using (true);
create policy "les for alle" on accommodation_assignments for select using (true);
create policy "les for alle" on announcements for select using (true);

-- Ingen insert/update/delete-policyer: service role går utenom RLS og er eneste vei inn.

grant select on transport_overview to anon, authenticated;
grant select on accommodation_overview to anon, authenticated;

-- Realtime: frontend abonnerer på endringer i disse tabellene og henter data på nytt.
alter publication supabase_realtime add table participants;
alter publication supabase_realtime add table transport;
alter publication supabase_realtime add table transport_passengers;
alter publication supabase_realtime add table accommodation;
alter publication supabase_realtime add table accommodation_assignments;
alter publication supabase_realtime add table announcements;
