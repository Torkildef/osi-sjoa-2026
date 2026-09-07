# Sjoa 2026 – OSI Elvepadling

Logistikkside for elvepadlingsturen til Sjoa: påmelding, samkjøring, overnatting og
kunngjøringer, med sanntidsoppdatering for alle som har siden åpen.

- **Oversikt** (`/`) – nøkkeltall, deltakerliste, biler, hytter og kunngjøringer.
- **Påmelding** (`/pamelding`) – melde seg på eller av, oppgi bil og overnattingsønske.
- **Admin** (`/admin`) – arrangørene redigerer samkjøring og overnatting, markerer betalt
  og legger ut kunngjøringer. Beskyttet med ett delt passord.

Stack: SvelteKit + TypeScript, Supabase (Postgres, PostgREST og Realtime), hostet på Vercel.

## Om arkitekturen

Lesing skjer direkte fra Supabase med anon-nøkkelen, og Realtime holder sidene oppdatert
uten manuell refresh.

**Skriving går gjennom SvelteKit sine form actions**, ikke direkte fra nettleseren. Grunnen
er at anon-nøkkelen ligger åpent i frontend-koden: hadde den hatt skrivetilgang, kunne hvem
som helst markert seg selv som betalt eller lagt ut kunngjøringer i klubbens navn. Derfor gir
RLS anon kun lesetilgang, og serveren bruker service role-nøkkelen for alle endringer. Dette
er fortsatt ingen egen backend – det er den samme SvelteKit-appen som kjører på Vercel – men
det avviker fra «skriv direkte til Supabase» i den opprinnelige skissen. Skjemaene fungerer
som en bonus også uten JavaScript.

## Lokal utvikling

```sh
npm install
cp .env.example .env   # fyll inn verdiene fra Supabase
npm run dev
```

Appen kjører på http://localhost:5173.

Nyttige kommandoer:

```sh
npm run check    # typesjekk (svelte-check)
npm run build    # produksjonsbygg
npm run preview  # se på produksjonsbygget lokalt
```

## Sette opp Supabase

1. Opprett et prosjekt på [supabase.com](https://supabase.com).
2. Kjør migrasjonene i `supabase/migrations/` i rekkefølge. Enten via SQL Editor
   (kopier inn innholdet i hver fil), eller med Supabase CLI:

   ```sh
   npx supabase link --project-ref <prosjekt-ref>
   npx supabase db push
   ```

3. Valgfritt: kjør `supabase/seed.sql` for å legge inn hyttene som utgangspunkt.
4. Hent `Project URL`, `anon`-nøkkelen og `service_role`-nøkkelen under
   **Project Settings → API**, og legg dem i `.env`.

Migrasjonene setter opp tabellene, slår på Row Level Security med lesetilgang for alle,
og legger tabellene til i `supabase_realtime`-publikasjonen.

## Datamodell

| Tabell                      | Innhold                                                             |
| --------------------------- | ------------------------------------------------------------------- |
| `participants`              | Navn, e-post (unik), telefon, status, betalt, overnattingsønske, notat |
| `transport`                 | Én rad per bil: sjåfør, avreisested, tidspunkt, antall plasser        |
| `transport_passengers`      | Hvem som sitter på med hvem                                          |
| `accommodation`             | Hytter med kapasitet                                                 |
| `accommodation_assignments` | Hvem som bor hvor                                                    |
| `announcements`             | Meldinger fra arrangørene                                            |

`seats_available` og `capacity_available` lagres ikke, men regnes ut i viewene
`transport_overview` og `accommodation_overview`, slik at tallene aldri kommer i utakt med
hvem som faktisk er plassert.

## Turinformasjon

Datoer, sted, pris og kontaktadresse ligger i [`src/lib/config.ts`](src/lib/config.ts).
Rediger der og deploy på nytt.

## Deploy til Vercel

1. Importer GitHub-repoet i Vercel. Framework detekteres som SvelteKit.
2. Legg inn de fire miljøvariablene fra `.env.example` under **Settings → Environment
   Variables** (for Production, Preview og Development).
3. Push til `main` – Vercel bygger og deployer automatisk.

`ADMIN_PASSWORD` og `SUPABASE_SERVICE_ROLE_KEY` må ikke ha `PUBLIC_`-prefiks; SvelteKit
nekter å bygge hvis private variabler importeres i kode som havner i nettleseren.

## Videre arbeid

Ideer som bevisst er utelatt for å holde ting enkelt: maks antall deltakere med automatisk
venteliste, ekstra felter for erfaringsnivå og allergier, og en pakkeliste. Alt tre er små
tillegg i `participants` pluss et felt i påmeldingsskjemaet.
