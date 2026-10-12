# Pantalla de gràcies amb descàrrega del dossier — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** En enviar el formulari ja no s'obre el PDF automàticament; es mostra la pantalla «Gracias + PDF» del wireframe amb botó de descàrrega, WhatsApp i Correu.

**Architecture:** `handleSubmit` deixa d'obrir res. `dossier.js` manté només helpers purs (`dossierFor`, nou `dossierMeta`). `DoneScreen` rep la URL del dossier i els enllaços ja resolts des d'`app.js` i pinta targeta + botó (`<a download>`) + CTA. Només CSS de composició a `page.css`; el sistema de disseny (`site/ds/`) no es toca.

**Tech Stack:** JS ES modules sense build, React 18 via `h`, `node --test`.

**Workflow (decidit amb Olga):** Task 0 és un `/impeccable shape` que confirma el brief de la pantalla abans de tocar codi; Task 1-2 implementen contra aquest brief; Task 3 és un `/impeccable audit` que tanca el desenvolupament (informe, correcció de P0/P1, un sol re-audit i `/impeccable polish` si hi ha correccions); Task 4 deixa la documentació al dia. `PRODUCT.md` i `DESIGN.md` són la font de veritat visual (mode **Persuade/Operate de fira**: una mà, dret, 360 px, cobertura dolenta).

**Spec:** `docs/superpowers/specs/2026-10-12-gracies-pdf.md`

## Global Constraints
- Cap `window.open` ni `openDocument` a `site/js/` després d'aquest canvi.
- Els literals visibles diuen «dossier», mai «PDF», «ficha» ni «sheet» (test `form-i18n`); el portuguès no usa «correio» ni tractament formal (`você`, `seu`…).
- Tots els literals nous existeixen en `es`, `ca`, `pt`, `en`.
- `site/ds/` no es modifica; colors només amb tokens (`--success`, `--success-bg`).
- Terra tàctil de 44px (el `.tsf-btn` ja ho compleix).
- **El brief confirmat a Task 0 guanya** sobre el marcatge i el CSS d'exemple de Task 2: si hi ha contradicció, es segueix el brief (i no s'inventa res que el brief deixi obert: es pregunta).
- `docs/textos-contacte.md` es regenera amb `npm run texts` (un test comprova que és fresc).

## Review Focus
- Model desconegut / buit / «asesoramiento» → el botó descarrega el dossier general i la targeta diu «Información general» (test a Task 1 i Task 2).
- Cap dossier configurat → no es pinta ni targeta ni botó, i la resta de la pantalla funciona (Task 2).
- El flux d'enviament no ha de dependre de `openDocument` (el harness del test no el proporciona; si es crida, peta) (Task 1).
- Textos llargs (PT/CA) i zoom de text al 200 %: ni desbordament horitzontal ni botons tallats; terra tàctil de 44 px (Task 3: auditoria).
- Canvi d'idioma a la pantalla de gràcies → targeta, botó i CTA es tradueixen (Task 2: tots els literals vénen de `t`).
- `emailDelivery: true` canvia només el subtítol (Task 2).

## File Structure
```
site/js/form/flow.js        handleSubmit sense openDocument
site/js/form/dossier.js     dossierFor + dossierMeta (es retira openDossier)
site/js/ui/done-screen.js   pantalla del wireframe
site/js/app.js              cabla la URL, els enllaços i la classe de pàgina
site/js/i18n-form.js        literals nous i retirats (4 idiomes)
site/css/page.css           composició de la pantalla
tests/form-flow.test.mjs, form-dossier.test.mjs, ui-steps.test.mjs, css.test.mjs
docs/superpowers/specs/2026-10-12-gracies-pdf-brief.md   (nou, Task 0)
docs/superpowers/specs/2026-10-12-gracies-pdf-audit.md   (nou, Task 3)
docs/textos-contacte.md (regenerat), README.md, docs/superpowers/specs/2026-10-09-dossier-per-model.md (nota)
```

---

### Task 0: Brief de disseny amb `/impeccable shape` (sense codi)

**Files:**
- Create: `docs/superpowers/specs/2026-10-12-gracies-pdf-brief.md`

**Interfaces:**
- Produces: un brief confirmat per Olga que Task 2 segueix. No es toca cap fitxer de `site/`.

- [ ] **Step 1: Executar `/impeccable shape`** sobre la pantalla de gràcies (`DoneScreen`, vista `done` d'`app.js`). Alimentar-lo amb els fets ja decidits perquè només calgui **una ronda de confirmació** i no es tornin a preguntar: wireframe «3 · Gracias + PDF» (adjunt de la petició), l'spec `2026-10-12-gracies-pdf.md` i les quatre decisions d'Olga (text «Descargar el dossier»; descàrrega real; «Volver al inicio» discret; targeta amb nom del model + insígnia «PDF»). El visitant és el de `PRODUCT.md`: dret a la fira, una mà, 360 px, cobertura dolenta, o la tauleta de l'estand.
- [ ] **Step 2: Fer-li resoldre els punts que el wireframe deixa oberts** (que el constructor no ha d'inventar): forma i to de la marca d'èxit (cercle sòlid `--success-bg` + traç `--success` en lloc del cercle de punts del wireframe); jerarquia i ritme entre marca, títol, subtítol, targeta i botó; si la targeta és només informativa (proposta: sí, no enllaçada, perquè només hi hagi un gest principal); alineació centrada vs a l'inici; com s'ancora el bloc de CTA al peu en pantalles curtes (mòbil petit amb teclat tancat) i llargues (tauleta, `max-width: 560px`); animació d'entrada (només el `screen-in` existent, amb `prefers-reduced-motion`); estat «sense dossier» i comportament amb text llarg (PT) i zoom de text.
- [ ] **Step 3: Desar el brief** (`3-5` punts per apartat segons `shape.md`: feina i públic, resultat i prova, direcció escollida, abast i límits, estats i rangs, interacció i maquetació, restriccions i decisions obertes) a `docs/superpowers/specs/2026-10-12-gracies-pdf-brief.md`, presentar-lo a Olga i **esperar-ne la confirmació o una ronda de correcció**. Shape no escriu codi.
- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/specs/2026-10-12-gracies-pdf-brief.md
git commit -m "docs: brief de disseny de la pantalla de gràcies (impeccable shape)"
```

---

### Task 1: L'enviament deixa d'obrir el dossier

**Files:**
- Modify: `site/js/form/flow.js:24-36`
- Modify: `site/js/form/dossier.js`
- Modify: `site/js/app.js:87`
- Test: `tests/form-flow.test.mjs`, `tests/form-dossier.test.mjs`

**Interfaces:**
- Produces: `handleSubmit(values, deps)` amb `deps` **sense** `openDocument`; `dossierFor(productId, config) -> string` (ja existent; `openDossier` es manté fins a Task 2 perquè el botó «Abrir» de l'app encara el fa servir); `dossierMeta(productId, config, fallback) -> string` (nom del producte si té `dossierUrl` propi, si no `fallback`).

- [ ] **Step 1: Escriure els tests que fallen**

A `tests/form-flow.test.mjs`: treure `openDocument: rec('openDocument'),` del `harness` (la línia 18; el harness ja no el proporciona, així un `openDocument(...)` residual llança `TypeError`). Substituir el test «enviament final: obre el document PRIMER…» per:

```js
test('enviament final: no obre cap document; emet el lead i neteja per al següent visitant', () => {
  const { calls, deps } = harness({ leadId: 'id-0' });
  assert.equal(handleSubmit(full, deps), true);
  assert.equal(names(calls).includes('openDocument'), false);
  const lead = call(calls, 'emitLead')[1];
  assert.deepEqual([lead.contact.id, lead.profiling.id, lead.contact.profile, lead.profiling.activity, lead.profiling.hasBoat, lead.profiling.intent], ['id-0', 'id-0', 'profesional', 'vela', 'si', 'no']);
  assert.deepEqual(call(calls, 'setReceipt')[1], { product: 'model-a', profile: 'profesional', activity: 'vela', activityOther: '', hasBoat: 'si', hasElectric: 'no', intent: 'no', demo: 'Girona', enthusiasm: ['noise'], enthusiasmOther: '', concerns: ['range'], concernsOther: '', factors: ['price'], factorsOther: '', comments: 'Hola', name: 'Ana' });
  assert.deepEqual(call(calls, 'dispatch')[1], { type: 'reset', initial: { product: 'model-a' } });
  assert.deepEqual(call(calls, 'setLeadId'), ['setLeadId', '']);
  assert.deepEqual(call(calls, 'setErrors'), ['setErrors', {}]);
  assert.deepEqual(call(calls, 'goTo'), ['goTo', 'done']);
});
```
I a «enviament final sense perfil…» canviar l'última assert per `assert.equal(names(calls).includes('emitLead'), false);`.

A `tests/form-dossier.test.mjs`: canviar l'import per `import { dossierFor, dossierMeta, openDossier } from '../site/js/form/dossier.js';` i afegir:

```js
test('dossierMeta: el nom del model si té dossier propi; si no, el text alternatiu', () => {
  const named = { ...config, products: config.products.map((p) => ({ ...p, name: `Model ${p.id}` })) };
  assert.equal(dossierMeta('a', named, 'General'), 'Model a');
  for (const id of ['b', 'c', '', 'asesoramiento', 'desconegut', undefined]) assert.equal(dossierMeta(id, named, 'General'), 'General', String(id));
});
```

- [ ] **Step 2: Executar-los i veure que fallen**

Run: `node --test tests/form-flow.test.mjs tests/form-dossier.test.mjs`
Expected: FAIL (`openDocument is not a function` i `dossierMeta` no exportat).

- [ ] **Step 3: Implementar**

`site/js/form/dossier.js`: afegir al final (sense tocar `dossierFor` ni `openDossier`):

```js
// Segona línia de la targeta: el nom del model si el dossier és el seu; si és el general, el text alternatiu.
export function dossierMeta(productId, config, fallback) {
  const product = config.products?.find((p) => p.id === productId);
  return product?.dossierUrl ? product.name : fallback;
}
```

`site/js/form/flow.js`: treure `openDocument` de la signatura de `handleSubmit`, treure la línia `openDocument(values.product);` i canviar el comentari que la precedeix per:
```js
// Un enviament vàlid deixa el formulari net per al següent visitant de la tauleta; la confirmació conserva
// només el que necessita (receipt): el WhatsApp, el correu i el dossier del model triat.
```
`site/js/app.js`: només treure `openDocument` de la crida de `handleSubmit` (línia 87). La constant `openDocument` i el botó de la pantalla `done` queden fins a Task 2, així l'app funciona entre commits.

- [ ] **Step 4: Passen**

Run: `node --test tests/form-flow.test.mjs tests/form-dossier.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add site/js/form site/js/app.js tests/form-flow.test.mjs tests/form-dossier.test.mjs
git commit -m "feat: l'enviament ja no obre el dossier automàticament"
```

---

### Task 2: Pantalla «Gracias + PDF»

**Files:**
- Modify: `site/js/ui/done-screen.js`, `site/js/form/dossier.js` (retirar `openDossier`), `site/js/app.js:12,39,108-115,118`, `site/js/i18n-form.js` (4 blocs), `site/css/page.css`
- Test: `tests/ui-steps.test.mjs:162-179`, `tests/form-i18n.test.mjs`, `tests/css.test.mjs`, `tests/form-dossier.test.mjs`

**Interfaces:**
- Consumes: el brief de Task 0 (guanya sobre el marcatge/CSS d'exemple); `dossierFor`, `dossierMeta` (Task 1); `T.PdfCard({ title, meta })`; `contactLinks(...) -> { whatsapp, email }`.
- Produces: `DoneScreen({ t, emailDelivery, dossierHref, docMeta, whatsappHref, emailHref, onHome })`. Claus noves de `form`: `doneDownload`, `doneCardTitle`, `doneCardGeneral`. Claus retirades: `doneOpen`, `doneHelp`. `doneText`/`doneTextMail` canvien de text.

- [ ] **Step 1: Escriure els tests que fallen**

A `tests/ui-steps.test.mjs`, substituir els dos tests de confirmació (línies 162-179) per:

```js
const done = (extra = {}) => DoneScreen({
  t: DICT.es, emailDelivery: false, dossierHref: 'dossiers/model-a.pdf', docMeta: 'Modelo A',
  whatsappHref: 'https://wa.me/1', emailHref: 'mailto:x@y.z', onHome: noop, ...extra,
});
const link = (tree, text) => findAll(tree, (n) => n.type === 'a' && textOf(n) === text)[0];

test('confirmació: marca d\'èxit, títol, targeta del dossier i descàrrega real', () => {
  const tree = done();
  assert.equal(byType(tree, 'T.SectionHeading')[0].props.title, f.doneTitle);
  const card = byType(tree, 'T.PdfCard')[0];
  assert.deepEqual([card.props.title, card.props.meta, card.props.href], [f.doneCardTitle, 'Modelo A', undefined]);
  const dl = link(tree, f.doneDownload);
  assert.deepEqual([dl.props.href, dl.props.download], ['dossiers/model-a.pdf', '']);
  assert.match(dl.props.className, /tsf-btn--solid/);
  assert.ok(findAll(tree, (n) => n.type === 'svg' && n.props['aria-hidden'] === 'true').length >= 1, 'marca d\'èxit decorativa');
});
test('confirmació: WhatsApp i correu sota el dossier, i tornada discreta a l\'inici', () => {
  let home = 0;
  const tree = done({ onHome: () => home++ });
  const [wa, mail, back] = buttons(tree);
  assert.deepEqual([textOf(wa), wa.props.variant, wa.props.href], [f.entryWhatsapp, 'outline', 'https://wa.me/1']);
  assert.deepEqual([textOf(mail), mail.props.variant, mail.props.href], [f.entryEmail, 'outline', 'mailto:x@y.z']);
  assert.deepEqual([back.props.variant, textOf(back)], ['link', f.doneHome]);
  back.props.onClick();
  assert.equal(home, 1);
  const order = findAll(tree, (n) => n.type === 'a' || n.type === 'T.Button' || n.type === 'T.PdfCard').map((n) => n.type === 'T.PdfCard' ? 'card' : textOf(n));
  assert.deepEqual(order, ['card', f.doneDownload, f.entryWhatsapp, f.entryEmail, f.doneHome]);
  assert.equal(textOf(tree).includes('PDF'), false, 'cap literal propi diu PDF (la insígnia és del sistema de disseny)');
});
test('confirmació: sense dossier configurat no hi ha targeta ni botó de descàrrega', () => {
  const tree = done({ dossierHref: '' });
  assert.equal(byType(tree, 'T.PdfCard').length, 0);
  assert.equal(link(tree, f.doneDownload), undefined);
  assert.equal(buttons(tree).length, 3);
});
test('confirmació: el subtítol parla del correu només si l\'enviament existeix', () => {
  const sub = (emailDelivery) => byType(done({ emailDelivery }), 'T.SectionHeading')[0].props.subtitle;
  assert.equal(sub(false), f.doneText);
  assert.equal(sub(true), f.doneTextMail);
});
```
(`findAll` ja s'importa a la capçalera del test.)

A `tests/form-i18n.test.mjs` afegir:
```js
test('la pantalla de gràcies té els literals de descàrrega en tots els idiomes i cap resta de l\'obertura automàtica', () => {
  for (const l of CONFIG.languages) {
    for (const k of ['doneDownload', 'doneCardTitle', 'doneCardGeneral']) assert.ok(DICT[l].form[k], `${l}.${k}`);
    for (const k of ['doneOpen', 'doneHelp']) assert.equal(DICT[l].form[k], undefined, `${l}.${k} ja no existeix`);
    assert.doesNotMatch(DICT[l].form.doneText, /abiert|obert|abrimos|opened/i, l);
  }
});
```
A `tests/css.test.mjs`, a prop de la línia 35 afegir:
```js
  assert.match(page, /\.page__done-actions\s*\{[^}]*margin-top:\s*auto/);
  assert.match(page, /\.page__done-mark\s*\{[^}]*var\(--success-bg\)/);
```

- [ ] **Step 2: Veure que fallen**

Run: `node --test tests/ui-steps.test.mjs tests/form-i18n.test.mjs tests/css.test.mjs`
Expected: FAIL.

- [ ] **Step 3: Implementar**

`site/js/ui/done-screen.js`:

```js
export function createDoneScreen({ h, T, icon }) {
  const mark = h('svg', { className: 'page__done-mark', viewBox: '0 0 24 24', 'aria-hidden': 'true', focusable: 'false' },
    h('path', { d: 'M7 12.5l3.2 3.2L17 8.8', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }));
  return function DoneScreen({ t, emailDelivery, dossierHref, docMeta, whatsappHref, emailHref, onHome }) {
    const f = t.form;
    return h('div', { className: 'page__screen page__screen--done' },
      mark,
      h('div', { className: 'page__heading', tabIndex: -1, 'data-step-heading': '' },
        h(T.SectionHeading, {
          layout: 'mobile', level: 1, title: f.doneTitle,
          subtitle: emailDelivery ? f.doneTextMail : f.doneText, className: 'page__title',
        })),
      // Descàrrega real per gest del visitant: el dossier ja no s'obre sol. Button no reenvia `download`, d'aquí l'<a> amb les classes del sistema.
      dossierHref ? h('div', { className: 'page__stack' },
        h(T.PdfCard, { title: f.doneCardTitle, meta: docMeta }),
        h('a', { className: 'tsf-btn button tsf-btn--solid tsf-btn--full', href: dossierHref, download: '' }, f.doneDownload)) : null,
      h('div', { className: 'page__done-actions' },
        h(T.Button, { full: true, variant: 'outline', href: whatsappHref }, icon(h, 'whatsapp'), f.entryWhatsapp),
        h(T.Button, { full: true, variant: 'outline', href: emailHref }, icon(h, 'mail'), f.entryEmail),
        h(T.Button, { variant: 'link', onClick: onHome }, f.doneHome)));
  };
}
```

Retirar `openDossier` de `site/js/form/dossier.js` i, a `tests/form-dossier.test.mjs`, el seu import i els dos tests `openDossier…` (ja no el fa servir ningú).

`site/js/app.js`: canviar l'import a `import { dossierFor, dossierMeta } from './form/dossier.js';` i esborrar `const openDocument = …`; substituir el bloc `done:` per
```js
    done: () => {
      const links = contactLinks(CONFIG, t, receipt ? sessionOf(receipt) : {});
      return h(DoneScreen, {
        t, emailDelivery: CONFIG.emailDelivery, onHome: goHome, whatsappHref: links.whatsapp, emailHref: links.email,
        dossierHref: dossierFor(receipt?.product, CONFIG), docMeta: dossierMeta(receipt?.product, CONFIG, t.form.doneCardGeneral),
      });
    },
```
i la classe de pàgina (la pantalla de gràcies també ocupa l'alçada perquè els CTA quedin al peu):
```js
  const full = isStep || view === 'done';
  return h('div', { className: full ? 'page page--form tsf-compact' : 'page tsf-compact' },
```

`site/js/i18n-form.js` (a cada idioma, dins de `form`): esborrar `doneOpen` i `doneHelp`; substituir `doneText`/`doneTextMail`; afegir les claus noves:
- es: `doneText: 'Descárgalo ahora y consúltalo cuando quieras.'`, `doneTextMail: 'Descárgalo ahora; también te lo hemos enviado por correo para que lo consultes cuando quieras.'`, `doneDownload: 'Descargar el dossier'`, `doneCardTitle: 'Dossier The Silent Fleet'`, `doneCardGeneral: 'Información general'`
- ca: `'Descarrega\'l ara i consulta\'l quan vulguis.'`, `'Descarrega\'l ara; també te l\'hem enviat per correu perquè el consultis quan vulguis.'`, `'Descarregar el dossier'`, `'Dossier The Silent Fleet'`, `'Informació general'`
- pt: `'Descarrega-o agora e consulta-o quando quiseres.'`, `'Descarrega-o agora; também to enviámos por e-mail para o consultares quando quiseres.'`, `'Descarregar o dossier'`, `'Dossier The Silent Fleet'`, `'Informação geral'`
- en: `'Download it now and read it whenever you like.'`, `'Download it now; we have also emailed it to you to read whenever you like.'`, `'Download the dossier'`, `'Dossier The Silent Fleet'`, `'General information'`

`site/css/page.css` (afegir abans del bloc `@keyframes`):
```css
/* Pantalla de gràcies: marca d'èxit centrada i CTA al peu (com el wireframe «Gracias + PDF»). */
.page__screen--done { flex: 1; align-items: stretch; }
.page__done-mark { align-self: center; box-sizing: border-box; width: 56px; height: 56px; padding: var(--space-3); border-radius: 50%; background: var(--success-bg); color: var(--success); }
.page__done-actions { display: flex; flex-direction: column; gap: var(--space-2); margin-top: auto; padding-top: var(--space-4); }
```

- [ ] **Step 4: Passen**

Run: `npm test`
Expected: PASS excepte `texts-doc` (es regenera a Task 3).

- [ ] **Step 5: Comprovació ràpida al navegador** (la revisió a fons és Task 3)

Arrencar `npm run serve` (o el `preview_start` de `.claude/launch.json`), obrir `/?o=tauleta&producto=model-a`, completar els dos passos amb dades inventades i comprovar: no s'obre cap pestanya; es veu la marca, el títol, la targeta («Modelo A»), el botó (baixa `model-a.pdf`), WhatsApp i Correu al peu i «Volver al inicio»; repetir amb el Modelo C (targeta «Información general», baixa el general).

- [ ] **Step 6: Commit**

```bash
git add site tests
git commit -m "feat: pantalla de gràcies amb descàrrega del dossier, WhatsApp i correu (wireframe 3)"
```

---

### Task 3: Auditoria final amb `/impeccable audit`

**Files:**
- Create: `docs/superpowers/specs/2026-10-12-gracies-pdf-audit.md`
- Modify: només el que l'auditoria assenyali (`site/js/ui/done-screen.js`, `site/css/page.css`, `site/js/i18n-form.js` i els seus tests)

**Interfaces:**
- Consumes: la pantalla acabada de Task 2. Produeix un informe amb puntuació 0-4 per dimensió i incidències P0-P3.

Passades **acotades** (no un bucle de polit): una ronda de comprovació en lot, una correcció en lot, com a molt una re-ronda.

- [ ] **Step 1: Detector i tests.** Run: `/Users/olgagarcia/.claude/skills/impeccable/scripts/impeccable detect site/js/ui/done-screen.js site/css/page.css site/js/app.js` i `npm test`. Verificar cada troballa al seu context (separar els falsos positius).
- [ ] **Step 2: Captures en lot** amb el navegador integrat (`npm run serve`, `/?o=tauleta&producto=model-a`, dades inventades): 360 px i 768 px, clar i fosc, en ES i PT (text més llarg), Modelo A i Modelo C; més un zoom de text del 200 % a 360 px. Comprovar: cap desbordament horitzontal, CTA al peu sense tallar-se, terra tàctil ≥ 44 px, focus visible i ordre de tab (títol → descàrrega → WhatsApp → correu → inici), contrast ≥ 4,5:1 (marca d'èxit i meta de la targeta en fosc), que el focus vagi al títol en entrar a la pantalla i el comportament amb `prefers-reduced-motion`.
- [ ] **Step 3: Executar `/impeccable audit`** sobre la pantalla (cinc dimensions: accessibilitat, rendiment, tematització, responsiu, integritat d'implementació) i desar l'informe a `docs/superpowers/specs/2026-10-12-gracies-pdf-audit.md` amb la puntuació, les incidències per severitat i els positius.
- [ ] **Step 4: Corregir P0 i P1** (cada correcció amb el seu test abans, com a Task 2); les P2/P3 es deixen anotades a l'informe per a Olga. Si hi ha hagut correccions: una sola re-ronda de comprovació i `/impeccable polish` com a últim pas. `npm test` ha de quedar en verd (excepte `texts-doc` fins a Task 4).
- [ ] **Step 5: Commit**

```bash
git add docs/superpowers/specs/2026-10-12-gracies-pdf-audit.md site tests
git commit -m "fix: correccions de l'auditoria de la pantalla de gràcies"
```

---

### Task 4: Documentació al dia

**Files:**
- Modify: `README.md:54`, `docs/superpowers/specs/2026-10-09-dossier-per-model.md`
- Regenerate: `docs/textos-contacte.md`
- Test: `tests/texts-doc.test.mjs`

- [ ] **Step 1:** Regenerar els textos: `npm run texts`. Run: `node --test tests/texts-doc.test.mjs` → PASS.
- [ ] **Step 2:** A `README.md` punt 4 («Confirmació»), reescriure: «**Confirmació:** pantalla de gràcies amb la targeta del dossier del model triat (o el general), botó de descàrrega, WhatsApp i correu, i un enllaç per tornar a l'inici. El dossier ja no s'obre automàticament.»
- [ ] **Step 3:** Al començament de `docs/superpowers/specs/2026-10-09-dossier-per-model.md`, sota el títol, afegir: «> **Actualitzat:** l'obertura automàtica s'ha substituït per una pantalla de descàrrega; vegeu `2026-10-12-gracies-pdf.md`. La tria del dossier (model → general) no canvia.» I a la línia «El botó «Abrir el dossier»…» de «Comportament», prefixar «(Substituït)».
- [ ] **Step 4:** Run: `npm test` → tot PASS; `grep -rn "window.open\|openDocument\|openDossier" site/js` → cap resultat.
- [ ] **Step 5: Commit**

```bash
git add README.md docs
git commit -m "docs: confirmació amb descàrrega (README, textos i spec del dossier per model)"
```

---

## Self-Review
- **Cobertura del flux acordat:** shape abans del codi (Task 0), audit per acabar (Task 3), sense `window.open` ni `openDocument` al final (Task 4 grep).
- **Cobertura de l'spec:** no s'obre cap pestanya (T1); mateix criteri de dossier (`dossierFor`, T1/T2); `<a download>` (T2); targeta amb meta model/general (T1 `dossierMeta` + T2); CTA WhatsApp/Correu + enllaç inici (T2); `doneHelp` retirat (T2 i18n); literals sense «PDF» (T2 test); sense dossier → amagat (T2 test); docs (T3).
- **Placeholders:** cap.
- **Consistència de noms:** `dossierFor`, `dossierMeta`, `dossierHref`, `docMeta`, `emailHref`, `doneDownload`, `doneCardTitle`, `doneCardGeneral` coincideixen entre tasques.
