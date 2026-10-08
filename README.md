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

## Extra 1: formulari de contacte i perfilació

La pantalla del formulari («Recibe la ficha del producto») és **apagada per defecte**: l'MVP continua igual per als visitants. Es veu amb `?extra1=1` (per exemple `?lang=es&extra1=1`) o posant `extra1: true` a `site/js/config.js`. Altres paràmetres: `?producto=<id>` preselecciona el producte i `?o=tauleta` marca l'origen.

- En enviar un formulari vàlid dispara l'esdeveniment `tsf:lead` a `window` amb `{ contact, profiling, hasProfiling }`. **Encara no s'envia enlloc**: l'enviament als Google Forms, el PDF i la pantalla de gràcies són el pla següent; ara es mostra un avís provisional.
- `products` i `legalName` de `config.js` són de prova fins que Bruno els doni. El text de privacitat de l'Extra 1 és un esborrany sense validar (no és assessorament legal).
- Els literals són a `site/js/i18n-form.js`. El tractament és proper, i «Ski / Wake» no es tradueix.
- `docs-privats/` (proposta i specs amb preus) és local i no és al repositori.

## Pendent

- Provar el QR amb un mòbil real. El repo és provisional (`gllado-foranirvis`); si passa al compte de The Silent Fleet, la URL de Pages i el QR canvien: actualitzar `siteUrl` i executar `npm run qr`.
- Canvi de tipografia a `rem`, preparat però no aplicat: [docs/typeset-rem/](docs/typeset-rem/README.md).
