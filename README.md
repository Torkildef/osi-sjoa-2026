# Sjoa 2026 – OSI Elvepadling

Turside for elvepadlingsturen til Sjoa. Påmelding skjer i et Google-skjema, og siden
leser svarene rett fra regnearket skjemaet skriver til. Ingen database, ingen
innlogging, ingen backend.

| Side          | Innhold                                                                  |
| ------------- | ------------------------------------------------------------------------ |
| `/`           | Nedtelling, nøkkeltall, vannføring nå, neste punkt på planen og lenker    |
| `/kart`       | Kart med lagvelger (topo, kart, flyfoto), filter, steder og strekningene  |
| `/elven`      | Vannføring siste 48 timer, og elveprofil for Bru-bru og Playrun           |
| `/logistikk`  | Hvem drar når, biler med plasser og utstyr, og deltakerlista             |
| `/plan`       | Tidsskjema for helgen, dag for dag                                       |

`/heidal` (det gamle navnet på kartsiden) videresender til `/kart`.

Menyen ligger i [`src/lib/nav.ts`](src/lib/nav.ts). Hver side henter bare det den
trenger: `/logistikk` og `/` snakker med regnearket, `/elven` og `/` med NVE.

Stack: SvelteKit + TypeScript på Vercel.

## Design

Siden følger [Material Design 3](https://m3.material.io/): fargeroller, typeskala,
form og komponentene derfra – app-bar, navigasjonslinje i bunnen på mobil, kort,
chips, knapper og lister. Alt ligger som CSS-variabler og klasser i
[`src/app.css`](src/app.css); det er ingen komponentpakke å oppgradere. Fargene er
turens egne: elveblått som primærfarge og kajakkoransje som tertiær, med egne
paletter for lys og mørk modus.

- **Skrift:** Manrope, pakket med siden fra `@fontsource-variable/manrope`, så ingen
  fonter hentes fra Google i drift.
- **Ikoner:** Material Symbols (Rounded). Bare stiene vi bruker ligger i
  [`src/lib/icons.ts`](src/lib/icons.ts), tegnet av `Icon.svelte`. Trenger du et nytt,
  hent SVG-en på [fonts.google.com/icons](https://fonts.google.com/icons) og lim inn
  `d`-attributtet.
- **Fanelogo:** OSI-logoen, som `static/favicon.png`, `apple-touch-icon.png` og
  ikonene i `manifest.webmanifest`. Siden kan legges til på hjemskjermen på mobil.

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

Siden er på norsk, også når skjemaet er på engelsk. Den viser:

- **Nøkkeltall** – påmeldte, biler, plasser og hvor mange som låner utstyr.
- **Biler** – én rad per bileier, med plasser, hengerfeste og takstativ, og en sum nederst.
- **Deltakere** – en rullbar liste med alle. Klikk et navn for å se når de drar, om de
  har lappen, hva de låner av utstyr, og når de ikke rekker planlagt avreise. Merkene i
  lista (Proff, Bil, Låner, Avvik) viser det viktigste uten å klikke.

### Hvordan kolonnene kobles

`fieldPatterns` i [`src/lib/config.ts`](src/lib/config.ts) sier hvilken kolonne som
fyller hvilken rolle: `name`, `departure`, `professional`, `licence`, `hasCar`, `seats`,
`towHitch`, `roofRack`, `borrowedGear`, `absence` og `carDeparture`.

Hver rolle tar den **første kolonnen som treffer et av mønstrene sine**, og en kolonne
kan bare fylle én rolle. Rekkefølgen i lista avgjør, så de presise rollene plukker først.
Mønstrene dekker norsk og engelsk.

Ett mønster står for seg: `ABSENCE`, brukt både til å velge kolonne og til å gi
merkelapp. De to må være identiske. «Can you not make the planned departure?» inneholder
ordet *departure*, og ble uten dette lest som spørsmålet om når man drar.

Finner en rolle ingen kolonne, faller feltet bare bort. Spør skjemaet ikke om når bilen
drar, brukes sjåførens egen avreisetid. En person regnes som bileier hvis de svarer ja på
bil-spørsmålet, eller oppgir plasser over null.

### Norske merkelapper

`columnLabels` oversetter spørsmålstekst til norsk merkelapp – første mønster som treffer
vinner. Treffer ingen, brukes spørsmålsteksten slik den står. Kolonner uten egen rolle
vises i detaljpanelet med sin norske merkelapp, så ingenting går tapt.

### Kolonner som skjules

`hiddenColumns` fjerner kolonner fra hele siden: e-post, telefon, tidsmerke og
medlemsspørsmålet. Kontaktopplysninger har ikke noe å gjøre på en åpen side.

### Slik leses cellene

| I regnearket              | På siden      |
| ------------------------- | ------------- |
| `Ja`, `Yes`, `True`, `X`  | grønn ✓       |
| `Nei`, `No`, `False`, `-` | grå ✕         |
| tom                       | grå –         |
| alt annet                 | teksten som den står |

## Bilder

Filene ligger i [`static/bilder/`](static/bilder/) og listes opp i
[`src/lib/photos.ts`](src/lib/photos.ts):

| Fil             | Vises som                    |
| --------------- | ---------------------------- |
| `osi-logo.jpeg` | Logoen i toppen av siden     |
| `kruke.jpg`     | Hovedbildet på forsiden      |

Mangler en fil, skjuler bildet seg selv i stedet for å vise et brukket bildeikon, så
siden ser hel ut både før og etter at bildene er lagt inn. Bytter du filendelse, må
stien oppdateres i `photos.ts`.

Legg gjerne inn flere bilder på samme måte: legg fila i `static/bilder/`, gi den en
oppføring i `photos.ts`, og bruk `<Photo src={...} alt={...} caption="..." />`.
`alt` er ikke valgfri – den leses opp for den som bruker skjermleser.

## Tidsskjemaet

Punktene ligger i [`src/lib/schedule.ts`](src/lib/schedule.ts). Hvert punkt har `day`,
valgfri `time`, `title` og `note`.

- `people` fylles ut når det er avklart hvem som er med på et punkt. Står den tom, vises
  den ikke.
- `place` viser til navnet på et sted i `places.ts` og gir en lenke til kartet. Navnet må
  stemme nøyaktig; gjør det ikke det, utelates lenken i stedet for å peke feil.
- `scheduleIsDraft` styrer notisen om at planen ikke er ferdig. Sett den til `false` når
  den er det.

## Kartet

Kartsiden bruker Leaflet med tre bakgrunnskart å velge mellom: Kartverkets topokart
(standard – viser elva og terrenget best), OpenStreetMap og flyfoto fra Esri. Ingen
API-nøkkel, ingen konto. Svarer ikke topokartet, faller kartet tilbake til
OpenStreetMap av seg selv.

Stedene ligger i [`src/lib/places.ts`](src/lib/places.ts). Hvert sted har navn, emoji,
`kind` (base, elv eller service – styrer farge og filterknappene) og `coords` som
`[breddegrad, lengdegrad]`.

**Legge til eller flytte et sted:** høyreklikk stedet i Google Maps og velg det øverste
punktet i menyen. Da kopieres «61.7536, 9.2881», som limes rett inn i `coords`.

Hvert sted får navnet sitt skrevet ved siden av markøren. `labelDirection` styrer hvilken
vei navnet peker. Kiwi, Strie Strømmer og Ysteriet ligger noen hundre meter fra hverandre,
så de peker hver sin vei for at navnene ikke skal legge seg oppå hverandre når hele
området vises. Endrer du et sted, kan det hende naboen må peke en annen vei.

Et sted med `coords: null` havner ikke på kartet, men vises i lista under med «mangler
koordinat». Det er med vilje: en markør på omtrent riktig sted er verre enn ingen markør,
for da tror folk de kan kjøre etter den.

Kartet kan åpnes med noe valgt, og det er slik planen og elveprofilen lenker inn:

| URL                            | Viser                          |
| ------------------------------ | ------------------------------ |
| `/kart?sted=Kruke gård`        | Zoomer til stedet og åpner popupen |
| `/kart?strekning=playrun`      | Hele strekningen               |
| `/kart?punkt=Navnet på stryket` | Et punkt langs elva (krever `coords`) |

## Elva

Strekningene ligger i [`src/lib/river.ts`](src/lib/river.ts): navn, gradering, farge,
put inn og take out (navn fra `places.ts`), en beskrivelse, og `features` – stryk,
playspots, farer, portasjer og annet langs strekningen. Elven-siden tegner dem som en
**elveprofil**: en linje fra put inn til take out med punktene i rekkefølge. Det er
lettere å lese enn kartet når man vil vite hva som kommer; kartet viser hvor.

Et punkt trenger bare `at` – hvor langt inn i strekningen det ligger, 0 er put inn og 1
er take out – for å havne i profilen. Legg til `coords` når det skal på kartet også.

```ts
{ name: 'Første stryket', kind: 'rapid', grade: 'II+', at: 0.3, coords: null, note: 'Hold høyre.' }
```

`riverIsDraft` styrer notisen om at gradering og punkter er foreløpige. Sett den til
`false` når noen som har padlet strekningene har gått gjennom dem.

### Elveløpet

Selve elveløpet ligger i [`src/lib/data/sjoa.json`](src/lib/data/sjoa.json), som
koordinatlister per strekning. Fila er tom til å begynne med, og da tegnes strekningene
som stiplede, rette streker fra put inn til take out – tydelig merket som «ikke
elveløpet». Hent det ekte løpet fra OpenStreetMap med

```sh
node scripts/hent-elv.mjs
```

Skriptet henter alle bitene av Sjoa rundt Heidal, syr dem sammen til én linje, og
klipper ut strekningen mellom put inn og take out for hver av dem. Trenger bare
nettilgang. Etterpå tegnes strekningene langs elva, og lengden i kilometer regnes ut
fra løpet. Kjør det på nytt hvis put inn eller take out flyttes.

Ser en strekning gal ut – for kort, eller hopper over en sving – er det som regel en øy
der elva deler seg og skriptet tok feil løp. Da hjelper det å justere put inn/take out
et par hundre meter, eller redigere `sjoa.json` for hånd.

## Vannføring

Elven-siden viser vannføringen fra NVE for de siste 48 timene, med sonen som regnes
som fine forhold markert i grafen, og trenden de siste seks timene. Forsiden viser den
siste målingen.

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

Importer repoet i Vercel, legg inn `GOOGLE_SHEET_CSV_URL` og `NVE_API_KEY` under
**Settings → Environment Variables**, og push til `main`.

## Om `supabase/`-mappa

Mappa inneholder SQL-en fra en tidligere versjon som hadde database med samkjøring,
overnattingsfordeling, betalt-markering og et adminpanel. Ingenting av dette brukes av
appen nå. Filene er beholdt fordi funksjonaliteten kan bli aktuell igjen; koden som brukte
dem ligger i git-historikken.
