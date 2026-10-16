# Dossier multiselecció Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reactivar el dossier en PDF i deixar triar més d'un model, de manera que amb 2 o més PDF diferents la confirmació els pugui descarregar tots.

**Architecture:** `values.product` (string) passa a `values.products` (array) amb «asesoramiento» excloent. Una funció pura `dossiersFor` converteix la selecció en una llista de PDF sense duplicats; la pantalla de confirmació pinta una targeta per PDF i, si n'hi ha 2 o més, un botó que els clica tots seguits (`downloadAll`). Al lead i al full de Google el producte continua sent un sol text: els ids units amb comes.

**Tech Stack:** JS ES modules sense compilació, React 18 (UMD) + sistema de disseny `window.TSF`, `node --test` (`npm test`), Google Apps Script.

**Spec:** `docs/superpowers/specs/2026-10-16-dossier-multiseleccio.md`

## Global Constraints

- Literals d'usuari en 4 idiomes (`es`, `ca`, `pt`, `en`) a `site/js/i18n-form.js`; els tests de paritat de claus han de seguir passant.
- Sense dependències noves ni pas de compilació; tests amb `node --test` (`npm test`, 275+ tests verds abans i després).
- Comentaris del codi en català, com la resta del repositori.
- `contact.product` del lead continua sent un `string` (ids amb comes, sense espais); no canvia la forma de `finalPayload`/`partialPayload`.
- La versió de contingència (`dossier: false` o `?dossier=0`) no ha de mostrar ni preguntar res nou.

## Review Focus

- Marcar «asesoramiento» amb models ja marcats (i al revés): mai poden coexistir.
- Models sense dossier propi + «asesoramiento» o cap model: el general surt **una sola vegada**, no repetit.
- `?producto=` desconegut o `asesoramiento`: formulari net / només «asesoramiento»; no peta.
- Un model amb `dossierUrl` però sense `dossierFileName`: la targeta es descarrega amb el nom del fitxer (`download=""`), sense heretar el nom del general.
- Script de Google antic o llista de ids massa llarga: el lead no es perd, el producte només queda buit.

---

### Task 1: Estat del formulari: `products` multiselecció

**Files:**
- Modify: `site/js/form/model.js` (`emptyForm`, `formReducer`), `site/js/form/context.js` (`resolveProduct`), `site/js/form/flow.js`
- Test: `tests/form-model.test.mjs`, `tests/form-context.test.mjs`, `tests/form-flow.test.mjs`

**Interfaces:**
- Produces: `emptyForm({ products = [] } = {}) -> { products: string[], ... }` (substitueix el camp `product`); `resolveProducts(search: string, products: {id}[]) -> string[]` (substitueix `resolveProduct`; `[]` o `[id]`); `formReducer` amb `{ type: 'toggle', field: 'products', value }` excloent per a `ADVICE`; `handleSubmit` desa `receipt.products` (array) en lloc de `receipt.product`, i tots els `reset` porten `initial: { products }`.
- Consumes: `ADVICE` de `model.js`.

- [ ] **Step 1: Escriure els tests que fallen**
  - `form-model.test.mjs`: `emptyForm().products` és `[]` i `emptyForm({ products: ['model-a'] }).products` és `['model-a']`; actualitzar l'objecte esperat de `emptyForm` (clau `products: []` en lloc de `product: ''`) i els `reset` (`initial: { products: ['model-a'] }`).
  - Nou test `toggle products`: partint de `emptyForm()`, `toggle('model-a')` → `['model-a']`; després `toggle('model-b')` → `['model-a','model-b']`; `toggle('model-a')` → `['model-b']`; `toggle('asesoramiento')` → `['asesoramiento']`; `toggle('model-a')` → `['model-a']` (desmarca l'assessorament); `toggle('asesoramiento')` sobre `['asesoramiento']` → `[]`.
  - `form-context.test.mjs`: `resolveProducts('?producto=model-a', PRODUCTS)` = `['model-a']`, `'?producto=asesoramiento'` = `['asesoramiento']`, `'?producto=inventat'` i `''` = `[]`.
  - `form-flow.test.mjs`: substituir `product: 'model-a'` per `products: ['model-a']` a `emptyForm`, al `receipt` esperat (línia 59) i a tots els `initial` esperats (`{ products: ['model-a'] }` / `{ products: [] }`).
- [ ] **Step 2: Executar** `node --test tests/form-model.test.mjs tests/form-context.test.mjs tests/form-flow.test.mjs` — Expected: FAIL.
- [ ] **Step 3: Implementar** `emptyForm`, el cas `toggle` de `formReducer` (si `field === 'products'` aplica la regla excloent; la resta de camps com fins ara) i `resolveProducts` a `context.js`; a `flow.js` (`handleSubmit`, `leaveToEntry`, `discardSession`) usar `resolveProducts` i `receipt.products = values.products`.
- [ ] **Step 4: Executar** les mateixes ordres — Expected: PASS (la resta de la suite pot fallar fins a les tasques 2-4).
- [ ] **Step 5: Commit** `git add site/js/form tests && git commit -m "feat: l'estat del formulari guarda una llista de models (products) amb «asesoramiento» excloent"`

### Task 2: Lead, sessió i full de Google amb diversos productes

**Files:**
- Modify: `site/js/form/lead.js` (`buildContact`), `site/js/form/session.js` (`toSession`), `apps-script/Code.gs` (`sanitizeLead`), `docs/google-sheet.md`
- Test: `tests/form-lead.test.mjs`, `tests/form-session.test.mjs`, `tests/apps-script.test.mjs`

**Interfaces:**
- Consumes: `values.products: string[]` (Task 1).
- Produces: `contact.product: string` = `values.products.join(',')`; `toSession(values, ...).product: string` = noms (o `dict.form.productAdvice`) separats per `', '`, ignorant ids desconeguts; a `Code.gs`, `product` és vàlid si compleix `/^[a-z0-9-]{1,40}(,[a-z0-9-]{1,40}){0,9}$/`, si no `''`.

- [ ] **Step 1: Escriure els tests que fallen**
  - `form-lead`: amb `products: ['model-a','model-b']` el lead final té `contact.product === 'model-a,model-b'`; amb `[]` és `''`; el lead parcial no porta `product`.
  - `form-session`: `products: ['model-a','x']` → `product: 'Modelo A'`; `['model-a','asesoramiento']` (no hauria de passar, però) → `'Modelo A, No lo sé aún'`; afegir un segon model a `products` del test per provar `'Modelo A, Modelo B'`; buit → `''`.
  - `apps-script`: `product: 'model-a,model-b'` es desa tal qual; `'model-a,'`, `'a b'` i 11 ids → `''`; el lead no es rebutja.
- [ ] **Step 2: Executar** `node --test tests/form-lead.test.mjs tests/form-session.test.mjs tests/apps-script.test.mjs` — Expected: FAIL.
- [ ] **Step 3: Implementar** els tres canvis anteriors. A `docs/google-sheet.md`, afegir que la columna `product` pot portar diversos ids separats per comes i que cal **desplegar una nova versió** de l'script (Implementar → Gestionar implementacions → Editar → Nova versió) perquè els accepti; canviar també `scripts/smoke-sheet.mjs` només si el diff pendent del telèfon es vol conservar (no tocar-lo en aquesta tasca).
- [ ] **Step 4: Executar** les mateixes ordres — Expected: PASS.
- [ ] **Step 5: Commit** `git add site/js/form apps-script docs/google-sheet.md tests && git commit -m "feat: el lead, els missatges i el full de Google accepten diversos productes"`

### Task 3: Quins PDF s'ofereixen i com es descarreguen tots

**Files:**
- Modify: `site/js/form/dossier.js` (substitueix `dossierFor`, `dossierMeta`, `dossierFileFor`)
- Create: `site/js/form/download-all.js`
- Test: `tests/form-dossier.test.mjs` (reescriure), `tests/form-download-all.test.mjs` (nou)

**Interfaces:**
- Produces:
  - `dossiersFor(productIds: string[], config, generalMeta: string) -> Array<{ href: string, file: string, meta: string }>`. Regles: primer, en l'ordre de `config.products`, un element per cada id triat amb `dossierUrl` propi (`file = dossierFileName || ''`, `meta = name`); després el general (`file = config.dossierFileName || ''`, `meta = generalMeta`) si no hi ha cap id triat que tingui dossier propi **o** algun id triat és «asesoramiento», desconegut o sense dossier propi; sense duplicats per `href`; si `config.dossierUrl` és buit el general no s'afegeix.
  - `downloadAll(docs: Array<{href,file}>, { doc = document, delayMs = 400, schedule = setTimeout } = {}) -> void`: crea un `<a>` temporal per fitxer (`href`, `download = file`), el clica i el treu; el primer clic és **síncron**, els següents es programen amb `schedule(fn, delayMs * index)`.
- Consumes: `CONFIG.products[]` / `dossierUrl` / `dossierFileName` (forma de `config.js`).

- [ ] **Step 1: Escriure els tests que fallen**
  - `form-dossier`: amb la config del test actual (`a` amb PDF propi, `b` sense, `c` amb `''`): `['a']` → 1 element (`dossiers/a.pdf`, meta `Model a`); `['a','b']` → `a.pdf` + general; `['b','c']` → només el general (1 cop); `[]`, `['asesoramiento']`, `['desconegut']` → només el general; `['a','asesoramiento']` → `a.pdf` + general; sense `dossierUrl` general i `['b']` → `[]`; model amb PDF propi sense `dossierFileName` → `file === ''`.
  - `form-download-all`: amb un `doc` fals (`createElement` retorna `{ click(){log.push(href)}, remove(){} }`, `body.appendChild`) i `schedule` que només grava `(fn, ms)`: amb 3 docs, just després de la crida hi ha 1 clic; en executar els programats surten els 3 en ordre, amb `ms` 400 i 800; cada `<a>` porta el seu `download`.
- [ ] **Step 2: Executar** `node --test tests/form-dossier.test.mjs tests/form-download-all.test.mjs` — Expected: FAIL.
- [ ] **Step 3: Implementar** `dossiersFor` i `downloadAll` amb la signatura anterior (funcions pures, sense React).
- [ ] **Step 4: Executar** les mateixes ordres — Expected: PASS.
- [ ] **Step 5: Commit** `git add site/js/form tests && git commit -m "feat: dossiersFor (PDF sense duplicats) i downloadAll"`

### Task 4: Pantalles: pregunta múltiple i confirmació amb diverses targetes

**Files:**
- Modify: `site/js/ui/step-profile.js`, `site/js/ui/done-screen.js`, `site/js/i18n-form.js`, `site/js/app.js`, `site/css/page.css` (l'ajust responsive es fa a la Task 5)
- Test: `tests/ui-steps.test.mjs`, `tests/no-dossier.test.mjs`, `tests/i18n.test.mjs`/`tests/form-i18n.test.mjs` (paritat de claus, ja existent)

**Interfaces:**
- Consumes: `values.products`, `receipt.products` (Task 1); `dossiersFor`, `downloadAll` (Task 3); `makeFields().checks(field, legend, options)` (existent).
- Produces: `StepProfile` pinta `checks('products', f.productLegend, productOptions)` (`T.CheckboxGroup`, name `products`) en lloc del xip `product`, mantenint la posició (entre `factors` i `demo`) i el `askProduct`; `DoneScreen({ t, emailDelivery, docs, onDownloadAll, whatsappHref, emailHref, onHome })` on `docs: Array<{href,file,meta}>` substitueix `dossierHref/dossierFile/docMeta`; nova clau `form.doneDownloadAll` als 4 idiomes: es «Descargar todos los dossiers», ca «Descarregar tots els dossiers», pt «Descarregar todos os dossiers», en «Download all dossiers».

- [ ] **Step 1: Escriure els tests que fallen**
  - `ui-steps`: l'ordre de camps esperat canvia `'product'` → `'products'` (línies 169 i 174); el grup `products` és un `CheckboxGroup` amb `values` = `values.products` i una opció per producte més l'assessorament; `onToggle('products', id)` es crida en marcar.
  - `done-screen` (a `ui-steps` o `no-dossier`): amb `docs` de 1 element, 1 `<a download>` de targeta + 1 botó i **cap** botó «todos»; amb 2 elements, 2 targetes (sense `tabIndex: -1`, perquè ara són l'única via per fitxer) i un botó amb text `doneDownloadAll` que crida `onDownloadAll`; amb `docs: []`, cap `<a download>`.
  - `no-dossier`: adaptar la crida de `DoneScreen` a `docs: []` i `byName(..., 'products')`; `form-i18n`: les 4 llengües tenen `doneDownloadAll` i no apareix a la versió sense dossier (`FORM_NO_DOSSIER` no cal tocar-lo, la pantalla no el mostra).
- [ ] **Step 2: Executar** `npm test` — Expected: FAIL en els tests anteriors.
- [ ] **Step 3: Implementar** els canvis de `step-profile.js`, `done-screen.js` i `i18n-form.js`; a `app.js`, `docs = dossier ? dossiersFor(receipt?.products ?? [], CONFIG, t.form.doneCardGeneral) : []` i `onDownloadAll: () => downloadAll(docs)` (ha de cridar-se directament des del `onClick`, sense `await`, perquè el primer clic sigui dins del gest del visitant); importar-ho i eliminar els imports antics de `form/dossier.js`.
- [ ] **Step 4: Executar** `npm test` — Expected: PASS (tota la suite).
- [ ] **Step 5: Commit** `git add site tests && git commit -m "feat: pregunta de models multiselecció i confirmació amb una targeta per PDF i «descargar todos»"`

### Task 5: Adaptar els elements nous amb `/impeccable adapt`

**Files:**
- Modify: `site/css/page.css` (i, si cal, `site/ds/` només per classes pròpies de la pàgina; no tocar el bundle del sistema de disseny)
- Test: `tests/css.test.mjs` (ja vigila que el CSS usi tokens i rem)

**Interfaces:**
- Consumes: el grup de caselles `products` (`step-profile.js`) i les targetes múltiples + botó «todos» (`done-screen.js`) de la Task 4; `PRODUCT.md` i `DESIGN.md` com a context de disseny.

- [ ] **Step 1: Executar la skill** `/impeccable adapt` sobre els dos elements nous: (a) el grup de caselles «Modelo o potencia de interés» al pas 2 i (b) la pila de targetes de descàrrega amb el botó «Descargar todos los dossiers» a la confirmació. Criteris que cal demanar-li: viewports de 360, 390, 768 i escriptori (la tauleta de l'estand és `?o=tauleta`); àrees tàctils d'almenys 44 px; noms de model llargs que no trenquin el disseny; 1, 2 i 4+ targetes sense saltar de lloc el botó principal; tots els idiomes (el text de `doneDownloadAll` en pt/ca és el més llarg).
- [ ] **Step 2: Revisar el resultat** contra `DESIGN.md`: només tokens del sistema (res de colors ni px nous, es fan servir `rem` i `var(--space-*)`), el mateix aspecte que la targeta única d'avui, i cap canvi a pantalles que no són d'aquesta funció.
- [ ] **Step 3: Executar** `npm test` — Expected: tots els tests passen (inclòs `tests/css.test.mjs`).
- [ ] **Step 4: Comprovar al navegador** amb `npm run serve` (390 px i 768 px, amb `?extra1=1` i amb `&o=tauleta`) el pas 2 amb 3+ models marcats i la confirmació amb 1, 2 i 3 PDF.
- [ ] **Step 5: Commit** `git add site/css tests && git commit -m "feat: adaptació responsive de la tria de models i de les targetes de descàrrega"`

### Task 6: Reactivar el dossier i comprovar-ho al navegador

**Files:**
- Modify: `site/js/config.js` (`dossier: true`; actualitzar el comentari de la clau i de `products`), `docs/superpowers/README.md` (fila 16/10), `docs/superpowers/specs/2026-10-09-dossier-per-model.md` (nota «Actualitzat»), `README.md`/`PRODUCT.md` només si anomenen la tria d'un sol model
- Test: `tests/config.test.mjs` (ja valida URLs i noms)

**Interfaces:**
- Consumes: tot l'anterior.

- [ ] **Step 1: Canviar** `dossier: false` → `true` a `config.js` i afegir la fila de la fase a l'índex de `docs/superpowers/README.md`.
- [ ] **Step 2: Executar** `npm test` — Expected: tots els tests passen.
- [ ] **Step 3: Verificació manual** amb `npm run serve` i `http://localhost:8080/?extra1=1`: (a) passar els dos passos marcant Modelo A + Modelo B → 2 targetes i el botó «todos» baixa 2 PDF; (b) Modelo A + Modelo C → targeta de A i la general; (c) només Modelo C o «asesoramiento» → una sola targeta, sense botó «todos»; (d) marcar un model i després «asesoramiento» desmarca el model; (e) `?dossier=0` no mostra la pregunta ni cap descàrrega; (l'aspecte de les caselles al mòbil ja s'ha revisat a la Task 5). Si el navegador demana permís per a descàrregues múltiples, confirmar que les targetes individuals segueixen funcionant.
- [ ] **Step 4: Commit** `git add site docs README.md PRODUCT.md && git commit -m "feat: dossier reactivat amb multiselecció de models"`
