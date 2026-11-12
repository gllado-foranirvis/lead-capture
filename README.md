# The Silent Fleet · Pàgina de captació (Enertech 2026)

Pàgina única i estàtica, en portuguès, anglès, castellà i català (en aquest ordre al selector; per defecte, portuguès), perquè els visitants d'**Enertech 2026** (Portugal) triïn el producte que els interessa, deixin el contacte i es descarreguin el seu PDF, o escriguin per WhatsApp o correu amb un missatge ja escrit. Cada clic a WhatsApp o correu es compta de forma anònima al full de Google. Hi ha una versió de contingència sense PDF (`dossier: false`) i l'MVP original (`extra1: false`, només WhatsApp i correu).

Context i decisions: [PRODUCT.md](PRODUCT.md), [DESIGN.md](DESIGN.md) i [docs/](docs/).

## Comandes

```bash
npm install        # un cop
npm run serve      # http://localhost:8080
npm test           # tots els tests
npm run sync       # copia el sistema de disseny, React i Montserrat a site/ (després d'actualitzar the-silent-fleet-ds/)
npm run qr         # genera out/qr.png i out/qr.svg a partir de siteUrl
npm run texts      # regenera docs/textos-contacte.md (textos per validar) a partir de i18n.js
```

## Estructura

- `site/`: el que es publica. `ds/`, `vendor/` i `fonts/` són generats per `npm run sync` i es versionen; `img/` porta la fotografia (`hero-m.webp`, `hero-d.webp`) i `dossiers/` els PDF.
- `the-silent-fleet-ds/`: còpia local del sistema de disseny (font de la veritat visual; no s'edita aquí).
- `apps-script/Code.gs`: l'script de Google que rep els leads i els desa al full (es copia a l'editor d'Apps Script; guia a `docs/google-sheet.md`).
- `scripts/`: `smoke-sheet` (prova de fum de l'script desplegat), `sync-assets` (sistema de disseny, React i Montserrat), `make-qr`, `export-texts` (textos per validar), `rem-migration` (migració de tipografia preparada).
- `tests/`: tests (`node:test`, 252) de la lògica, de les pantalles amb un renderitzador fals (`tests/helpers/fake-react.mjs`), dels textos, del CSS i del HTML.
- `docs/`: `textos-contacte.md` (generat), `google-sheet.md`, `typeset-rem/` i `superpowers/` (especificacions, briefs, auditories i plans de cada fase; l'índex amb l'estat de cada document és a [docs/superpowers/README.md](docs/superpowers/README.md)).
- `.github/workflows/`: `ci.yml` (a cada pull request cap a `main`: `npm test`, `npm run sync` i comprovació que no deixa canvis) i `pages.yml` (desplegament a GitHub Pages en cada push a `main`, després d'`npm test`).

## Flux de treball (git)

- **`main` publica sol:** cada push a `main` desplega la beta pública a GitHub Pages (`pages.yml`, després d'`npm test`). Per això res no entra a `main` sense pull request, CI en verd i el vistiplau d'Olga.
- **Branques:** una per canvi, des de l'`origin/main` actual (no des d'un `main` local desactualitzat), amb nom `feat/…`, `fix/…` o `docs/…`. Un PR apilat sobre un altre ha de retargetar-se a `main` **abans** de fusionar-lo (el PR #2 es va fusionar a la branca del #1 i el rediseny no va arribar a `main` fins al #4).
- **Commits:** petits, en català i amb prefix (`feat:`, `fix:`, `docs:`, `chore:`), **sense cap línia `Co-Authored-By`** (regla d'Olga, també als PR). Abans de cada commit: `npm test` en verd i `npm run sync` sense canvis.
- **Punt de retorn:** l'etiqueta `pre-gracies-pdf` (`a84e24d`) és la beta anterior a la pantalla de descàrrega, el telèfon i el rediseny fotogràfic. Per tornar-hi: redesplegar aquesta etiqueta.
- **Després de fusionar:** esperar els ~30 s de Pages, recarregar amb la memòria cau neta (Cmd+Shift+R) i provar a la URL real un enviament amb dades inventades (el full de Google és de prova). Netejar les branques fusionades, locals i remotes.
- **Historial recent:** #1 pantalla de gràcies amb descàrrega i estats tàctils · #2 i #4 rediseny fotogràfic · #3 format i prefix del telèfon · #5 ajustos de l'inici (ordre, escena compacta, marca enllaç, vaixell, marges).

## Icones i llicències

Els botons de WhatsApp i correu porten una icona en línia (`site/js/icons.js`, en `currentColor`):

- **WhatsApp:** glif de [Simple Icons](https://simpleicons.org) 16.31.0 (CC0). La marca és de WhatsApp LLC i només s'usa en una tinta, la del botó.
- **Correu:** icona `mail` de [Lucide](https://lucide.dev) 1.47.0 (ISC); el text de la llicència és a `docs/licenses/lucide-ISC-LICENSE.txt`.

## Recorregut: inici → dades → descàrrega

Actiu amb `extra1: true` (`config.js`); l'idioma es tria amb `?lang=pt|en|es|ca`. Amb `dossier: false` (o `?dossier=0`) no es pregunta el producte ni es parla de cap PDF; amb `false` a config, `?dossier=1` el previsualitza. `?producto=<id>|asesoramiento` preselecciona el producte i `?o=tauleta` marca l'origen.

1. **Inici:** escena fotogràfica compacta amb el nom de la fira (`config.fair`: «Enertech 2026»), títol i subtítol; sota, el producte d'interès (caselles de marcatge múltiple: els 7 productes i «No lo sé aún / Busco asesoramiento», que és excloent), la ciutat (camp de text), WhatsApp i correu amb el seu missatge ja escrit (inclou el producte i la ciutat) i el CTA cap a les dades. A 360×740 el CTA queda just a la vora inferior; la línia de recuperació i els enllaços legals, per sota.
2. **Pàgina 1, dades:** nom, correu, telèfon (prefix `+34` per defecte; el número s'agrupa mentre s'escriu), els mateixos productes ja marcats (es poden canviar) i el consentiment de privacitat (obligatori) i de novetats (opcional). Enviar el formulari desa el lead un sol cop (`stage: complete`). «← Volver» conserva el que s'ha escrit; a la tauleta s'esborra.
3. **Pàgina 2, descàrrega:** una targeta per cada PDF dels productes triats (es poden triar diversos) i, amb 2 o més, el botó «Descargar todos». El PDF és el de l'idioma del formulari i, si no existeix, l'anglès. **Avui no hi ha PDF general de la marca**: sense cap PDF aplicable (p. ex. només «asesoramiento») la confirmació no ofereix descàrregues i diu «gràcies, ja tenim les teves dades». WhatsApp i correu continuen a sota.

A la tauleta (`?o=tauleta`), tornar a l'inici o 90 segons sense tocar res descarta les dades del visitant.

### Productes i PDF (`config.js`)

`products[]`: `{ id, name, pdf: { en: 'dossiers/<id>.en.pdf' } }`. Els 7 PDF són a `site/dossiers/`: Boatee, EZ Raft, Jetwave, Momentum, SeaNXT, Sifly i TKO (només en anglès). **Per afegir un idioma** a un producte, copia el PDF a `site/dossiers/<id>.<idioma>.pdf` i afegeix la clau al mapa (`pdf: { en: '…', pt: 'dossiers/<id>.pt.pdf' }`); `npm test` comprova que el fitxer existeix i és un PDF. **Per afegir el PDF general de la marca**, posa `brandPdf: { en: 'dossiers/<nom>.en.pdf' }`: s'ofereix quan un producte triat no té PDF propi (o no se'n tria cap). Els PDF més grans fan fins a 17 MB (SeaNXT): pesen en dades mòbils.

### Full de Google

`apps-script/Code.gs` desa els leads a `Leads` (una fila per lead, amb `product` i `city`) i els clics a `Clics` (una fila per clic, 18 columnes anònimes: dia i hora de la zona del full, botó, lloc, idioma, origen, visita, productes, ciutat, dispositiu, sistema, idioma del navegador, zona horària, pantalla, segons a la pàgina i domini de procedència). Guia, recomptes i la prova de fum: `docs/google-sheet.md` i `node scripts/smoke-sheet.mjs <url> [token]`. **Cal tornar a desplegar l'script (nova versió) després de cada canvi de `Code.gs`.**

### Dades i esdeveniments
Només s'emeten esdeveniments a `window`; l'enviament al full és opcional (`leadEndpoint`):
- `tsf:lead` en enviar el formulari: `{ contact: { id, product, city, name, email, phone, privacy: true, newsletter, lang, origin } }`. El telèfon va com `+34 600 00 00 00`; `product` són els ids separats per comes.
- `tsf:contact-click` a cada clic de WhatsApp o correu: `{ id, visit, button, from, lang, origin, products, city, info }`. `visit` és un identificador aleatori que només viu a la memòria de la pàgina (es renova en descartar la sessió de la tauleta).

### Altres peces
- **`emailDelivery`** (`config.js`) és `false` fins que existeixi l'enviament del correu amb el dossier; només canvia el text de la confirmació.
- **Fotografia:** `site/img/hero-m.webp` i `hero-d.webp` (foto de The Silent Fleet subministrada per l'Olga).
- **Literals:** `site/js/i18n.js` (pàgina i missatges, amb `{fair}`) i `site/js/i18n-form.js` (formulari); de tu als 4 idiomes; el document es diu «dossier». Els noms de producte no es tradueixen.
- **Privacitat i cookies:** textos a `i18n-form.js` i `i18n.js`; el de privacitat diu què es desa de veritat (nom, correu, telèfon, ciutat, producte, idioma, origen, novetats) i el de cookies que només es compten els clics de forma anònima. Són esborranys: han de passar per revisió legal de Bruno.
- **Accessibilitat:** indicador de pas amb `progressbar`, focus al títol en canviar de pantalla, errors enllaçats amb els camps i capçalera com a `<header>`.
- `docs-privats/` és local i no és al repositori.

### Dades de prova a substituir abans de la fira

| On | Valor actual | Qui el dona |
|---|---|---|
| `whatsappNumber` (`config.js`) i el fallback de `site/index.html` | `+34 682 375 728` | Bruno (WhatsApp Business); `npm test` falla si no coincideixen |
| Text de privacitat i de cookies (`i18n-form.js`, `i18n.js`) | Esborranys | Bruno (revisió legal) |
| `brandPdf` (`config.js`) | No n'hi ha | Bruno, si hi ha un PDF general de la marca |
| PDF en altres idiomes | Només en anglès | Bruno, si en tenen |
| Missatges de WhatsApp i correu (`i18n.js`, clau `message`) | Text de mostra en 4 idiomes | Bruno valida; l'Olga revisa la traducció |
| Zona horària del full de Google | La que tingui el full | Olga: Lisboa (`docs/google-sheet.md`) |
| `leadEndpoint` / `leadToken`, `legalName`, `siteUrl` | Definitius (decidit) | — |

### Pendent
- **Pàgina de dades a 360×740:** té scroll (uns 1000 px): 3 camps, 8 productes i 2 consentiments no hi caben. Opcions si es vol evitar: treure el subtítol o la casella de novetats, o reduir els productes a un desplegable.
- Prova en un mòbil real: descàrrega del PDF (iOS Safari l'obre en visor), teclats, tecla «Next», autocompletat del telèfon i l'enviament del clic en obrir WhatsApp (el clic surt amb `sendBeacon` en passar la pàgina a segon pla).
- Enviament del correu amb el dossier (pla posterior).
- `site/index.html` (el fallback sense JavaScript) és en castellà i no porta la fotografia; el tema fosc existeix als tokens però no s'activa mai.
- Canvi de tipografia a `rem`, preparat però no aplicat: [docs/typeset-rem/](docs/typeset-rem/README.md).

## Abans de publicar

1. `npm test` en verd (252) i `npm run sync` sense canvis a `git status`.
2. **ABANS de fusionar** (si no, el web nou publicat deixa de desar contactes i clics: l'script antic exigeix `profile` i respon `invalid`): substituir les dades de la taula anterior que encara siguin de prova i **redesplegar l'script de Google** (nova versió) amb el `Code.gs` d'aquesta branca (és compatible amb el web antic, així que l'ordre és segur); omplir la data a `docs/google-sheet.md`; passar `node scripts/smoke-sheet.mjs <url> <token>` i comprovar `Leads` i `Clics`.
3. Etiquetar el punt de retorn (`git tag pre-enertech-2026 origin/main && git push origin pre-enertech-2026`) abans de fusionar.
4. Després de publicar: provar a la URL real a cada idioma, amb un producte, amb diversos i amb «asesoramiento»; que cada targeta descarrega el PDF correcte; que `Leads` i `Clics` reben les files; i el QR amb un mòbil.
5. **`noindex, nofollow` (decidit):** les dues pàgines porten `<meta name="robots" content="noindex, nofollow">` i s'hi queden. El test `beta: les dues pàgines porten noindex` de `tests/html.test.mjs` ho vigila.
6. Comprovar que `…/img/hero-m.webp` i `hero-d.webp` responen 200 a la URL publicada i que el CI del PR ha passat.
