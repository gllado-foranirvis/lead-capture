# Dossier per model Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que el dossier que s'obre en acabar el flux de l'Extra 1 (i el botó «Abrir el dossier») sigui el del model triat, amb el document general com a alternativa.

**Architecture:** Un mòdul pur `site/js/form/dossier.js` tria la URL a partir del producte i de la configuració (`dossierFor`) i l'obre (`openDossier`, amb la funció d'obrir injectable per als tests). `flow.js` passa el producte a `openDocument` en l'enviament; `app.js` el fa servir també al botó de reobrir amb el producte guardat al `receipt`. La configuració guanya un `dossierUrl` opcional per producte.

**Tech Stack:** JS pla (mòduls ES), `node:test`, PDF de prova generats per un script de Node.

**Spec:** `docs/superpowers/specs/2026-10-09-dossier-per-model.md`. Base: `docs/superpowers/specs/2026-10-09-extra1-reordenat.md`.

## Global Constraints

- Treballar a una branca nova `extra1-dossiers` des de `main` (`git switch -c extra1-dossiers`). Cap `git push`, `git merge` ni PR sense que l'Olga ho demani.
- Cada commit acaba amb la línia `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>` (segon `-m`).
- Línia de base: `npm test` = 231 tests verds abans de començar.
- Cap llibreria nova, cap `npm install`, cap petició externa: els PDF són a `site/` i les URL són relatives.
- El document s'obre de manera **síncrona** dins del gest de l'usuari: la tria de la URL no pot ser asíncrona.
- Els literals (`i18n-form.js`) no canvien. L'esdeveniment `tsf:lead`, l'script de Google i el full no canvien.
- `page.css` no es toca. Sense `!`/`¡` ni emojis als textos.

## Review Focus

- Un producte sense `dossierUrl` propi (o amb `''`) obre el document general (Task 1).
- «No lo sé aún / Busco asesoramiento», cap model triat i un id desconegut (p. ex. `?producto=` antic) obren el general (Task 1).
- Sense cap `dossierUrl` configurat no s'obre res i no hi ha error (Task 1).
- El producte arriba a `openDocument` **abans** que el formulari es buidi després de l'enviament (Task 2: el test de `flow` comprova l'argument i que la crida és la primera).
- El botó de reobrir, després que el formulari s'hagi netejat, obre el dossier del model del `receipt` (Task 2: `openDossier` amb el producte del receipt; el cablatge d'`app.js` es comprova a mà).
- Tots els `dossierUrl` de la configuració existeixen a `site/`, són relatius i són PDF (un 404 a la fira seria silenciós) (Task 2).

## File Structure

```
site/js/form/dossier.js        (nou)      dossierFor i openDossier
site/js/form/flow.js           (modifica) handleSubmit passa el producte a openDocument
site/js/app.js                 (modifica) openDocument(productId); el botó de reobrir usa el producte del receipt
site/js/config.js              (modifica) dossierUrl per producte (Modelo A i B; C usa el general)
site/index.html                (modifica) modulepreload de dossier.js
scripts/make-test-pdf.mjs      (modifica) genera el general i un PDF de prova per model
site/dossiers/model-a.pdf, model-b.pdf   (generats, es versionen)
README.md, PRODUCT.md          (modifica)
tests/form-dossier.test.mjs    (nou)      tests/form-flow.test.mjs, tests/config.test.mjs (modifiquen)
```

---

### Task 1: Tria i obertura del dossier

**Files:**
- Create: `site/js/form/dossier.js`
- Test: `tests/form-dossier.test.mjs`

**Interfaces:**
- Consumes: la forma de la configuració (`{ dossierUrl, products: [{ id, name, dossierUrl? }] }`).
- Produces: `dossierFor(productId: string, config) -> string` (URL del producte, o la general, o `''`); `openDossier(productId, config, open?) -> string` (crida `open(url, '_blank', 'noopener')` si hi ha URL; retorna la URL; `open` per defecte és `window.open`).

- [ ] **Step 1: Crear la branca**

```bash
cd "/Users/olgagarcia/vibe coding/lead capture"
git switch main && git switch -c extra1-dossiers && npm test 2>&1 | grep -E "^# (pass|fail)"
```
Expected: `# pass 231`, `# fail 0`.

- [ ] **Step 2: Test que falla**

```js
// tests/form-dossier.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { dossierFor, openDossier } from '../site/js/form/dossier.js';

const config = {
  dossierUrl: 'dossier-general.pdf',
  products: [
    { id: 'a', name: 'A', dossierUrl: 'dossiers/a.pdf' },
    { id: 'b', name: 'B' },
    { id: 'c', name: 'C', dossierUrl: '' },
  ],
};

test('un producte amb dossier propi obre el seu', () => {
  assert.equal(dossierFor('a', config), 'dossiers/a.pdf');
});
test('un producte sense dossier propi, o amb cadena buida, obre el general', () => {
  assert.equal(dossierFor('b', config), 'dossier-general.pdf');
  assert.equal(dossierFor('c', config), 'dossier-general.pdf');
});
test('sense model, amb «asesoramiento» o amb un id desconegut s\'obre el general', () => {
  for (const id of ['', 'asesoramiento', 'model-antic', undefined]) assert.equal(dossierFor(id, config), 'dossier-general.pdf', String(id));
});
test('sense cap dossier configurat no hi ha URL', () => {
  assert.equal(dossierFor('a', { products: [{ id: 'a' }] }), '');
});
test('openDossier obre en una pestanya nova, sense opener, i retorna la URL', () => {
  const calls = [];
  const url = openDossier('a', config, (...args) => calls.push(args));
  assert.equal(url, 'dossiers/a.pdf');
  assert.deepEqual(calls, [['dossiers/a.pdf', '_blank', 'noopener']]);
});
test('openDossier no fa res si no hi ha URL', () => {
  const calls = [];
  assert.equal(openDossier('a', { products: [] }, (...args) => calls.push(args)), '');
  assert.deepEqual(calls, []);
});
```

- [ ] **Step 3: Veure'l fallar.** Run: `node --test tests/form-dossier.test.mjs 2>&1 | grep -E "^# (pass|fail)"` → Expected: `# fail 1` (no existeix `dossier.js`).

- [ ] **Step 4: Implementar**

```js
// site/js/form/dossier.js
// Quin dossier s'obre: el del model triat si en té, i si no el general. Síncron: s'ha d'obrir dins del gest del clic.
export function dossierFor(productId, config) {
  const own = config.products?.find((p) => p.id === productId)?.dossierUrl;
  return own || config.dossierUrl || '';
}

export function openDossier(productId, config, open = (...args) => window.open(...args)) {
  const url = dossierFor(productId, config);
  if (url) open(url, '_blank', 'noopener');
  return url;
}
```

- [ ] **Step 5: Veure'l passar.** Run: `node --test tests/form-dossier.test.mjs 2>&1 | grep -E "^# (pass|fail)"` → Expected: `# pass 6`, `# fail 0`.

- [ ] **Step 6: Commit**

```bash
git add site/js/form/dossier.js tests/form-dossier.test.mjs docs/superpowers/specs/2026-10-09-dossier-per-model.md docs/superpowers/plans/2026-10-09-dossier-per-model.md
git commit -m "feat: tria del dossier segons el model (el general com a alternativa)" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 2: Cablatge, configuració, PDF de prova i documentació

**Files:**
- Modify: `site/js/form/flow.js`, `site/js/app.js`, `site/js/config.js`, `site/index.html`, `scripts/make-test-pdf.mjs`, `README.md`, `PRODUCT.md`
- Generate: `site/dossiers/model-a.pdf`, `site/dossiers/model-b.pdf` (i `site/dossier-prova.pdf` regenerat, idèntic)
- Test: `tests/form-flow.test.mjs`, `tests/config.test.mjs` (modifiquen)

**Interfaces:**
- Consumes: `openDossier(productId, config)` (Task 1).
- Produces: `handleSubmit` crida `openDocument(values.product)` (la funció rep l'id del producte); `CONFIG.products[i].dossierUrl` opcional; fitxers PDF existents per a cada `dossierUrl`.

- [ ] **Step 1: Tests que fallen**

A `tests/form-flow.test.mjs`, dins del test «enviament final: obre el document PRIMER…», després de `assert.equal(names(calls)[0], 'openDocument');` afegir:

```js
  assert.deepEqual(calls[0], ['openDocument', 'model-a'], 'el producte arriba a openDocument abans que el formulari es buidi');
```

A `tests/config.test.mjs`, substituir el test «el document de prova existeix a site/ i és un PDF» per:

```js
test('cada dossier configurat (general i per model) és una ruta relativa a un PDF que existeix a site/', async () => {
  const { existsSync, readFileSync } = await import('node:fs');
  assert.equal(CONFIG.emailDelivery, false);
  const urls = [CONFIG.dossierUrl, ...CONFIG.products.map((p) => p.dossierUrl).filter(Boolean)];
  assert.ok(urls.length >= 3, 'el general i almenys dos models amb dossier propi');
  for (const url of urls) {
    assert.doesNotMatch(url, /^[a-z]+:|^\/|\.\./i, `${url}: ha de ser una ruta relativa dins de site/`);
    assert.ok(existsSync(`site/${url}`), `${url} no existeix a site/`);
    const pdf = readFileSync(`site/${url}`, 'latin1');
    assert.ok(pdf.startsWith('%PDF-') && pdf.trimEnd().endsWith('%%EOF'), `${url} no és un PDF`);
  }
});
test('hi ha com a mínim un model amb dossier propi i un que usa el general', () => {
  assert.ok(CONFIG.products.some((p) => p.dossierUrl));
  assert.ok(CONFIG.products.some((p) => !p.dossierUrl));
});
```

- [ ] **Step 2: Veure'ls fallar.** Run: `node --test tests/form-flow.test.mjs tests/config.test.mjs 2>&1 | grep -E "^# (pass|fail)|^not ok"` → Expected: fallen el de `flow` (l'argument és `undefined`) i els de `config` (cap model amb `dossierUrl`).

- [ ] **Step 3: Implementar**

`site/js/form/flow.js`, a `handleSubmit`, canviar `openDocument();` per:

```js
  openDocument(values.product);
```

`site/js/app.js`: afegir l'import després del de `session.js`:

```js
import { openDossier } from './form/dossier.js';
```

canviar la definició d'`openDocument`:

```js
const openDocument = (productId) => openDossier(productId, CONFIG);
```

i a la pantalla `done`, canviar `onOpen: openDocument,` per (el botó passa l'esdeveniment del clic com a argument, per això no es pot passar `openDocument` directament):

```js
onOpen: () => openDocument(receipt?.product),
```

`site/js/config.js`, canviar els productes:

```js
  products: [ // PROVA: substituir per la llista real de Bruno; dossierUrl opcional per model (si no, s'obre el general)
    { id: 'model-a', name: 'Modelo A', dossierUrl: 'dossiers/model-a.pdf' },
    { id: 'model-b', name: 'Modelo B', dossierUrl: 'dossiers/model-b.pdf' },
    { id: 'model-c', name: 'Modelo C' },
  ],
```

`site/index.html`: afegir, a continuació de la línia `modulepreload` de `js/form/session.js`:

```html
<link rel="modulepreload" href="js/form/dossier.js">
```

`scripts/make-test-pdf.mjs` (substituir sencer):

```js
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { CONFIG } from '../site/js/config.js';

function pdfFor(label) {
  const stream = `BT /F1 18 Tf 72 760 Td (${label}) Tj ET`;
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = objects.map((body, i) => {
    const at = pdf.length;
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
    return at;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('')}`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return pdf;
}

// Documents de prova: el general i un per cada model amb dossier propi (el títol diu quin és, per veure quin s'ha obert).
writeFileSync(`site/${CONFIG.dossierUrl}`, pdfFor('The Silent Fleet - documento de prueba'), 'latin1');
for (const product of CONFIG.products.filter((p) => p.dossierUrl)) {
  mkdirSync(dirname(`site/${product.dossierUrl}`), { recursive: true });
  writeFileSync(`site/${product.dossierUrl}`, pdfFor(`The Silent Fleet - documento de prueba - ${product.name}`), 'latin1');
}
```

Run: `node scripts/make-test-pdf.mjs && ls site/dossiers site/dossier-prova.pdf && git status --short site/dossier-prova.pdf`
Expected: `model-a.pdf` i `model-b.pdf` creats; `dossier-prova.pdf` sense canvis al `git status` (el text és el mateix).

Documentació. A `README.md`:
- A la taula «Dades a substituir abans d'activar `extra1`», canviar la fila de `dossierUrl` per `| `dossierUrl` (`config.js`) i `dossierUrl` de cada producte | `dossier-prova.pdf` general; `dossiers/model-a.pdf` i `model-b.pdf` de prova (el Modelo C usa el general) | Bruno: un PDF per model i el general |`.
- A «Recorregut», al punt de la confirmació, substituir «s'obre el dossier general» per «s'obre el dossier del model triat (o el general si no n'hi ha)».
- A «Altres peces», la línia de `site/dossier-prova.pdf` passa a: «**`site/dossier-prova.pdf` i `site/dossiers/*.pdf`** els genera `node scripts/make-test-pdf.mjs` i són de prova: han de ser els documents reals (un general i un per model).».

A `PRODUCT.md`, on diu «flux de captació en 2 passos amb perfilació i dossier general», posar «…perfilació i dossier segons el model triat (o el general)».

- [ ] **Step 4: Suite sencera.** Run: `npm test 2>&1 | grep -E "^# (pass|fail)|^not ok"` → Expected: `# fail 0` (231 + 6 + 1 = 238). Si el test `html` es queixa d'un `modulepreload`, afegir-lo.

- [ ] **Step 5: Comprovació manual al navegador** (`npm run serve`, `http://localhost:8080/?lang=es&extra1=1`; cal desactivar el bloqueig de finestres emergents per a `localhost` si cal):
  1. Pas 1, i al pas 2 triar «Modelo A» i enviar: s'obre una pestanya amb el PDF que diu «…documento de prueba - Modelo A». A la confirmació, «Abrir el dossier» el torna a obrir (mateix document).
  2. Repetir amb «Modelo C» i amb «No lo sé aún / Busco asesoramiento»: s'obre el PDF general («…documento de prueba»).
  3. Repetir sense triar cap model: el general.
  4. Obrir `?extra1=1&producto=model-b` i enviar sense tocar els xips: s'obre «Modelo B».

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: el dossier que s'obre depèn del model triat (el general com a alternativa) i PDF de prova per model" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

## Decisions i dades pendents

| Tema | Estat | Qui |
|---|---|---|
| PDF real de cada model (o potència) i del general, amb els noms de fitxer | Pendent | Bruno |
| Quins models tenen dossier propi i quins usen el general | Pendent | Bruno |
| Si el titular de la confirmació ha de dir el nom del model | Fora d'abast (canvi de text posterior) | Bruno / Olga |

## Self-review

- **Cobertura de l'especificació:** dossier propi per producte i general com a alternativa, amb els quatre casos (sense model, assessorament, id desconegut, sense dossier propi) (Task 1) · obertura síncrona i botó de reobrir amb el producte del receipt (Task 2) · PDF de prova per model, un model sense dossier propi per provar l'alternativa (Task 2) · literals, esdeveniment i script sense canvis (cap tasca els toca).
- **Placeholders:** cap; els valors pendents són PDF reals de Bruno, llistats a la taula.
- **Coherència de noms:** `dossierFor`, `openDossier`, `openDocument(productId)`, `receipt.product`, `dossierUrl` (general i per producte) coincideixen entre les tasques, els tests i el spec.
- **Risc declarat:** el cablatge d'`app.js` (el botó de reobrir) no té test d'unitat: es verifica a mà al Step 5 i l'elecció del document és a `dossierFor`, que sí que en té.
