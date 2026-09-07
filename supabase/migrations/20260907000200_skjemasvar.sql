-- Påmelding skjer nå i et Google-skjema. Svarene synkes inn hit fra regnearket
-- skjemaet skriver til, slik at samkjøring, overnatting og betalt-markering
-- fortsatt kan henge på den samme deltakerraden.

-- Skjemaet eier ikke nødvendigvis en e-postkolonne, så e-post kan ikke lenger kreves.
alter table participants alter column email drop not null;

alter table participants
    -- Naturlig nøkkel fra regnearket (e-post om den finnes, ellers navn). Gjør synken
    -- idempotent: samme rad i arket treffer samme deltaker hver gang.
    add column form_key text unique,
    -- Hele svaret som det står i arket, så vi kan vise kolonner vi ikke kjenner på forhånd.
    add column form_answers jsonb,
    add column source text not null default 'manuell';

-- Én rad som holder styr på siste synk, slik at flere serverinstanser deler samme
-- tidsstempel og vi ikke henter regnearket på nytt for hvert sidevisning.
create table form_sync_state (
    id              boolean primary key default true check (id),
    last_synced_at  timestamptz,
    last_error      text,
    last_row_count  integer,
    last_added      integer,
    -- Kolonnenavnene i den rekkefølgen de står i regnearket. jsonb sorterer om på
    -- nøklene sine, så uten dette ville svartabellen fått en tilfeldig kolonnerekkefølge.
    columns         text[]
);

insert into form_sync_state (id) values (true);

alter table form_sync_state enable row level security;
create policy "les for alle" on form_sync_state for select using (true);

-- form_sync_state er bevisst holdt utenfor supabase_realtime: den skrives hvert minutt,
-- og ville fått alle åpne nettlesere til å hente data på nytt uten at noe er endret.
