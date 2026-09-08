# Sjoa 2026 – OSI Elvepadling

Én side som viser påmeldingene til elvepadlingsturen til Sjoa, hentet rett fra
Google-skjemaet.

Påmelding skjer i skjemaet. Siden leser svarene fra regnearket skjemaet skriver til,
og viser dem i en gruppert tabell med avkrysninger og en totalrad nederst. Ingen
database, ingen innlogging, ingen backend – bare regnearket og en side som tegner det.

Stack: SvelteKit + TypeScript på Vercel.

## Kom i gang

```sh
npm install
cp .env.example .env   # fyll inn CSV-lenken
npm run dev
```

Appen kjører på http://localhost:5173.

```sh
npm run check    # typesjekk
npm run build    # produksjonsbygg
npm run preview  # se på produksjonsbygget lokalt
```

## Koble til regnearket

1. I skjemaet: **Svar → Koble til regneark**.
2. I regnearket: **Fil → Del → Publiser på nettet**. Velg fanen med svarene og formatet
   **CSV**. Kopier lenken.
3. Legg den inn som `GOOGLE_SHEET_CSV_URL` – i `.env` lokalt, og under **Settings →
   Environment Variables** i Vercel.

Hentingen skjer på serveren, så regneark-lenken blir ikke synlig i frontend-koden, og
nettleseren slipper CORS-trøbbel. Siden henter på nytt hvert minutt, og har en
**Oppdater**-knapp. Merk at Google selv cacher det publiserte arket noen minutter, så et
ferskt svar kan bruke litt tid på å dukke opp.

## Oversikten

Siden viser tre ting utledet fra skjemasvarene:

- **Nøkkeltall** – antall påmeldte, biler, plasser og hvor mange som har lappen.
- **Hvem kommer** – én rad per person: navn, når de drar, om de er proff, om de har
  lappen, og hvilken bil de stiller med. Bil-merket lenker ned til bilen.
- **Biler** – ett kort per bil: hvem som kjører, antall plasser og avreisetidspunkt.

Under ligger **Vis alle svar fra skjemaet**, som folder ut hele regnearket i den
grupperte tabellen. Ingenting går tapt selv om en kolonne ikke passer i oversikten.

### Hvordan kolonnene kobles

`fieldPatterns` i [`src/lib/config.ts`](src/lib/config.ts) sier hvilken kolonne som
fyller hvilken rolle: `name`, `departure`, `professional`, `licence`, `hasCar`,
`seats` og `carDeparture`.

Hver rolle tar den **første kolonnen som treffer et av mønstrene sine**, og en kolonne
kan bare fylle én rolle. Rekkefølgen i lista avgjør: de presise rollene plukker først,
så «How many seats are available?» blir til seter og ikke havner på den mer generelle
bil-rollen. Mønstrene dekker både norsk og engelsk.

Finner en rolle ingen kolonne, faller den kolonnen bort fra tabellen – resten virker
som før. Spør skjemaet ikke om når bilen drar, brukes sjåførens egen avreisetid.

En person regnes som å ha bil hvis de svarer ja på bil-spørsmålet, eller oppgir et
antall plasser over null. Hver slik person blir til én bil, nummerert i den
rekkefølgen svarene kom.

Kolonner som ikke fyller en rolle vises som en liten linje under navnet, så
kommentarer som «Trenger skyss» ikke forsvinner.

### Kolonner som skjules

`hiddenColumns` fjerner kolonner fra hele siden. Som standard: e-post, telefon,
tidsmerke og medlemsspørsmålet – støy i en oversikt, og kontaktopplysninger har ikke
noe å gjøre på en åpen side.

### Slik leses cellene

| I regnearket              | På siden      |
| ------------------------- | ------------- |
| `Ja`, `Yes`, `True`, `X`  | grønn ✓       |
| `Nei`, `No`, `False`, `-` | grå ✕         |
| tom                       | grå –         |
| alt annet                 | teksten som den står |

## Kartet

Under tabellen ligger et kart over turområdet, med Leaflet og OpenStreetMap-fliser.
Ingen API-nøkkel, ingen konto.

Stedene ligger i [`src/lib/places.ts`](src/lib/places.ts). Hvert sted har navn, emoji og
`coords` som `[breddegrad, lengdegrad]`. Elvestrekkene i `runs` tegnes som stiplede
linjer mellom put inn og take out – de går rett fram og følger **ikke** elveløpet, de
viser bare hvilken strekning et løp dekker.

**Legge til eller flytte et sted:** høyreklikk stedet i Google Maps og velg det øverste
punktet i menyen. Da kopieres «61.7536, 9.2881», som limes rett inn i `coords`.

Hvert sted får navnet sitt skrevet ved siden av markøren. `labelDirection` styrer hvilken
vei navnet peker. Kiwi, Strie Strømmer og Ysteriet ligger noen hundre meter fra hverandre,
så de peker hver sin vei for at navnene ikke skal legge seg oppå hverandre når hele
området vises. Endrer du et sted, kan det hende naboen må peke en annen vei.

Et sted med `coords: null` havner ikke på kartet, men vises i lista under med «mangler
koordinat». Det er med vilje: en markør på omtrent riktig sted er verre enn ingen markør,
for da tror folk de kan kjøre etter den.

## Vannføring

Under kartet vises vannføringen fra NVE for de siste 48 timene, med sonen som regnes
som fine forhold markert i grafen.

Krever en API-nøkkel til [NVEs HydAPI](https://hydapi.nve.no/) – gratis, hentes på
[hydapi.nve.no/Users](https://hydapi.nve.no/Users). Legg den inn som `NVE_API_KEY`.
Uten nøkkel skjules grafen, resten av siden virker som før.

Innstillingene ligger i `water` i [`src/lib/config.ts`](src/lib/config.ts):

| Felt         | Betydning                                                              |
| ------------ | ---------------------------------------------------------------------- |
| `stationId`  | NVE-stasjonen. `2.595.0` er den på [Sildre](https://sildre.nve.no/station/2.595.0) |
| `parameter`  | `1001` = vannføring (m³/s), `1000` = vannstand (meter)                  |
| `perfect`    | Nedre og øvre grense for fine forhold, tegnet som bånd i grafen         |
| `hours`      | Hvor langt tilbake grafen går                                          |

**Merk:** vi henter *vannføring*, ikke vannstand. «Perfekt mellom 25 og 60» gir bare
mening i m³/s – vannstanden på Sjoa ligger på et par meter. Er det likevel vannstanden
dere går etter, bytt `parameter` til `1000` og juster `perfect`.

## Personvern

Et publisert regneark er lesbart for alle som har URL-en, og denne siden ligger åpent på
nettet. E-post og telefon filtreres derfor bort før dataen sendes til nettleseren – ikke
bare skjult i visningen, men aldri sendt. Vil du vise dem likevel, tøm `hiddenColumns`.

## Deploy

Importer repoet i Vercel, legg inn `GOOGLE_SHEET_CSV_URL` under **Settings → Environment
Variables**, og push til `main`.

## Om `supabase/`-mappa

Mappa inneholder SQL-en fra en tidligere versjon som hadde database med samkjøring,
overnattingsfordeling, betalt-markering og et adminpanel. Ingenting av dette brukes av
appen nå. Filene er beholdt fordi funksjonaliteten kan bli aktuell igjen; koden som brukte
dem ligger i git-historikken.
