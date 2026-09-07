-- OSI Elvepadling – Sjoa 2026
-- Grunnskjema for deltakere, samkjøring, overnatting og kunngjøringer.

create extension if not exists "pgcrypto";

-- Status på en påmelding.
create type participant_status as enum ('confirmed', 'waitlist', 'cancelled');

create table participants (
    id                       uuid primary key default gen_random_uuid(),
    name                     text not null check (length(btrim(name)) > 0),
    email                    text not null unique check (position('@' in email) > 1),
    phone                    text,
    status                   participant_status not null default 'confirmed',
    paid                     boolean not null default false,
    -- Ønske oppgitt ved påmelding. Selve tildelingen ligger i accommodation_assignments.
    accommodation_preference text,
    notes                    text,
    created_at               timestamptz not null default now()
);

create index participants_status_idx on participants (status);

-- Én rad per bil. seats_available regnes ut fra seats_total minus antall passasjerer,
-- se viewet transport_overview – vi lagrer aldri to tall som kan komme i utakt.
create table transport (
    id                    uuid primary key default gen_random_uuid(),
    driver_participant_id uuid not null unique references participants (id) on delete cascade,
    departure_location    text not null,
    departure_time        timestamptz,
    seats_total           integer not null default 0 check (seats_total >= 0),
    created_at            timestamptz not null default now()
);

create table transport_passengers (
    transport_id   uuid not null references transport (id) on delete cascade,
    -- En deltaker kan bare sitte på i én bil.
    participant_id uuid not null unique references participants (id) on delete cascade,
    primary key (transport_id, participant_id)
);

create table accommodation (
    id       uuid primary key default gen_random_uuid(),
    name     text not null unique check (length(btrim(name)) > 0),
    capacity integer not null default 0 check (capacity >= 0)
);

create table accommodation_assignments (
    accommodation_id uuid not null references accommodation (id) on delete cascade,
    -- En deltaker bor bare ett sted.
    participant_id   uuid not null unique references participants (id) on delete cascade,
    primary key (accommodation_id, participant_id)
);

create table announcements (
    id         uuid primary key default gen_random_uuid(),
    message    text not null check (length(btrim(message)) > 0),
    created_by text,
    created_at timestamptz not null default now()
);

create index announcements_created_at_idx on announcements (created_at desc);

-- Ledige plasser per bil, avledet slik at tallet alltid stemmer.
create view transport_overview with (security_invoker = true) as
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

-- Ledig kapasitet per hytte.
create view accommodation_overview with (security_invoker = true) as
select a.id,
       a.name,
       a.capacity,
       a.capacity - coalesce(x.taken, 0) as capacity_available
from accommodation a
         left join (select accommodation_id, count(*) as taken
                    from accommodation_assignments
                    group by accommodation_id) x on x.accommodation_id = a.id;
