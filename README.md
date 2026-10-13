# The Silent Fleet · Pàgina de captació (MVP)

Pàgina única i estàtica, en català, castellà, portuguès i anglès, perquè els visitants del Salón Náutico de Barcelona (14–18/10/2026) contactin amb The Silent Fleet per WhatsApp o correu amb un missatge ja escrit segons l'idioma i el perfil (distribuïdor o particular). L'MVP no desa dades ni usa cookies. Hi ha a més l'**Extra 1** (flux de captació en 2 passos), actiu a la fira: vegeu més avall.

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
- `scripts/`: `smoke-sheet` (prova de fum de l'script desplegat), `sync-assets` (sistema de disseny, React i Montserrat), `make-qr`, `export-texts` (textos per validar), `make-test-pdf` (dossier de prova) i `rem-migration` (migració de tipografia preparada).
- `tests/`: tests (`node:test`, 275) de la lògica, de les pantalles amb un renderitzador fals (`tests/helpers/fake-react.mjs`), dels textos, del CSS i del HTML.
- `docs/`: `textos-contacte.md` (generat), `google-sheet.md`, `typeset-rem/` i `superpowers/` (especificacions, briefs, auditories i plans de cada fase; l'índex amb l'estat de cada document és a [docs/superpowers/README.md](docs/superpowers/README.md)).
- `.github/workflows/`: `ci.yml` (a cada pull request cap a `main`: `npm test`, `npm run sync` i comprovació que no deixa canvis) i `pages.yml` (desplegament a GitHub Pages en cada push a `main`, després d'`npm test`).

## Flux de treball (git)

- **`main` publica sol:** cada push a `main` desplega la beta pública a GitHub Pages (`pages.yml`, després d'`npm test`). Per això res no entra a `main` sense pull request, CI en verd i el vistiplau d'Olga.
- **Branques:** una per canvi, des de l'`origin/main` actual (no des d'un `main` local desactualitzat), amb nom `feat/…`, `fix/…` o `docs/…`. Un PR apilat sobre un altre ha de retargetar-se a `main` **abans** de fusionar-lo (el PR #2 es va fusionar a la branca del #1 i el rediseny no va arribar a `main` fins al #4).
- **Commits:** petits, en català i amb prefix (`feat:`, `fix:`, `docs:`, `chore:`), amb la línia `Co-Authored-By` al final. Abans de cada commit: `npm test` en verd i `npm run sync` sense canvis.
- **Punt de retorn:** l'etiqueta `pre-gracies-pdf` (`a84e24d`) és la beta anterior a la pantalla de descàrrega, el telèfon i el rediseny fotogràfic. Per tornar-hi: redesplegar aquesta etiqueta.
- **Després de fusionar:** esperar els ~30 s de Pages, recarregar amb la memòria cau neta (Cmd+Shift+R) i provar a la URL real un enviament amb dades inventades (el full de Google és de prova). Netejar les branques fusionades, locals i remotes.
- **Historial recent:** #1 pantalla de gràcies amb descàrrega i estats tàctils · #2 i #4 rediseny fotogràfic · #3 format i prefix del telèfon · #5 ajustos de l'inici (ordre, escena compacta, marca enllaç, vaixell, marges).

## Dades de prova a substituir abans de la fira

| On | Valor actual | Qui el dona |
|---|---|---|
| `site/js/config.js` · `whatsappNumber` | `+34 600 00 00 00` | Bruno (WhatsApp Business) |
| `site/js/config.js` · `siteUrl` | `https://gllado-foranirvis.github.io/lead-capture/` (**definitiva**, decidit) | URL de Pages; el QR s'hi genera amb `npm run qr` |
| `site/index.html` (fallback de `#root`) | el mateix número i correu de `config.js` | `npm test` falla si no coincideixen |
| `site/js/i18n.js` · perfils | «Distribuidor» / «Particular» (la proposta); el wireframe diu «Propietario» / «Interesado» | Olga i Bruno |
| `site/js/i18n.js` · títol, subtítol, missatges i privacitat | Textos de mostra en 4 idiomes | Bruno valida; l'Olga revisa la traducció |
| Logotip | Es mostra el nom en text (`wordmark`); el sistema no en té | Bruno, si en té |

## Icones i llicències

Els botons de WhatsApp i correu porten una icona en línia (`site/js/icons.js`, en `currentColor`):

- **WhatsApp:** glif de [Simple Icons](https://simpleicons.org) 16.31.0 (CC0). La marca és de WhatsApp LLC i només s'usa en una tinta, la del botó.
- **Correu:** icona `mail` de [Lucide](https://lucide.dev) 1.47.0 (ISC); el text de la llicència és a `docs/licenses/lucide-ISC-LICENSE.txt`.

## Extra 1: flux de captació en 2 passos

El flux és **actiu** (`extra1: true` a `config.js`, decidit el 9/10/2026 per a la fira); amb `false` l'MVP torna a ser l'únic que veuen els visitants. També es veu amb `?extra1=1` (per exemple `?lang=es&extra1=1`) o posant `extra1: true` a `site/js/config.js`. **Versió de contingència sense PDF:** amb `dossier: false` a `config.js` (o `?dossier=0` per previsualitzar-la) el pas 2 no pregunta el producte d'interès, la confirmació no ofereix cap descàrrega i els literals i el text de privacitat no parlen de dossier. Per tornar-hi, `dossier: true`. Altres paràmetres: `?producto=<id>|asesoramiento` preselecciona el producte i `?o=tauleta` marca l'origen.

**Recorregut**
1. **Inici:** escena fotogràfica compacta a tot sang (la foto de The Silent Fleet amb el vaixell a un espai sense text, títol i subtítol a sobre del vel i la capçalera damunt la foto); sota, la pregunta de perfil (Particular / Profesional, opcional), WhatsApp i correu amb la seva nota, el CTA «Quiero saber más de The Silent Fleet», la línia «¿No se abre? Escríbenos a …» i els enllaços legals. Tot el contingut cap en un mòbil de 360×740 (acaba a ~696 px; 710 px en anglès). Marges amb una escala de 8px: 8 dins d'un grup, 16 entre grups, 24 a les vores.
2. **Pas 1 de 2, contacte:** nom, correu, telèfon (prefix `+34` per defecte i número en camps separats; el número s'agrupa mentre s'escriu: `+34` → «600 00 00 00», `+351` → «912 345 678», la resta de prefixos es deixen com s'escriuen; si s'escriu o enganxa un número internacional («+351 912 345 678», «0034…») al camp del número, el prefix passa al seu camp; el marcador segueix el prefix i el camp de prefix porta suggeriments amb el nom del país en l'idioma de la pàgina), privacitat obligatòria i novetats. Els errors es veuen abans de seguir.
3. **Pas 2 de 2, perfilació:** perfil (obligatori, ja marcat des de l'inici), activitat (només si és Profesional, amb «Otra»), embarcació, embarcació elèctrica, què t'entusiasma, què et preocupa, intenció de compra, factors decisius (les tres últimes amb «Otro» que obre el seu camp), model o potència, localitat per a una demostració i comentaris. Només el perfil és obligatori.
4. **Confirmació:** pantalla de gràcies (no s'obre res sol) amb la targeta del dossier del model triat, o el general si no n'hi ha, un botó «Descargar el dossier» que descarrega el fitxer amb el nom de `dossierFileName`, els botons de WhatsApp (amb les dades de la sessió) i de correu, i un enllaç discret per tornar a l'inici.

«← Volver» conserva el que s'ha escrit. La marca «The Silent Fleet» de la capçalera porta a l'inici des de qualsevol pantalla (sense recarregar; amb Cmd/Ctrl/Maj/Alt o el botó del mig obre l'enllaç). A la tauleta (`?o=tauleta`), tornar a l'inici (amb «← Volver» del pas 1 o amb la marca) o 90 segons sense tocar res descarta dades, perfil i identificador de lead; al mòbil propi es conserva la sessió.

**Enviament al full de Google:** si `leadEndpoint` (`config.js`) té una URL, els dos esdeveniments s'envien a un Google Apps Script que desa una fila per lead; sense URL (per defecte) no s'envia res. Guia: `docs/google-sheet.md`; script: `apps-script/Code.gs`; prova: `node scripts/smoke-sheet.mjs <url>`.

**Dades i esdeveniments** (només s'emeten esdeveniments a `window`; l'enviament és opcional, vegeu més amunt):
- `tsf:lead-partial` en continuar el pas 1: `{ id, stage: 'step1', name, email, phone, privacy: true, newsletter, lang, origin, profile? }`. El telèfon va com `+34 600 00 00 00`. Ja porta consentiment: no hi ha cap lead amb `privacy: false`.
- `tsf:lead` en acabar: `{ contact, profiling, hasProfiling }`; `profiling` pot portar `activity`, `activityOther`, `hasBoat`, `hasElectric`, `intent`, `demo`, `enthusiasm`, `concerns`, `factors` (llistes d'opcions amb els seus `…Other`) i `comments` (màxim 500). Comparteix `id` amb el parcial.

**Missatges de WhatsApp i correu** porten, quan existeixen, una línia per cada resposta (nom, producte, activitat, embarcació, embarcació elèctrica, entusiasme, preocupacions, intenció, factors, demostració i comentaris, aquests últims retallats a 200 caràcters) entre el text i el comiat. Sense dades són els missatges de sempre; amb un perfil sol, els de l'MVP.

**Altres peces**
- **`emailDelivery`** (`config.js`) és `false` fins que existeixi l'enviament del correu amb el dossier; només canvia el text de la confirmació.
- **`dossierFileName`** (`config.js`, general i per model) només canvia el nom amb què es desa la descàrrega, no el fitxer de `site/`. Un model amb dossier propi n'ha de tenir un (el test de config ho exigeix); un sense dossier propi descarrega el general amb el nom del general.
- **`site/dossier-prova.pdf` i `site/dossiers/*.pdf`** els genera `node scripts/make-test-pdf.mjs` i són de prova: han de ser els documents reals (un general i un per model; un model sense `dossierUrl` propi obre el general).
- **Fotografia:** `site/img/hero-m.webp` (retall 4:3 per al mòbil amb el vaixell a dalt a la dreta, 66 KB) i `site/img/hero-d.webp` (1600 px, 149 KB) surten de la foto de The Silent Fleet subministrada per l'Olga (si Bruno en té d'altres, es substitueixen); es veuen a l'inici (escena a tot sang amb el títol) i com a franja a la capçalera de la resta de pantalles i de la privacitat, amb el vel pla `overlay-hero` del sistema (sense degradats). Es substitueixen per fitxers del mateix nom (o es canvien les URL a `site/css/page.css`).
- **Literals:** a `site/js/i18n-form.js`, de tu als 4 idiomes; el document es diu «dossier» fins que Bruno decideixi. «Ski / Wake» no es tradueix.
- **Privacitat:** la pàgina mostra el text de l'Extra 1 (6 paràgrafs curts) amb `?extra1=1`; és un esborrany (no és assessorament legal).
- **Accessibilitat:** indicador de pas amb `progressbar`, focus al títol en canviar de pantalla, errors enllaçats amb els camps i capçalera com a `<header>`.
- `docs-privats/` (proposta i specs amb preus) és local i no és al repositori.

### Dades a substituir abans d'activar `extra1`

| On | Valor de prova | Qui el dona |
|---|---|---|
| `products` (`config.js`) | Modelo A / B / C, més l'opció fixa d'assessorament | Bruno: models o potències reals |
| `leadEndpoint` i `leadToken` (`config.js`) | URL `/exec` i token del full actual (**definitiu**, decidit) | Es queda aquest full (vegeu `docs/google-sheet.md`) |
| `dossierUrl` (`config.js`) i el `dossierUrl` de cada producte | `dossier-prova.pdf` general; `dossiers/model-a.pdf` i `model-b.pdf` de prova (el Modelo C usa el general) | Bruno: un PDF per model i el general |
| `dossierFileName` (`config.js`, general i per model) | `the-silent-fleet-dossier.pdf` i `the-silent-fleet-modelo-a/b.pdf` | Bruno: el nom amb què es desa cada document |
| `legalName` (`config.js`) | «The Silent Fleet» (**definitiu**, decidit) | — |
| `privacyText` (`i18n-form.js`) | Esborrany, ara amb el correu parcial | Bruno (no és assessorament legal) |
| Nom del document | «dossier» | Bruno |

### Pendent
**De Bruno**
- El document general (fitxer real) i el seu nom: «dossier» o un altre; i un PDF per model (o potència), amb quins models en tenen de propi (els altres obren el general).
- Models o potències reals, nom legal i text de privacitat (el text s'ha ampliat amb les preguntes d'opinió i els comentaris).
- Si «Profesional» ha d'enviar el missatge «distribuidor».

**De l'Olga**
- Decidir si el pas 2 (uns 2,3 pantalles, 1.730 px a 360 px, després de compactar-lo) es deixa així, es parteix en un tercer pas opcional d'opinió o es plega en un bloc que s'obre.

**Tècnic**
- Enviament del correu amb el dossier (pla posterior).
- Prova de l'enviament al full en un mòbil real i amb mala cobertura (mode avió). Ja provat: fum contra l'script desplegat, flux real al navegador i CORS.
- Menors diferits de l'enviament al full: `sendBeacon` no comprova si ha estat acceptat (Brave Shields el bloqueja amb `ERR_BLOCKED_BY_CLIENT`; l'enviament normal no es veu afectat); el client no deixa diagnòstic a la consola; una nota escrita a mà al full desplaça on s'afegeixen les files; l'identificador de producte només admet `[a-z0-9-]`; el text de privacitat no esmenta les marques de temps.
- Prova en un mòbil real: descàrrega del PDF (iOS Safari l'obre en visor), teclats, tecla «Next», autocompletat del telèfon en dos camps, el desplegable de suggeriments de prefix (`<datalist>`, no provat a iOS Safari; el navegador el filtra pel que ja hi ha escrit) i l'escena de l'inici (comprovada a 360 i 430 px en castellà, no en un dispositiu físic).
- Auditoria de la pantalla de gràcies (18/20, `docs/superpowers/specs/2026-10-12-gracies-pdf-audit.md`): la targeta clicable i el botó són dos enllaços al mateix fitxer per a lector de pantalla (P2); la targeta replica el marcatge `tsf-pdf` del sistema (demanar-li una variant amb icona); buit gran entre botó i CTA a la tauleta; el literal «Dossier The Silent Fleet» es repeteix als 4 idiomes.
- Mòbils amb la barra del navegador visible (~640 px útils): l'inici necessita scroll (~35 px més); el marge fins als 740 px és de ~30 px en anglès.
- `site/index.html` (el fallback de `#root` sense JavaScript) no porta la fotografia. El tema fosc existeix als tokens però no s'activa mai (`data-theme="light"` fix).
- Menors diferits de la revisió final: el missatge «Producto de interés» surt a l'MVP si l'URL porta `?producto=`; `maxLength` als camps; `ADVICE` com a literal a `session.js`; sense esdeveniment si es retira el consentiment.

## Abans de publicar

1. `npm test` en verd (275) i `npm run sync` sense canvis a `git status`.
2. **Interruptor `extra1`:** a `config.js` és `true` (l'Extra 1 va a la fira). **Decidit:** `legalName` és «The Silent Fleet», el full de Google actual és el definitiu i `siteUrl` es queda com està. **Bloquejos abans de publicar:** el text de privacitat és un esborrany; el dossier i els models són de prova; el número de WhatsApp és de prova. Si alguna cosa no està llesta, `extra1: false` torna a l'MVP sol.
3. **`leadEndpoint` i `leadToken`:** el full actual és el definitiu (decidit); no cal canviar-los. El token i l'URL queden visibles al web publicat: és per disseny, no són secrets. Si algun dia es canvia el full, seguir `docs/google-sheet.md` (passos 1–6) i repetir `node scripts/smoke-sheet.mjs <url> <token>`.
4. `dossierUrl` (general) i el `dossierUrl` de cada producte apunten a PDF de prova (`site/dossier-prova.pdf` i `site/dossiers/`): substituir-los pels documents reals, i no tornar a executar `scripts/make-test-pdf.mjs` (només refà fitxers de prova, però així no hi ha dubtes).
5. `siteUrl` és definitiva (decidit). Només si el repo canviés de compte caldria actualitzar-la i regenerar el QR (`npm run qr`).
6. Després de publicar: provar a la URL real (idioma, WhatsApp, correu, i amb `?extra1=1` el flux sencer), i el QR amb un mòbil.
7. **`noindex, nofollow` (decidit):** les dues pàgines (`index.html` i `privacy.html`) porten `<meta name="robots" content="noindex, nofollow">` i s'hi queden: no s'ha de treure. El test `beta: les dues pàgines porten noindex` de `tests/html.test.mjs` ho vigila.
8. Congelació de canvis el 13/10.
9. Comprovar que `…/img/hero-m.webp` i `hero-d.webp` responen 200 a la URL publicada i que el CI del PR ha passat (vegeu «Flux de treball»).

## Pendent

- Provar el QR amb un mòbil real. `siteUrl` és definitiva; el QR es genera amb `npm run qr`.
- Canvi de tipografia a `rem`, preparat però no aplicat: [docs/typeset-rem/](docs/typeset-rem/README.md).
