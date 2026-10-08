# The Silent Fleet · Pàgina de captació (MVP)

Pàgina única i estàtica, en català, castellà, portuguès i anglès, perquè els visitants del Salón Náutico de Barcelona (14–18/10/2026) contactin amb The Silent Fleet per WhatsApp o correu amb un missatge ja escrit segons l'idioma i el perfil (distribuïdor o particular). No desa dades ni usa cookies.

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

- `site/`: el que es publica. `ds/`, `vendor/` i `fonts/` són generats per `npm run sync` i es versionen.
- `the-silent-fleet-ds/`: còpia local del sistema de disseny (font de la veritat visual; no s'edita aquí).
- `scripts/`, `tests/`: eines i tests (`node:test`).
- `.github/workflows/pages.yml`: desplegament a GitHub Pages en cada push a `main`.

## Dades de prova a substituir abans de la fira

| On | Valor actual | Qui el dona |
|---|---|---|
| `site/js/config.js` · `whatsappNumber` | `+34 600 00 00 00` | Bruno (WhatsApp Business) |
| `site/js/config.js` · `siteUrl` | `https://gllado-foranirvis.github.io/lead-capture/` (compte provisional) | URL de Pages; si el repo passa al compte de The Silent Fleet, canviar-la i `npm run qr` |
| `site/index.html` (fallback de `#root`) | el mateix número i correu de `config.js` | `npm test` falla si no coincideixen |
| `site/js/i18n.js` · perfils | «Distribuidor» / «Particular» (la proposta); el wireframe diu «Propietario» / «Interesado» | Olga i Bruno |
| `site/js/i18n.js` · títol, subtítol, missatges i privacitat | Textos de mostra en 4 idiomes | Bruno valida; l'Olga revisa la traducció |
| Logotip | Es mostra el nom en text (`wordmark`); el sistema no en té | Bruno, si en té |

## Icones i llicències

Els botons de WhatsApp i correu porten una icona en línia (`site/js/icons.js`, en `currentColor`):

- **WhatsApp:** glif de [Simple Icons](https://simpleicons.org) 16.31.0 (CC0). La marca és de WhatsApp LLC i només s'usa en una tinta, la del botó.
- **Correu:** icona `mail` de [Lucide](https://lucide.dev) 1.47.0 (ISC); el text de la llicència és a `docs/licenses/lucide-ISC-LICENSE.txt`.

## Extra 1: flux de captació en 2 passos

El flux és **apagat per defecte**: l'MVP continua igual per als visitants. Es veu amb `?extra1=1` (per exemple `?lang=es&extra1=1`) o posant `extra1: true` a `site/js/config.js`. Altres paràmetres: `?producto=<id>|asesoramiento` preselecciona el producte i `?o=tauleta` marca l'origen.

**Recorregut:** entrada (un sol botó principal, sense xips de perfil) → pas 1 (producte i correu) → pas 2 (nom, perfil, telèfon, si té embarcació, privacitat, novetats) → confirmació (s'obre `CONFIG.dossierUrl` i s'ofereix WhatsApp). «← Volver» conserva el que s'ha escrit; els errors del pas 1 es veuen abans de seguir.

- **Esdeveniments `window`** (res no s'envia encara a cap servidor): `tsf:lead-partial` en passar del pas 1 al 2, amb `{ id, stage: 'step1', product, email, privacy: false, lang, origin }`, i `tsf:lead` en acabar, amb `{ contact, profiling, hasProfiling }`. Comparteixen `id`. El lead parcial queda registrat com a **privacitat no acceptada**.
- **WhatsApp i correu** porten les dades de la sessió (nom, producte, si té embarcació) en una línia entre el text i el comiat; sense dades són els missatges de sempre.
- **Document:** s'obre en prémer el botó final (dins del gest, perquè el navegador no el bloquegi). `site/dossier-prova.pdf` el genera `scripts/make-test-pdf.mjs` i és de prova.
- **`emailDelivery`** (`config.js`) és `false` fins que existeixi l'enviament del correu amb la ficha; només canvia el text de la confirmació.
- Els literals són a `site/js/i18n-form.js` (tracte proper; el document es diu «ficha» fins que Bruno decideixi).
- `docs-privats/` (proposta i specs amb preus) és local i no és al repositori.

### Dades a substituir abans d'activar `extra1`

| On | Valor de prova | Qui el dona |
|---|---|---|
| `products` (`config.js`) | Modelo A / B / C, més l'opció fixa d'assessorament | Bruno: models o potències reals |
| `dossierUrl` (`config.js`) | `dossier-prova.pdf` | Bruno: el document real |
| `legalName` (`config.js`) | PENDIENTE… | Bruno |
| `privacyText` (`i18n-form.js`) | Esborrany, ara amb el correu parcial | Bruno (no és assessorament legal) |
| Nom del document | «ficha» | Bruno: «ficha» o «dossier» |

### Pendent de Bruno
- Si es pot desar el correu abans del consentiment (el pas 1 el desa amb `privacy: false`).
- Si «Profesional» ha d'enviar el missatge «distribuidor».
- Enviament real del correu amb la ficha (pla posterior) i prova en un mòbil real (finestres emergents, teclats, autocompletat).

## Pendent

- Provar el QR amb un mòbil real. El repo és provisional (`gllado-foranirvis`); si passa al compte de The Silent Fleet, la URL de Pages i el QR canvien: actualitzar `siteUrl` i executar `npm run qr`.
- Canvi de tipografia a `rem`, preparat però no aplicat: [docs/typeset-rem/](docs/typeset-rem/README.md).
