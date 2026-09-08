# Bilder

Legg bildefilene her. Siden viser dem automatisk, og skjuler dem så lenge de mangler.

| Fil             | Brukes til               |
| --------------- | ------------------------ |
| `osi-logo.jpeg` | Logoen i toppen av siden |
| `kruke.jpg`     | Hovedbildet på forsiden  |

Bytter du filendelse, må stien oppdateres i `src/lib/photos.ts`.

Fanelogoen (`favicon.png`, `apple-touch-icon.png`, `icon-192.png` og `icon-512.png`
i `static/`) er laget fra `osi-logo.jpeg`. Bytter du logoen, lag dem på nytt fra den
nye fila – 64, 180, 192 og 512 piksler, kvadratiske, med hvit bakgrunn.

Hold filstørrelsen nede. Hovedbildet trenger ikke være bredere enn ca. 1600 piksler.

Logoene til stedene vises i stedslista på Heidal-siden og i kartets popup:

| Fil                   | Sted           |
| --------------------- | -------------- |
| `strie-strommer.png`  | Strie Strømmer |
| `heidal-ysteri.webp`  | Ysteriet       |
| `kiwi.jpg`            | Kiwi           |

Logoene tegnes på en hvit brikke. Flere av dem er laget for lys bakgrunn – Strie
Strømmer har sort ordmerke på gjennomsiktig bunn – og ville forsvunnet i mørk modus
uten. Mangler en fil, vises emojien i stedet.

Fotografier bør lagres som JPEG, ikke PNG. Bildet av Kruke var 1,4 MB som PNG og ble
160 kB som JPEG uten synlig tap.
