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

## Tilpasse tabellen

Alt som styrer tabellen ligger i [`src/lib/config.ts`](src/lib/config.ts):

| Innstilling      | Hva den gjør                                                            |
| ---------------- | ----------------------------------------------------------------------- |
| `columnGroups`   | Fargebåndene. Hver kolonne havner i første gruppe som treffer et mønster |
| `hiddenColumns`  | Kolonner som ikke vises. E-post og telefon er skjult som standard        |
| `highlightRow`   | Rader som uthevet – instruktører, assistenter, arrangører                |
| `refreshSeconds` | Hvor ofte siden henter på nytt                                           |
| `trip`           | Tittel, datoer, sted og pris i toppen                                    |
| `signupFormUrl`  | Lenken til skjemaet                                                      |

Kolonnene gjenkjennes på **mønster**, ikke eksakt navn, så små omformuleringer i
skjemaet går fint. Legger du til et spørsmål som ikke treffer noen gruppe, dukker det opp
som en egen kolonne til venstre – ingenting går tapt, men vil du ha det inn i et
fargebånd, legger du til et mønster i `columnGroups`.

Kolonner som ikke tilhører en gruppe vises først, siden det gjerne er de
identifiserende feltene (navn, rolle).

### Slik leses cellene

| I regnearket                   | På siden                       |
| ------------------------------ | ------------------------------ |
| `Ja`, `Yes`, `True`, `X`       | grønn ✓                        |
| `Nei`, `No`, `False`, `-`      | grå ✕                          |
| tom                            | grå –                          |
| alt annet                      | teksten som den står           |

Totalraden nederst regnes ut slik:

- **Ja/nei-kolonne** → `10 av 14`
- **Tallkolonne** → summen
- **Blandet kolonne** → hvor mange som har oppgitt noe (nei-svar telles ikke, ellers
  ville «Trenger utstyr» vist 11 når to trenger utstyr)
- **Kolonne alle har fylt ut** → tom, fordi tallet bare ville vært antall rader om igjen

Summeringen er mekanisk og teller alt som står der. Har noen skrevet «Backup» i
bil-kolonnen, telles det som et svar – siden kan ikke vite at bilen ikke er i bruk.

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
