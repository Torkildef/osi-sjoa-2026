# Bilder

Legg bildefilene her. Siden viser dem automatisk, og skjuler dem så lenge de mangler.

| Fil            | Brukes til                                    |
| -------------- | --------------------------------------------- |
| `osi-logo.png` | Logoen i toppen av siden                       |
| `kruke.jpg`    | Hovedbildet på forsiden                        |

Bytt gjerne filendelse om du har `.jpg`/`.webp` i stedet – da må stien oppdateres i
`src/lib/photos.ts`.

Hold filstørrelsen nede. Hovedbildet trenger ikke være bredere enn ca. 1600 piksler.

Logoene til stedene vises i stedslista på Heidal-siden og i kartets popup:

| Fil                   | Sted             |
| --------------------- | ---------------- |
| `strie-strommer.png`  | Strie Strømmer   |
| `heidal-ysteri.png`   | Ysteriet         |
| `kiwi.png`            | Kiwi             |

Logoer med gjennomsiktig bakgrunn (PNG eller SVG) fungerer best i både lys og mørk
modus. Mangler en fil, vises emojien i stedet.
