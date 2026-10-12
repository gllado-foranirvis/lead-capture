# Brief · pantalla de gràcies amb descàrrega del dossier

Resultat de `/impeccable shape` (12/10/2026). Estat: **pendent de confirmació d'Olga**. Autoritat visual: `DESIGN.md` / `PRODUCT.md` i el sistema `site/ds/`; wireframe «3 · Gracias + PDF»; spec `2026-10-12-gracies-pdf.md`.

## 1. Feina i públic
- Visitant de la fira, dret, una mà, 360 px, cobertura dolenta; o la tauleta de l'estand. Acaba d'enviar el formulari: vol **tenir el dossier** i, si vol, parlar amb algú.
- Mode: **Operate de fira** (tasca curta; la marca viu en detalls precisos, no en decoració).

## 2. Resultat i prova
- Gest principal únic: **«Descargar el dossier»**. Èxit = el visitant té el PDF desat o obert amb un toc, sense que s'hagi obert res sol.
- Prova real: el PDF del model triat (o el general) i el seu nom de descàrrega venen de `CONFIG`; el nom del model és a la targeta.

## 3. Direcció escollida
- Marca d'èxit: **cercle ple `--success-bg` de 56 px amb check `--success`** (no el cercle de punts del wireframe, que és un marcador de posició).
- **Marca, títol i subtítol centrats**, com al wireframe; targeta i botons a tota l'amplada.
- **Targeta del dossier clicable**: descarrega el mateix fitxer, amb el mateix nom que el botó (enllaç `<a download>` que embolcalla `T.PdfCard`). El botó és el gest principal; la targeta és un objectiu tàctil gran addicional i **no és una segona parada de tabulador** (`tabIndex: -1`; el lector de pantalla troba el botó).
- **CTA al peu**: WhatsApp i Correo electrónico (`outline`, amb icona) ancorats a baix amb espai flexible al mig (`margin-top: auto`); «Volver al inicio» com a enllaç discret sota ells.
- Focus: en entrar a la pantalla va al títol (`data-step-heading`), com a la resta.

## 4. Abast i límits
- Fidelitat de producció; només la vista `done`. No es toca `site/ds/`, l'entrada ni els passos.
- No hi ha logotip dibuixat ni es n'inventa cap (la capçalera continua amb el `wordmark`).
- Anti-objectius: cap obertura automàtica; cap segona crida a l'acció visualment igual de forta que la descàrrega; cap color fix.

## 5. Estats i rangs
- Dossier propi (Modelo A/B) → meta = nom del model; sense dossier propi o «asesoramiento» → «Información general» i descàrrega del general.
- Sense dossier configurat → s'amaguen targeta i botó; la resta funciona.
- `emailDelivery` canvia només el subtítol. Textos de 4 idiomes; el portuguès és el més llarg (ha de fer salt de línia sense tallar-se).
- Alçada: mòbil curt (peu ancorat sense solapar-se; si no hi cap, tot cau en ordre i es fa scroll) i ample de tauleta (columna màxima 560 px).

## 6. Interacció i maquetació
- Ordre: marca → títol/subtítol → targeta → botó de descàrrega → [espai] → WhatsApp → Correo → Volver al inicio.
- Terra tàctil de 44 px; focus visible; contrast AA en clar i fosc (tokens `--success`, `--success-bg`, `--text-muted` ja tenen variant fosca).
- Animació: només l'`screen-in` existent (ja en `prefers-reduced-motion: no-preference`); res més.

## 7. Restriccions i decisions obertes
- La paraula «PDF» només surt a la insígnia del component; els literals diuen «dossier».
- `download` amb el nom de `dossierFileName`; a iOS Safari el navegador pot obrir el PDF en visor (només per gest del visitant).
- Obert per a l'auditoria: si la targeta clicable aporta confusió amb el botó (dos enllaços al mateix fitxer) es revisa a Task 3.
