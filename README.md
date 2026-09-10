# Sjoa 2026 – OSI Elvepadling

Turside for elvepadlingsturen til Sjoa. Deltakere, biler og avreisegrupper ligger som
data i repoet; vannføringen hentes fra NVE. Ingen database, ingen innlogging.

| Side          | Innhold                                                                  |
| ------------- | ------------------------------------------------------------------------ |
| `/`           | Nedtelling, nøkkeltall, vannføring nå, neste punkt på planen og lenker    |
| `/kart`       | Kart med lagvelger (topo, kart, flyfoto), filter, steder og strekningene  |
| `/elven`      | Vannføring siste 48 timer, og elveprofil for Bru-bru og Playrun           |
| `/logistikk`  | Hvem drar når, biler, utstyr og hjelmstørrelser, deltakerlista, uavklart og FAQ |
| `/plan`       | Tidsskjema for helgen, dag for dag                                       |

`/heidal` (det gamle navnet på kartsiden) videresender til `/kart`.

Menyen ligger i [`src/lib/nav.ts`](src/lib/nav.ts). Bare `/elven` og `/` snakker med NVE.

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
cp .env.example .env   # fyll inn NVE-nøkkelen
npm run dev
```

Appen kjører på http://localhost:5173.

```sh
npm run check    # typesjekk
npm run build    # produksjonsbygg
npm run preview  # se på produksjonsbygget lokalt
```

## Deltakere og biler

Alt om hvem som kommer ligger i [`src/lib/participants.ts`](src/lib/participants.ts):

- `people` – én oppføring per person: avreisegruppe, førerkort, om de låner kajakk og
  vest, hjelmstørrelse, og en merknad. Ingen telefonnumre – siden ligger åpent på nettet.
- `cars` – bilene, med seter, hengerfeste, takstativ og når de drar. Setene i bilene som
  drar fredag summeres til kapasiteten på Logistikk-siden.
- `departureGroups` – torsdag, fredag 16:00, fredag senere og uavklart, med forklaring.
- `open` – det som ikke er avklart ennå. Fjern punktene etter hvert.
- `faq` – ofte stilte spørsmål.

Tallene på forsiden og Logistikk-siden regnes ut fra dette. Hjelmstørrelsene grupperes
på første ord («Medium (yellow)» og «Medium» havner sammen), og bare de som låner utstyr
telles med. Fornavn brukes i lister; er to like, legges initialen i etternavnet til.

Påmeldingsskjemaet lenkes fortsatt til fra menyen, men svarene leses ikke automatisk.
Nye påmeldinger legges inn for hånd.

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

## /admin – prompter til Claude

`/admin` er en skjult side (ikke i menyen, `noindex`, sperret i `robots.txt`) med ett
tekstfelt. Passordet er `ADMIN_PASSWORD` i Vercel og sjekkes på serveren; den som har
det, får en signert cookie i 30 dager. Hver prompt blir et GitHub-issue med merkelappen
`prompt`, opprettet med `GITHUB_TOKEN` – et fine-grained token begrenset til dette
repoet med *Issues: Read and write*. Tokenet når aldri nettleseren.

En Routine i Claude Code on the web (oppskrift og prompt i
[`docs/admin-routine.md`](docs/admin-routine.md)) kjører hver hele time på dagtid, leser åpne
`prompt`-issues, gjør jobben og lukker issuet med en oppsummering. Endringer i
datafilene (`participants.ts`, `schedule.ts`, `info.ts`, `packing.ts`, `river.ts`,
`places.ts`, `config.ts`) pushes rett til standardgrenen; alt annet kommer som pull
request. Prompter som bryter reglene – hemmeligheter, telefonnumre, endringer i
`/admin` eller CI, sletting, sjikane – avvises med merkelappen `avvist` og en forklaring.

Bremser: maks 2000 tegn og maks 5 prompter i timen. Siden viser de siste ti med status.

### CI-vakten

[`.github/workflows/sjekk.yml`](.github/workflows/sjekk.yml) kjører typesjekk, bygg og
[`scripts/vakt.mjs`](scripts/vakt.mjs) på hver push og pull request. Vakten leser
linjene som er lagt til og stopper alt som ligner telefonnummer, e-postadresse eller
nøkkel. Beskytt standardgrenen i GitHub (Settings → Branches → require status checks)
så ingenting lander før den er grønn.

## Personvern

Siden ligger åpent på nettet. Derfor står det ikke telefonnumre eller e-postadresser i
deltakerdataene, bare navn og det som trengs for logistikken.

## Deploy

Importer repoet i Vercel, legg inn `NVE_API_KEY` under **Settings → Environment
Variables**, og push til `main`.

## Om `supabase/`-mappa

Mappa inneholder SQL-en fra en tidligere versjon som hadde database med samkjøring,
overnattingsfordeling, betalt-markering og et adminpanel. Ingenting av dette brukes av
appen nå. Filene er beholdt fordi funksjonaliteten kan bli aktuell igjen; koden som brukte
dem ligger i git-historikken.
