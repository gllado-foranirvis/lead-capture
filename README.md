# The Silent Fleet · Pàgina de captació (MVP)

Pàgina única i estàtica, en català, castellà, portuguès i anglès, perquè els visitants del Salón Náutico de Barcelona (14–18/10/2026) contactin amb The Silent Fleet per WhatsApp o correu amb un missatge ja escrit segons l'idioma i el perfil (distribuïdor o particular). L'MVP no desa dades ni usa cookies. Hi ha a més l'**Extra 1** (flux de captació en 2 passos), construït però apagat: vegeu més avall.

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
- `scripts/`: `sync-assets` (sistema de disseny, React i Montserrat), `make-qr`, `export-texts` (textos per validar), `make-test-pdf` (dossier de prova) i `rem-migration` (migració de tipografia preparada).
- `tests/`: tests (`node:test`, uns 190) de la lògica, de les pantalles amb un renderitzador fals (`tests/helpers/fake-react.mjs`), dels textos, del CSS i del HTML.
- `docs/`: `textos-contacte.md` (generat), `typeset-rem/` i `superpowers/` (especificacions i plans de cada fase; el pla `2026-10-09-extra1-reordenat` substitueix l'ordre del `2026-10-08-extra1-2-passos`).
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

**Recorregut**
1. **Inici:** pregunta de perfil sempre visible (Particular / Profesional, opcional), WhatsApp i correu, i al final el CTA «Quiero saber más de The Silent Fleet».
2. **Pas 1 de 2, contacte:** nom, correu, telèfon (prefix `+34` per defecte i número en camps separats), privacitat obligatòria i novetats. Els errors es veuen abans de seguir.
3. **Pas 2 de 2, perfilació:** perfil (obligatori, ja marcat des de l'inici), activitat (només si és Profesional, amb «Otra»), embarcació, embarcació elèctrica, què t'entusiasma, què et preocupa, intenció de compra, factors decisius (les tres últimes amb «Otro» que obre el seu camp), model o potència, localitat per a una demostració i comentaris. Només el perfil és obligatori.
4. **Confirmació:** s'obre el dossier general (dins del gest del clic, perquè el navegador no el bloquegi), hi ha el botó per reobrir-lo i un bloc de WhatsApp amb les dades de la sessió.

«← Volver» conserva el que s'ha escrit. A la tauleta (`?o=tauleta`), tornar a l'inici o 90 segons sense tocar res descarta dades, perfil i identificador de lead.

**Dades i esdeveniments** (res no s'envia encara a cap servidor; només s'emeten esdeveniments a `window`):
- `tsf:lead-partial` en continuar el pas 1: `{ id, stage: 'step1', name, email, phone, privacy: true, newsletter, lang, origin, profile? }`. El telèfon va com `+34 600 00 00 00`. Ja porta consentiment: no hi ha cap lead amb `privacy: false`.
- `tsf:lead` en acabar: `{ contact, profiling, hasProfiling }`; `profiling` pot portar `activity`, `activityOther`, `hasBoat`, `hasElectric`, `intent`, `demo`, `enthusiasm`, `concerns`, `factors` (llistes d'opcions amb els seus `…Other`) i `comments` (màxim 500). Comparteix `id` amb el parcial.

**Missatges de WhatsApp i correu** porten, quan existeixen, una línia per cada resposta (nom, producte, activitat, embarcació, embarcació elèctrica, entusiasme, preocupacions, intenció, factors, demostració i comentaris, aquests últims retallats a 200 caràcters) entre el text i el comiat. Sense dades són els missatges de sempre; amb un perfil sol, els de l'MVP.

**Altres peces**
- **`emailDelivery`** (`config.js`) és `false` fins que existeixi l'enviament del correu amb el dossier; només canvia el text de la confirmació.
- **`site/dossier-prova.pdf`** el genera `node scripts/make-test-pdf.mjs` i és de prova: ha de ser el document general de l'empresa.
- **Literals:** a `site/js/i18n-form.js`, de tu als 4 idiomes; el document es diu «dossier» fins que Bruno decideixi. «Ski / Wake» no es tradueix.
- **Privacitat:** la pàgina mostra el text de l'Extra 1 (6 paràgrafs curts) amb `?extra1=1`; és un esborrany (no és assessorament legal).
- **Accessibilitat:** indicador de pas amb `progressbar`, focus al títol en canviar de pantalla, errors enllaçats amb els camps i capçalera com a `<header>`.
- `docs-privats/` (proposta i specs amb preus) és local i no és al repositori.

### Dades a substituir abans d'activar `extra1`

| On | Valor de prova | Qui el dona |
|---|---|---|
| `products` (`config.js`) | Modelo A / B / C, més l'opció fixa d'assessorament | Bruno: models o potències reals |
| `dossierUrl` (`config.js`) | `dossier-prova.pdf` | Bruno: el document general de l'empresa |
| `legalName` (`config.js`) | PENDIENTE… | Bruno |
| `privacyText` (`i18n-form.js`) | Esborrany, ara amb el correu parcial | Bruno (no és assessorament legal) |
| Nom del document | «dossier» | Bruno |

### Pendent
**De Bruno**
- El document general (fitxer real) i el seu nom: «dossier» o un altre.
- Models o potències reals, nom legal i text de privacitat (el text s'ha ampliat amb les preguntes d'opinió i els comentaris).
- Si «Profesional» ha d'enviar el missatge «distribuidor».

**De l'Olga**
- Decidir si el pas 2 (uns 2,3 pantalles, 1.730 px a 360 px, després de compactar-lo) es deixa així, es parteix en un tercer pas opcional d'opinió o es plega en un bloc que s'obre.

**Tècnic**
- Enviament real dels leads i del correu amb el dossier (pla posterior).
- Prova en un mòbil real: bloquejador de finestres en obrir el PDF, teclats, tecla «Next» i autocompletat del telèfon en dos camps.
- Menors diferits de la revisió final: el missatge «Producto de interés» surt a l'MVP si l'URL porta `?producto=`; `maxLength` als camps; `ADVICE` com a literal a `session.js`; sense esdeveniment si es retira el consentiment.

## Pendent

- Provar el QR amb un mòbil real. El repo és provisional (`gllado-foranirvis`); si passa al compte de The Silent Fleet, la URL de Pages i el QR canvien: actualitzar `siteUrl` i executar `npm run qr`.
- Canvi de tipografia a `rem`, preparat però no aplicat: [docs/typeset-rem/](docs/typeset-rem/README.md).
