-- ===========================================================================
--  Sjoa 2026 – komplett databaseoppsett
--
--  Lim hele denne filen inn i Supabase SQL Editor og trykk Run.
--
--  Scriptet tilsvarer alle migrasjonene i supabase/migrations/ samlet, og er
--  skrevet slik at det er trygt å kjøre om igjen: har du allerede kjørt deler
--  av oppsettet, hopper det bare over det som finnes fra før. Det sletter
--  aldri data.
-- ===========================================================================

create extension if not exists "pgcrypto";

-- --- Typer ----------------------------------------------------------------

do $$
begin
    if not exists (select 1 from pg_type where typname = 'participant_status') then
        create type participant_status as enum ('confirmed', 'waitlist', 'cancelled');
    end if;
end $$;

-- --- Tabeller -------------------------------------------------------------

create table if not exists participants (
    id                       uuid primary key default gen_random_uuid(),
    name                     text not null check (length(btrim(name)) > 0),
    email                    text unique check (position('@' in email) > 1),
    phone                    text,
    status                   participant_status not null default 'confirmed',
    paid                     boolean not null default false,
    accommodation_preference text,
    notes                    text,
    created_at               timestamptz not null default now()
);

-- Kolonner fra skjemasynken. Egen ALTER slik at eldre oppsett også får dem.
alter table participants
    add column if not exists form_key     text unique,
    add column if not exists form_answers jsonb,
    add column if not exists source       text not null default 'manuell';

-- Skjemaet har ikke nødvendigvis en e-postkolonne, så e-post kan ikke kreves.
alter table participants alter column email drop not null;

create index if not exists participants_status_idx on participants (status);

create table if not exists transport (
    id                    uuid primary key default gen_random_uuid(),
    driver_participant_id uuid not null unique references participants (id) on delete cascade,
    departure_location    text not null,
    departure_time        timestamptz,
    seats_total           integer not null default 0 check (seats_total >= 0),
    created_at            timestamptz not null default now()
);

create table if not exists transport_passengers (
    transport_id   uuid not null references transport (id) on delete cascade,
    participant_id uuid not null unique references participants (id) on delete cascade,
    primary key (transport_id, participant_id)
);

create table if not exists accommodation (
    id       uuid primary key default gen_random_uuid(),
    name     text not null unique check (length(btrim(name)) > 0),
    capacity integer not null default 0 check (capacity >= 0)
);

create table if not exists accommodation_assignments (
    accommodation_id uuid not null references accommodation (id) on delete cascade,
    participant_id   uuid not null unique references participants (id) on delete cascade,
    primary key (accommodation_id, participant_id)
);

create table if not exists announcements (
    id         uuid primary key default gen_random_uuid(),
    message    text not null check (length(btrim(message)) > 0),
    created_by text,
    created_at timestamptz not null default now()
);

create index if not exists announcements_created_at_idx on announcements (created_at desc);

create table if not exists form_sync_state (
    id              boolean primary key default true check (id),
    last_synced_at  timestamptz,
    last_error      text,
    last_row_count  integer,
    last_added      integer,
    columns         text[]
);

insert into form_sync_state (id) values (true) on conflict (id) do nothing;

-- --- Views ----------------------------------------------------------------
-- Ledige plasser lagres ikke, men regnes ut, så tallene aldri kommer i utakt
-- med hvem som faktisk er plassert.

create or replace view transport_overview with (security_invoker = true) as
select t.id,
       t.driver_participant_id,
       t.departure_location,
       t.departure_time,
       t.seats_total,
       t.seats_total - coalesce(p.taken, 0) as seats_available
from transport t
         left join (select transport_id, count(*) as taken
                    from transport_passengers
                    group by transport_id) p on p.transport_id = t.id;

create or replace view accommodation_overview with (security_invoker = true) as
select a.id,
       a.name,
       a.capacity,
       a.capacity - coalesce(x.taken, 0) as capacity_available
from accommodation a
         left join (select accommodation_id, count(*) as taken
                    from accommodation_assignments
                    group by accommodation_id) x on x.accommodation_id = a.id;

grant select on transport_overview to anon, authenticated;
grant select on accommodation_overview to anon, authenticated;

-- --- Tilgangsstyring ------------------------------------------------------
-- Nettleseren bruker anon-nøkkelen, som ligger åpent i frontend-koden. Derfor
-- er anon strengt lesetilgang; all skriving går gjennom SvelteKit sine form
-- actions med service role-nøkkelen, som går utenom RLS.

do $$
declare
    t text;
begin
    foreach t in array array['participants', 'transport', 'transport_passengers',
                             'accommodation', 'accommodation_assignments',
                             'announcements', 'form_sync_state']
        loop
            execute format('alter table public.%I enable row level security', t);
            execute format('drop policy if exists "les for alle" on public.%I', t);
            execute format('create policy "les for alle" on public.%I for select using (true)', t);
        end loop;
end $$;

-- Ingen insert/update/delete-policyer: service role er eneste vei inn.

-- --- Realtime -------------------------------------------------------------
-- form_sync_state er bevisst utelatt: den skrives hvert minutt, og ville fått
-- alle åpne nettlesere til å hente data på nytt uten at noe er endret.

do $$
declare
    t text;
begin
    if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
        create publication supabase_realtime;
    end if;

    foreach t in array array['participants', 'transport', 'transport_passengers',
                             'accommodation', 'accommodation_assignments', 'announcements']
        loop
            if not exists (select 1
                           from pg_publication_tables
                           where pubname = 'supabase_realtime'
                             and schemaname = 'public'
                             and tablename = t) then
                execute format('alter publication supabase_realtime add table public.%I', t);
            end if;
        end loop;
end $$;

-- --- Startinnhold ---------------------------------------------------------
-- Bytt navn og kapasitet til hyttene dere faktisk har booket.

insert into accommodation (name, capacity)
values ('Hytte A', 8),
       ('Hytte B', 8),
       ('Hytte C', 9)
on conflict (name) do nothing;

-- --- Kvittering -----------------------------------------------------------

select 'Oppsett fullført.'                                             as status,
       (select count(*) from information_schema.tables
        where table_schema = 'public'
          and table_name in ('participants', 'transport', 'transport_passengers',
                             'accommodation', 'accommodation_assignments',
                             'announcements', 'form_sync_state'))       as tabeller_av_7,
       (select count(*) from pg_publication_tables
        where pubname = 'supabase_realtime' and schemaname = 'public')  as realtime_tabeller,
       (select count(*) from accommodation)                             as overnattingssteder;
