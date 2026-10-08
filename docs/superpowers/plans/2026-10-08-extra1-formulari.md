# Extra 1 · Pantalla del formulari — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Cada tasca segueix `superpowers:test-driven-development` (test que falla → implementació mínima → test verd) i acaba amb `superpowers:verification-before-completion`.

**Goal:** Una pantalla única de formulari («Recibe la ficha del producto») que recull el contacte i la perfilació del lead en 4 idiomes, amb validació, dependències entre camps i un resultat net (`lead`), darrere d'un interruptor que deixa l'MVP intacte per als visitants.

**Architecture:** Lògica pura i testejada en mòduls ES petits (`form/context`, `form/model`, `form/validate`, `form/lead`, `form/focus`, `chips`); UI com a components presentacionals de `window.TSF` que reben `h` i `T` per injecció, perquè es puguin provar a Node amb un renderitzador fals; `app.js` només orquestra l'estat (idioma, vista, formulari). Els literals viuen en un mòdul propi (`i18n-form.js`). El formulari acaba en un esdeveniment `tsf:lead`: l'enviament al Google Form, el PDF i la pantalla de gràcies són un pla a part.

**Tech Stack:** HTML/CSS/JS pla amb mòduls ES, React 18.3 UMD local, components `window.TSF` del sistema de disseny, `node:test` (Node ≥ 22). Cap dependència nova.

**Spec:** brief «Pantalla única de l'Extra 1» (conversa del 08/10/2026), `docs-privats/spec-extra1-formulari-pdf.md` (R1, R2, R5) i `docs-privats/spec-extra1-visuals.html` (pantalles 1 i 2). Les dues rutes `docs-privats/` són locals i no són al repo. Decisions de disseny a `DESIGN.md` i `PRODUCT.md`.

## Abast

**Dins:** pantalla d'entrada amb el botó nou, pantalla del formulari (contacte + perfilació opcional), validació, camps condicionals, literals en 4 idiomes (amb el tracte proper unificat també al portuguès), esborrany de privacitat per a l'Extra 1, interruptor `extra1`, document de textos per validar.

**Fora (pla següent):** enviament al Google Form (`fetch`, reintent, identificadors `entry.*`), pantalla de gràcies i PDF, camí d'error de xarxa, «Nueva solicitud», dos passos, correu de seguiment.

## Global Constraints

- Node ≥ 22; cap dependència nova; cap petició externa; cap `localStorage`, cookies ni anàlisi.
- Mobile first, base 360px, una columna, `tsf-compact`; WCAG AA; zones tàctils ≥ 44px; només components del sistema de disseny.
- **Els missatges de correu i WhatsApp no es toquen** (`messages.*.subject/text`, `greeting`, `closing`).
- Tracte **proper** (tu) a tots els literals visibles: castellà, català, portuguès (`tu`) i anglès neutre. Sense signes d'exclamació ni emojis.
- **«Ski / Wake» no es tradueix a cap idioma.**
- La casella de privacitat és obligatòria i **sense marcar** per defecte; la de novetats és opcional.
- L'Extra 1 és **apagat per defecte** (`CONFIG.extra1 === false`); es veu amb `?extra1=1` o posant `extra1: true`.
- Cap `git push` ni canvi de compte sense permís explícit de l'Olga. Els commits acaben amb `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.
- Les dades que encara no tenim (productes, nom legal, identificadors) són de prova i estan marcades com a tals.

## Decisions obertes i supòsits

1. **Noms del perfil.** El formulari usa «Particular / Profesional». L'entrada de l'MVP encara diu «Distribuidor o profesional» i els missatges parlen de «distribuidor». Aquest pla **no els toca**: converteix el perfil de l'entrada al del formulari amb `profileFromEntry`. Canviar el xip és una línia a `i18n.js` quan l'Olga ho decideixi.
2. **Botó d'entrada:** «Pedir información de un producto» (wireframe). Alinear-lo amb el títol («Recibir la ficha de un producto») és opcional.
3. **Productes de prova:** «Modelo A/B/C» a `config.js`. Els reals els dona Bruno.
4. **Nom legal:** `legalName` és de prova fins que Bruno el doni; el text de privacitat és un esborrany sense validar (no és assessorament legal).
5. **Preu i hores:** fora d'aquest pla.

## Review Focus

Entrades que el brief implica però cap tasca prova per si sola, per ordre de probabilitat:

1. **Canviar d'idioma amb el formulari a mitges:** els valors i els errors no es perden, i els errors es reescriuen a l'idioma nou (els errors es desen com a codis, mai com a text). → Task 2 (el reductor no té idioma) i Task 7 (la pantalla tradueix els codis).
2. **Canviar de Profesional a Particular després de triar activitat:** l'activitat i l'«Otra» no han de quedar al lead. → Task 2 i Task 4.
3. **Telèfons reals:** `+34 600 00 00 00`, `600-000-000`, `(+351) 934 065 356` valen; `abc`, `12345`, 16 dígits i `600 ext 5` no. → Task 3.
4. **Paràmetres de la URL maliciosos o buits** (`?producto=__proto__`, `?o=xx`): cauen al valor per defecte. → Task 1.
5. **El text de privacitat no pot dir «no guardem dades»** quan l'Extra 1 és actiu. → Task 8.

---

## File Structure

```
site/js/
  config.js                 (modifica) extra1, products, legalName
  messages.js               (modifica) treu toggleProfile
  i18n.js                   (modifica) DICT = PAGE + form; tractament proper al PT
  i18n-form.js              (nou) literals del formulari en 4 idiomes
  chips.js                  (nou) deselectProps: xips opcionals desmarcables
  privacy-text.js           (nou) text de privacitat segons l'interruptor
  privacy.js                (modifica) usa privacy-text.js
  app.js                    (reescriu) només estat i orquestració
  form/context.js           (nou) interruptor, origen, producte preseleccionat, perfil, query legal
  form/model.js             (nou) constants, estat buit, reductor, camps visibles
  form/validate.js          (nou) validateContact, firstErrorField, clearError
  form/lead.js              (nou) buildLead, submitForm, newLeadId
  form/focus.js             (nou) focusFirstError
  ui/chrome.js              (nou) capçalera: marca + idioma
  ui/entry-screen.js        (nou) pantalla d'entrada (extreta d'app.js)
  ui/form-screen.js         (nou) pantalla del formulari
site/css/page.css           (modifica) .page__screen, .page--form, .form*
site/index.html             (modifica) modulepreload de tots els mòduls
scripts/export-texts.mjs    (modifica) taula del formulari
tests/helpers/fake-react.mjs  (nou) h, T i cercadors per provar components sense DOM
tests/form-context|model|validate|lead|i18n, chips, ui, privacy-text .test.mjs (nous)
tests/html|css|i18n|messages|config.test.mjs (es modifiquen)
```

---

### Task 1: Configuració, interruptor i helpers de context

**Files:**
- Modify: `site/js/config.js`
- Create: `site/js/form/context.js`
- Test: `tests/form-context.test.mjs`, `tests/config.test.mjs` (afegir)

**Interfaces:**
- Produces: `CONFIG.extra1: boolean`, `CONFIG.products: {id: string, name: string}[]`, `CONFIG.legalName: string`; `isExtra1Enabled(config, search) -> boolean`; `resolveOrigin(search) -> 'mobil'|'tauleta'`; `resolveProduct(search, products) -> string` (id o `''`); `profileFromEntry(entryProfile) -> 'particular'|'profesional'|''`; `legalQuery(lang, extra1) -> string` (`'?lang=es'` o `'?lang=es&extra1=1'`).

- [ ] **Step 1: Escriure els tests que fallen**

```js
// tests/form-context.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../site/js/config.js';
import { isExtra1Enabled, resolveOrigin, resolveProduct, profileFromEntry, legalQuery } from '../site/js/form/context.js';

test('Extra 1: apagat per defecte; es veu amb ?extra1=1 o amb la configuració', () => {
  assert.equal(CONFIG.extra1, false);
  assert.equal(isExtra1Enabled(CONFIG, ''), false);
  assert.equal(isExtra1Enabled(CONFIG, '?extra1=0'), false);
  assert.equal(isExtra1Enabled(CONFIG, '?extra1=1'), true);
  assert.equal(isExtra1Enabled({ ...CONFIG, extra1: true }, ''), true);
});
test('origen: només «tauleta» exacte canvia el valor per defecte', () => {
  assert.equal(resolveOrigin('?o=tauleta'), 'tauleta');
  for (const s of ['', '?o=', '?o=xx', '?o=TAULETA', '?o=__proto__']) assert.equal(resolveOrigin(s), 'mobil', s);
});
test('producte preseleccionat: només ids de la llista', () => {
  assert.equal(resolveProduct('?producto=model-b', CONFIG.products), 'model-b');
  for (const s of ['', '?producto=', '?producto=nope', '?producto=__proto__']) assert.equal(resolveProduct(s, CONFIG.products), '', s);
});
test('perfil de l\'entrada → perfil del formulari', () => {
  assert.equal(profileFromEntry('particular'), 'particular');
  assert.equal(profileFromEntry('distribuidor'), 'profesional');
  for (const v of ['', undefined, null, 'xx', '__proto__']) assert.equal(profileFromEntry(v), '', String(v));
});
test('legalQuery conserva l\'idioma i l\'interruptor', () => {
  assert.equal(legalQuery('ca', false), '?lang=ca');
  assert.equal(legalQuery('ca', true), '?lang=ca&extra1=1');
});
```

```js
// tests/config.test.mjs  (afegir al final)
test('productes de config: ids únics i amb nom', () => {
  const ids = CONFIG.products.map((p) => p.id);
  assert.ok(CONFIG.products.length >= 2);
  assert.equal(new Set(ids).size, ids.length);
  for (const p of CONFIG.products) assert.ok(p.id.trim() && p.name.trim(), JSON.stringify(p));
});
test('legalName és present (de prova fins que Bruno el doni)', () => {
  assert.ok(CONFIG.legalName.trim().length > 0);
});
```

- [ ] **Step 2:** `npm test` → FAIL (`form/context.js` no existeix; `CONFIG.products` és `undefined`).

- [ ] **Step 3: Implementació**

```js
// site/js/config.js  (afegir dins de CONFIG, abans de defaultLang)
  extra1: false, // L'Extra 1 és ocult als visitants fins que s'activi; es previsualitza amb ?extra1=1
  products: [ // PROVA: substituir per la llista real de Bruno
    { id: 'model-a', name: 'Modelo A' },
    { id: 'model-b', name: 'Modelo B' },
    { id: 'model-c', name: 'Modelo C' },
  ],
  legalName: 'PENDIENTE: nombre legal de The Silent Fleet', // PROVA: el dona Bruno
```

```js
// site/js/form/context.js
const MOBILE = 'mobil';
const TABLET = 'tauleta';
const PROFILE_FROM_ENTRY = { particular: 'particular', distribuidor: 'profesional' };

const param = (search, name) => new URLSearchParams(search).get(name);

export const isExtra1Enabled = (config, search) => config.extra1 === true || param(search, 'extra1') === '1';

export const resolveOrigin = (search) => (param(search, 'o') === TABLET ? TABLET : MOBILE);

export function resolveProduct(search, products) {
  const wanted = param(search, 'producto');
  return products.some((p) => p.id === wanted) ? wanted : '';
}

export const profileFromEntry = (entryProfile) =>
  (Object.hasOwn(PROFILE_FROM_ENTRY, entryProfile) ? PROFILE_FROM_ENTRY[entryProfile] : '');

export const legalQuery = (lang, extra1) => `?lang=${lang}${extra1 ? '&extra1=1' : ''}`;
```

- [ ] **Step 4:** `npm test` → PASS.
- [ ] **Step 5: Commit**

```bash
git add site/js/config.js site/js/form/context.js tests/form-context.test.mjs tests/config.test.mjs
git commit -m "feat: interruptor de l'Extra 1 i helpers de context" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 2: Model del formulari i reductor

**Files:**
- Create: `site/js/form/model.js`
- Test: `tests/form-model.test.mjs`

**Interfaces:**
- Produces: `PROFILES = ['particular','profesional']`; `ACTIVITIES = ['ocio','charter','vela','buceo','skiwake','seguridad','pasajeros','pesca','marina','otra']`; `MAX = {name:100,email:254,phone:30,activityOther:120,demo:80}`; `emptyForm({product?, profile?}) -> FormValues`; `formReducer(state, action)` amb accions `{type:'set', field, value}`, `{type:'prefill', field, value}` (només si el camp és buit) i `{type:'reset', initial?}`; `showsActivity(values) -> boolean`; `showsActivityOther(values) -> boolean`.
- `FormValues = { product, name, email, phone, profile, activity, activityOther, hasElectric, investing, demo: string; privacy, newsletter: boolean }`.

- [ ] **Step 1: Test que falla**

```js
// tests/form-model.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyForm, formReducer, showsActivity, showsActivityOther, PROFILES, ACTIVITIES } from '../site/js/form/model.js';

const set = (state, field, value) => formReducer(state, { type: 'set', field, value });

test('estat inicial: res marcat, privacitat sense marcar', () => {
  const s = emptyForm();
  assert.equal(s.privacy, false);
  assert.equal(s.newsletter, false);
  assert.equal(s.profile, '');
  assert.deepEqual([s.name, s.email, s.phone, s.activity, s.demo], ['', '', '', '', '']);
});
test('estat inicial amb producte i perfil', () => {
  const s = emptyForm({ product: 'model-a', profile: 'particular' });
  assert.deepEqual([s.product, s.profile], ['model-a', 'particular']);
});
test('set canvia un camp i ignora els camps desconeguts', () => {
  assert.equal(set(emptyForm(), 'name', 'Ana').name, 'Ana');
  const s = emptyForm();
  assert.equal(set(s, 'isAdmin', true), s);
  assert.equal(set(s, '__proto__', {}), s);
});
test('l\'activitat només existeix per a Profesional', () => {
  let s = set(emptyForm(), 'profile', 'profesional');
  assert.equal(showsActivity(s), true);
  s = set(s, 'activity', 'pesca');
  s = set(s, 'profile', 'particular');
  assert.equal(showsActivity(s), false);
  assert.equal(s.activity, '', 'canviar a Particular esborra l\'activitat');
});
test('«Otra» mostra el camp d\'especificar, i triar una altra activitat l\'esborra', () => {
  let s = set(set(emptyForm(), 'profile', 'profesional'), 'activity', 'otra');
  assert.equal(showsActivityOther(s), true);
  s = set(s, 'activityOther', 'Rescat de fauna');
  s = set(s, 'activity', 'pesca');
  assert.equal(showsActivityOther(s), false);
  assert.equal(s.activityOther, '');
});
test('prefill només omple camps buits (el perfil de l\'entrada no trepitja el triat)', () => {
  const empty = formReducer(emptyForm(), { type: 'prefill', field: 'profile', value: 'profesional' });
  assert.equal(empty.profile, 'profesional');
  const chosen = formReducer(emptyForm({ profile: 'particular' }), { type: 'prefill', field: 'profile', value: 'profesional' });
  assert.equal(chosen.profile, 'particular');
});
test('reset torna a l\'estat inicial', () => {
  const dirty = set(set(emptyForm(), 'name', 'Ana'), 'privacy', true);
  assert.deepEqual(formReducer(dirty, { type: 'reset', initial: { product: 'model-b' } }), emptyForm({ product: 'model-b' }));
});
test('constants: perfils i activitats', () => {
  assert.deepEqual(PROFILES, ['particular', 'profesional']);
  assert.equal(ACTIVITIES.at(-1), 'otra');
  assert.ok(ACTIVITIES.includes('skiwake'));
});
test('accions desconegudes no canvien l\'estat', () => {
  const s = emptyForm();
  assert.equal(formReducer(s, { type: 'nope' }), s);
});
```

- [ ] **Step 2:** `npm test` → FAIL (mòdul inexistent).
- [ ] **Step 3: Implementació**

```js
// site/js/form/model.js
export const PROFILES = ['particular', 'profesional'];
export const ACTIVITIES = ['ocio', 'charter', 'vela', 'buceo', 'skiwake', 'seguridad', 'pasajeros', 'pesca', 'marina', 'otra'];
export const MAX = { name: 100, email: 254, phone: 30, activityOther: 120, demo: 80 };

export const emptyForm = ({ product = '', profile = '' } = {}) => ({
  product, name: '', email: '', phone: '', profile,
  activity: '', activityOther: '', hasElectric: '', investing: '', demo: '',
  privacy: false, newsletter: false,
});

export const showsActivity = (values) => values.profile === 'profesional';
export const showsActivityOther = (values) => showsActivity(values) && values.activity === 'otra';

// Camps que depenen d'altres: s'esborren quan deixen d'aplicar, perquè no arribin al lead.
function withDependencies(values) {
  const next = { ...values };
  if (!showsActivity(next)) next.activity = '';
  if (next.activity !== 'otra') next.activityOther = '';
  return next;
}

export function formReducer(state, action) {
  switch (action.type) {
    case 'set':
      return Object.hasOwn(state, action.field) ? withDependencies({ ...state, [action.field]: action.value }) : state;
    case 'prefill':
      return Object.hasOwn(state, action.field) && !state[action.field]
        ? withDependencies({ ...state, [action.field]: action.value })
        : state;
    case 'reset':
      return emptyForm(action.initial);
    default:
      return state;
  }
}
```

- [ ] **Step 4:** `npm test` → PASS.
- [ ] **Step 5: Commit**

```bash
git add site/js/form/model.js tests/form-model.test.mjs
git commit -m "feat: model i reductor del formulari" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 3: Validació

**Files:**
- Create: `site/js/form/validate.js`
- Test: `tests/form-validate.test.mjs`

**Interfaces:**
- Consumes: `PROFILES` (Task 2).
- Produces: `validateContact(values, products) -> Record<field, errorCode>` amb camps `product|name|email|phone|profile|privacy` i codis `'required'|'productRequired'|'profileRequired'|'email'|'phone'|'privacy'`; `FIELD_ORDER`; `firstErrorField(errors) -> string|undefined`; `clearError(errors, field) -> errors` (còpia sense `field`).

- [ ] **Step 1: Test que falla**

```js
// tests/form-validate.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { validateContact, firstErrorField, clearError, FIELD_ORDER } from '../site/js/form/validate.js';

const PRODUCTS = [{ id: 'model-a', name: 'Modelo A' }];
const valid = { product: 'model-a', name: 'Ana', email: 'ana@example.com', phone: '+34 600 00 00 00', profile: 'particular', privacy: true };
const errorsFor = (patch) => validateContact({ ...valid, ...patch }, PRODUCTS);

test('un formulari complet no té errors', () => {
  assert.deepEqual(errorsFor({}), {});
});
test('buit: cada camp obligatori dona el seu codi', () => {
  const errors = validateContact({ product: '', name: '', email: '', phone: '', profile: '', privacy: false }, PRODUCTS);
  assert.deepEqual(errors, { product: 'productRequired', name: 'required', email: 'required', phone: 'required', profile: 'profileRequired', privacy: 'privacy' });
});
test('espais sols compten com a buit', () => {
  assert.equal(errorsFor({ name: '   ' }).name, 'required');
});
test('correu: formes vàlides i invàlides', () => {
  for (const ok of ['ana@example.com', 'a.b+c@sub.example.org']) assert.equal(errorsFor({ email: ok }).email, undefined, ok);
  for (const bad of ['ana@', 'ana@x', 'a b@c.com', 'ana.example.com', '@example.com']) assert.equal(errorsFor({ email: bad }).email, 'email', bad);
});
test('telèfon: formats reals valen; lletres, massa curt o massa llarg no', () => {
  for (const ok of ['+34 600 00 00 00', '600-000-000', '(+351) 934 065 356', '0034 600000000']) assert.equal(errorsFor({ phone: ok }).phone, undefined, ok);
  for (const bad of ['abc', '12345', '1234567890123456', '+34 600 00 00 00 ext 5']) assert.equal(errorsFor({ phone: bad }).phone, 'phone', bad);
});
test('producte: ha de ser de la llista', () => {
  assert.equal(errorsFor({ product: 'altre' }).product, 'productRequired');
  assert.equal(errorsFor({ product: '__proto__' }).product, 'productRequired');
});
test('perfil: només Particular o Profesional', () => {
  assert.equal(errorsFor({ profile: 'distribuidor' }).profile, 'profileRequired');
  assert.equal(errorsFor({ profile: 'profesional' }).profile, undefined);
});
test('privacitat: només el booleà true compta', () => {
  for (const bad of [false, 'true', 1, undefined]) assert.equal(errorsFor({ privacy: bad }).privacy, 'privacy', String(bad));
});
test('el primer error segueix l\'ordre visual de la pantalla', () => {
  assert.deepEqual(FIELD_ORDER, ['product', 'name', 'email', 'phone', 'profile', 'privacy']);
  assert.equal(firstErrorField({ phone: 'required', email: 'email' }), 'email');
  assert.equal(firstErrorField({}), undefined);
});
test('clearError treu només aquell camp i no muta l\'original', () => {
  const errors = { name: 'required', email: 'email' };
  assert.deepEqual(clearError(errors, 'name'), { email: 'email' });
  assert.deepEqual(errors, { name: 'required', email: 'email' });
});
```

- [ ] **Step 2:** `npm test` → FAIL.
- [ ] **Step 3: Implementació**

```js
// site/js/form/validate.js
import { PROFILES } from './model.js';

export const FIELD_ORDER = ['product', 'name', 'email', 'phone', 'profile', 'privacy'];

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_CHARS = /^[+\d\s().-]+$/;
const PHONE_DIGITS = { min: 7, max: 15 };

const text = (values, field) => String(values[field] ?? '').trim();
const digitCount = (s) => s.replace(/\D/g, '').length;

function phoneError(phone) {
  if (!phone) return 'required';
  const n = digitCount(phone);
  return PHONE_CHARS.test(phone) && n >= PHONE_DIGITS.min && n <= PHONE_DIGITS.max ? undefined : 'phone';
}

export function validateContact(values, products) {
  const errors = {};
  if (!products.some((p) => p.id === values.product)) errors.product = 'productRequired';
  if (!text(values, 'name')) errors.name = 'required';
  const email = text(values, 'email');
  if (!email) errors.email = 'required';
  else if (!EMAIL.test(email)) errors.email = 'email';
  const phone = phoneError(text(values, 'phone'));
  if (phone) errors.phone = phone;
  if (!PROFILES.includes(values.profile)) errors.profile = 'profileRequired';
  if (values.privacy !== true) errors.privacy = 'privacy';
  return errors;
}

export const firstErrorField = (errors) => FIELD_ORDER.find((field) => errors[field]);

export function clearError(errors, field) {
  const { [field]: _removed, ...rest } = errors;
  return rest;
}
```

- [ ] **Step 4:** `npm test` → PASS. (`'0034 600000000'` té 13 dígits i només caràcters permesos.)
- [ ] **Step 5: Commit**

```bash
git add site/js/form/validate.js tests/form-validate.test.mjs
git commit -m "feat: validació del formulari" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 4: El lead (payload) i l'enviament pur

**Files:**
- Create: `site/js/form/lead.js`
- Test: `tests/form-lead.test.mjs`

**Interfaces:**
- Consumes: `MAX` (Task 2), `validateContact` (Task 3).
- Produces: `buildLead(values, {lang, origin, newId}) -> {contact, profiling, hasProfiling}` amb `contact = {id, product, name, email, phone, privacy:true, newsletter, lang, profile, origin}` i `profiling = {id, activity?, activityOther?, hasElectric?, investing?, demo?}`; `submitForm(values, {products, lang, origin, newId}) -> {errors} | {lead}`; `newLeadId() -> string`.

- [ ] **Step 1: Test que falla**

```js
// tests/form-lead.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildLead, submitForm, newLeadId } from '../site/js/form/lead.js';
import { emptyForm } from '../site/js/form/model.js';

const PRODUCTS = [{ id: 'model-a', name: 'Modelo A' }];
const base = { ...emptyForm({ product: 'model-a', profile: 'particular' }), name: ' Ana ', email: ' ANA@Example.com ', phone: ' +34 600 00 00 00 ', privacy: true };
const ctx = { lang: 'ca', origin: 'tauleta', newId: () => 'id-1' };

test('el contacte surt normalitzat i amb idioma, perfil i origen', () => {
  assert.deepEqual(buildLead(base, ctx).contact, {
    id: 'id-1', product: 'model-a', name: 'Ana', email: 'ana@example.com', phone: '+34 600 00 00 00',
    privacy: true, newsletter: false, lang: 'ca', profile: 'particular', origin: 'tauleta',
  });
});
test('novetats és un booleà estricte', () => {
  assert.equal(buildLead({ ...base, newsletter: true }, ctx).contact.newsletter, true);
  assert.equal(buildLead({ ...base, newsletter: 'yes' }, ctx).contact.newsletter, false);
});
test('un Particular no porta activitat encara que n\'hi hagi a l\'estat', () => {
  const lead = buildLead({ ...base, activity: 'pesca', activityOther: 'x' }, ctx);
  assert.equal(lead.profiling.activity, undefined);
  assert.equal(lead.hasProfiling, false);
});
test('un Profesional porta l\'activitat; «Otra» només amb text', () => {
  const pro = { ...base, profile: 'profesional' };
  assert.equal(buildLead({ ...pro, activity: 'pesca' }, ctx).profiling.activity, 'pesca');
  assert.equal(buildLead({ ...pro, activity: 'pesca', activityOther: 'ignorat' }, ctx).profiling.activityOther, undefined);
  assert.equal(buildLead({ ...pro, activity: 'otra', activityOther: '  Rescat  ' }, ctx).profiling.activityOther, 'Rescat');
  assert.equal(buildLead({ ...pro, activity: 'otra', activityOther: '   ' }, ctx).profiling.activityOther, undefined);
});
test('la perfilació només inclou el que s\'ha contestat', () => {
  const lead = buildLead({ ...base, hasElectric: 'si', investing: '', demo: ' Girona ' }, ctx);
  assert.deepEqual(lead.profiling, { id: 'id-1', hasElectric: 'si', demo: 'Girona' });
  assert.equal(lead.hasProfiling, true);
});
test('el contacte i la perfilació comparteixen l\'identificador (un sol newId per lead)', () => {
  let calls = 0;
  const lead = buildLead(base, { ...ctx, newId: () => `id-${++calls}` });
  assert.equal(calls, 1);
  assert.equal(lead.contact.id, lead.profiling.id);
});
test('els textos massa llargs es retallen sense trencar emojis', () => {
  const lead = buildLead({ ...base, name: 'a'.repeat(300), demo: '🌊'.repeat(200) }, ctx);
  assert.equal(lead.contact.name.length, 100);
  assert.equal(Array.from(lead.profiling.demo).length, 80);
  assert.doesNotMatch(lead.profiling.demo, /�/);
});
test('newLeadId dona identificadors no buits i diferents', () => {
  const ids = new Set(Array.from({ length: 50 }, newLeadId));
  assert.equal(ids.size, 50);
  for (const id of ids) assert.ok(typeof id === 'string' && id.length >= 8);
});
test('submitForm: amb errors no genera lead ni consumeix identificador', () => {
  let calls = 0;
  const result = submitForm(emptyForm(), { products: PRODUCTS, lang: 'es', origin: 'mobil', newId: () => { calls++; return 'x'; } });
  assert.ok(result.errors.name);
  assert.equal(result.lead, undefined);
  assert.equal(calls, 0);
});
test('submitForm: amb dades vàlides dona el lead', () => {
  const result = submitForm(base, { products: PRODUCTS, ...ctx });
  assert.equal(result.errors, undefined);
  assert.equal(result.lead.contact.id, 'id-1');
});
```

- [ ] **Step 2:** `npm test` → FAIL.
- [ ] **Step 3: Implementació**

```js
// site/js/form/lead.js
import { MAX } from './model.js';
import { validateContact } from './validate.js';

// Array.from evita partir un emoji (parell subrogat) pel mig.
const clip = (value, max) => Array.from(String(value ?? '').trim()).slice(0, max).join('');
const answered = (value) => clip(value, 1) !== '';

export const newLeadId = () =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

function buildContact(values, id, { lang, origin }) {
  return {
    id, product: values.product,
    name: clip(values.name, MAX.name),
    email: clip(values.email, MAX.email).toLowerCase(),
    phone: clip(values.phone, MAX.phone),
    privacy: true,
    newsletter: values.newsletter === true,
    lang, profile: values.profile, origin,
  };
}

function buildProfiling(values, id) {
  const profiling = { id };
  if (values.profile === 'profesional' && values.activity) {
    profiling.activity = values.activity;
    if (values.activity === 'otra' && answered(values.activityOther)) profiling.activityOther = clip(values.activityOther, MAX.activityOther);
  }
  if (values.hasElectric) profiling.hasElectric = values.hasElectric;
  if (values.investing) profiling.investing = values.investing;
  if (answered(values.demo)) profiling.demo = clip(values.demo, MAX.demo);
  return profiling;
}

export function buildLead(values, { lang, origin, newId }) {
  const id = newId();
  const profiling = buildProfiling(values, id);
  return { contact: buildContact(values, id, { lang, origin }), profiling, hasProfiling: Object.keys(profiling).length > 1 };
}

export function submitForm(values, { products, lang, origin, newId }) {
  const errors = validateContact(values, products);
  return Object.keys(errors).length ? { errors } : { lead: buildLead(values, { lang, origin, newId }) };
}
```

- [ ] **Step 4:** `npm test` → PASS.
- [ ] **Step 5: Commit**

```bash
git add site/js/form/lead.js tests/form-lead.test.mjs
git commit -m "feat: lead i enviament pur del formulari" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 5: Xips desmarcables (refactor de l'MVP)

**Files:**
- Create: `site/js/chips.js`
- Modify: `site/js/app.js` (usa `deselectProps`), `site/js/messages.js` (treu `toggleProfile`), `tests/messages.test.mjs` (treu el test de `toggleProfile`), `tests/html.test.mjs` (ajusta el test d'`app.js`)
- Test: `tests/chips.test.mjs`

**Interfaces:**
- Produces: `deselectProps(current: string, clear: () => void) -> {onClick, onKeyDown}`: handlers per posar a l'`div` que embolcalla un `ChoiceChips` opcional (tocar de nou el xip seleccionat, o prémer l'espai, desmarca).

- [ ] **Step 1: Test que falla**

```js
// tests/chips.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { deselectProps } from '../site/js/chips.js';

const input = (value) => ({ target: { tagName: 'INPUT', value } });
const key = (value, k) => ({ key: k, target: { tagName: 'INPUT', value }, preventDefault() { this.prevented = true; } });

test('tocar el xip seleccionat el desmarca', () => {
  let cleared = 0;
  deselectProps('si', () => cleared++).onClick(input('si'));
  assert.equal(cleared, 1);
});
test('tocar un altre xip, una etiqueta o quan no hi ha cap valor no desmarca', () => {
  let cleared = 0;
  const p = deselectProps('si', () => cleared++);
  p.onClick(input('no'));
  p.onClick({ target: { tagName: 'LABEL', value: 'si' } });
  deselectProps('', () => cleared++).onClick(input(''));
  assert.equal(cleared, 0);
});
test('l\'espai sobre el xip seleccionat el desmarca i no fa scroll', () => {
  let cleared = 0;
  const e = key('si', ' ');
  deselectProps('si', () => cleared++).onKeyDown(e);
  assert.equal(cleared, 1);
  assert.equal(e.prevented, true);
});
test('altres tecles no fan res', () => {
  let cleared = 0;
  const e = key('si', 'ArrowRight');
  deselectProps('si', () => cleared++).onKeyDown(e);
  assert.equal(cleared, 0);
  assert.equal(e.prevented, undefined);
});
```

- [ ] **Step 2:** `npm test` → FAIL.
- [ ] **Step 3: Implementació**

```js
// site/js/chips.js
// Un radio ja marcat no dispara onChange: per fer una elecció opcional cal gestionar-ho a l'envoltori.
export function deselectProps(current, clear) {
  const isSelected = (e) => current !== '' && e.target.tagName === 'INPUT' && e.target.value === current;
  return {
    onClick: (e) => { if (isSelected(e)) clear(); },
    onKeyDown: (e) => {
      if (e.key === ' ' && isSelected(e)) { e.preventDefault(); clear(); }
    },
  };
}
```

- [ ] **Step 4:** `npm test` → PASS només `chips.test.mjs` (els altres continuen verds perquè encara no hem canviat res més).
- [ ] **Step 5: Refactor de l'MVP.** A `site/js/app.js`:
  - importa `import { deselectProps } from './chips.js';` i treu `toggleProfile` de l'import de `./messages.js`;
  - substitueix l'`h('div', { onClick: ..., onKeyDown: ... }, ...)` pel següent (la resta de l'arbre del xip no canvia):

```js
    h('div', deselectProps(profile, () => setProfile('')),
      h(T.ChoiceChips, {
        legend: t.profileLegend, name: 'perfil', value: profile,
        options: [{ value: 'distribuidor', label: t.profileDistribuidor }, { value: 'particular', label: t.profileParticular }],
        onChange: (e) => setProfile(e.target.value),
      })),
```

  - A `site/js/messages.js` elimina la funció `toggleProfile` i el seu comentari.
  - A `tests/messages.test.mjs` elimina `toggleProfile` de l'import i el test «toggleProfile: triar, canviar i desmarcar el perfil».
  - A `tests/html.test.mjs` canvia el test `app.js: el perfil es pot desmarcar…` perquè esperi `deselectProps` en comptes de `toggleProfile`/`onClick`/`onKeyDown`:

```js
test('app.js: el perfil es pot desmarcar amb deselectProps', () => {
  assert.match(readFileSync('site/js/app.js', 'utf8'), /deselectProps\(profile/);
});
```

- [ ] **Step 6:** `npm test` → tots PASS. `npm run serve`, obre `http://localhost:8080/?lang=es`, tria «Particular» i torna a tocar-lo: es desmarca (és el comportament d'abans; només comprovem que no s'ha trencat).
- [ ] **Step 7: Commit**

```bash
git add site/js/chips.js site/js/app.js site/js/messages.js tests/chips.test.mjs tests/messages.test.mjs tests/html.test.mjs
git commit -m "refactor: xips desmarcables en un helper reutilitzable" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 6: Literals del formulari, tracte proper al portuguès i document de validació

**Files:**
- Create: `site/js/i18n-form.js`
- Modify: `site/js/i18n.js`, `scripts/export-texts.mjs`, `docs/textos-contacte.md` (regenerat), `tests/i18n.test.mjs`
- Test: `tests/form-i18n.test.mjs`

**Interfaces:**
- Consumes: `PROFILES`, `ACTIVITIES` (Task 2).
- Produces: `FORM[lang]` amb: `entryCta, entryContactLabel, title, subtitle, product, productPlaceholder, name, email, phone, profileLegend, profiles{particular,profesional}, profilingTitle, activity, activityPlaceholder, activities{…10 ids}, activityOther, hasElectric, investing, yes, no, demo, demoPlaceholder, consentBefore, consentLink, newsletter, submit, errors{required,productRequired,profileRequired,email,phone,privacy}, pendingTitle, pendingText, privacyText`; i `DICT[lang].form === FORM[lang]`.

- [ ] **Step 1: Tests que fallen**

```js
// tests/form-i18n.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../site/js/config.js';
import { DICT } from '../site/js/i18n.js';
import { ACTIVITIES, PROFILES } from '../site/js/form/model.js';

const ERROR_CODES = ['required', 'productRequired', 'profileRequired', 'email', 'phone', 'privacy'];
const leaves = (o) => Object.values(o).flatMap((v) => (typeof v === 'object' ? leaves(v) : [v]));

test('cada idioma té una etiqueta per a cada activitat i cada perfil', () => {
  for (const l of CONFIG.languages) {
    assert.deepEqual(Object.keys(DICT[l].form.activities).sort(), [...ACTIVITIES].sort(), l);
    assert.deepEqual(Object.keys(DICT[l].form.profiles).sort(), [...PROFILES].sort(), l);
  }
});
test('cada codi d\'error de la validació té missatge en tots els idiomes', () => {
  for (const l of CONFIG.languages) assert.deepEqual(Object.keys(DICT[l].form.errors).sort(), [...ERROR_CODES].sort(), l);
});
test('«Ski / Wake» no es tradueix a cap idioma', () => {
  for (const l of CONFIG.languages) assert.match(DICT[l].form.activities.skiwake, /Ski \/ Wake/, l);
});
test('el text de privacitat de l\'Extra 1 porta el responsable i el correu, i no diu que no es guarden dades', () => {
  for (const l of CONFIG.languages) {
    const text = DICT[l].form.privacyText;
    assert.match(text, /\{responsable\}/, l);
    assert.match(text, /\{email\}/, l);
    assert.doesNotMatch(text, /no guarda|no desa|não guarda|not store|does not store/i, l);
  }
});
test('portuguès: tracte proper (tu) a tots els literals visibles', () => {
  const formal = /\b(Diga|Escreva|Pode|Podem|Contacte|Introduza|Preencha|Escolha)\b|Quem é\?|\b(seu|sua|seus|suas|lhe)\b/i;
  const { messages, ...ui } = DICT.pt;
  for (const s of leaves(ui)) assert.doesNotMatch(s, formal, s);
});
test('cap literal del formulari porta marques d\'obligatorietat escrites (el component les afegeix)', () => {
  for (const l of CONFIG.languages) for (const s of leaves(DICT[l].form)) assert.doesNotMatch(s, /\*$/, s);
});
```

```js
// tests/i18n.test.mjs — substituir el test «registre consistent…» per aquest (ara també mira el formulari)
test('registre consistent a la interfície: ES i CA de tu, sense «usted» ni «vós»', () => {
  const ui = (d) => leaves((({ messages, ...rest }) => rest)(d)).join(' ');
  assert.doesNotMatch(ui(DICT.es), /\b(su|sus|usted|ustedes)\b/i);
  assert.doesNotMatch(ui(DICT.ca), /\b(vostre|vostra|vostres|escriviu|contacteu)\b/i);
});
```

- [ ] **Step 2:** `npm test` → FAIL (`DICT.es.form` és `undefined`; el PT encara és formal).

- [ ] **Step 3: Escriure `site/js/i18n-form.js`** (tots els idiomes, mateixa forma; el castellà és la font, la resta és la seva traducció):

```js
// site/js/i18n-form.js
// Literals de la pantalla del formulari de l'Extra 1. Tracte proper. «Ski / Wake» no es tradueix.
// Esborrany pendent de validar per Bruno (vegeu docs/textos-contacte.md).
export const FORM = {
  es: {
    entryCta: 'Pedir información de un producto',
    entryContactLabel: 'O escríbenos directamente',
    title: 'Recibe la ficha del producto',
    subtitle: 'Déjanos tus datos y descárgala al instante',
    product: 'Producto', productPlaceholder: 'Elige un producto',
    name: 'Nombre', email: 'Correo', phone: 'Teléfono',
    profileLegend: '¿Quién eres?',
    profiles: { particular: 'Particular', profesional: 'Profesional' },
    profilingTitle: 'Para atenderte mejor (opcional)',
    activity: 'Actividad principal', activityPlaceholder: 'Elige una actividad',
    activities: {
      ocio: 'Ocio', charter: 'Chárter / alquiler', vela: 'Deporte: vela', buceo: 'Deporte: buceo',
      skiwake: 'Deporte: Ski / Wake', seguridad: 'Seguridad / salvamento', pasajeros: 'Transporte de pasajeros',
      pesca: 'Pesca', marina: 'Marina / operador portuario', otra: 'Otra',
    },
    activityOther: 'Otra actividad (especifica)',
    hasElectric: '¿Ya tienes embarcaciones de propulsión eléctrica?',
    investing: '¿Estás pensando en invertir en propulsión eléctrica?',
    yes: 'Sí', no: 'No',
    demo: '¿Te interesa una demostración? Indica tu localidad', demoPlaceholder: 'Localidad',
    consentBefore: 'Acepto la ', consentLink: 'política de privacidad',
    newsletter: 'Quiero recibir novedades (opcional)',
    submit: 'Enviar y descargar el PDF',
    errors: {
      required: 'Completa este campo', productRequired: 'Elige un producto', profileRequired: 'Elige una opción',
      email: 'Introduce un correo válido', phone: 'Introduce un teléfono válido', privacy: 'Debes aceptar la política de privacidad',
    },
    pendingTitle: 'Formulario listo',
    pendingText: 'Los datos son correctos. El envío se activa en la siguiente fase.',
    privacyText: 'Si usas el formulario, guardamos tu nombre, correo, teléfono, el producto que te interesa, el idioma y tu perfil (particular o profesional). Si respondes a las preguntas opcionales, también tu actividad, si ya tienes embarcaciones eléctricas, si piensas invertir y tu localidad. Los usamos para enviarte la ficha y contactarte sobre tu interés; si marcas la casilla de novedades, también para enviarte novedades. Responsable: {responsable}. Los datos se guardan en Google (Formularios y Hojas de cálculo), que actúa como encargado del tratamiento. Puedes pedirnos acceso, rectificación o supresión escribiendo a {email}.',
  },
  ca: {
    entryCta: 'Demanar informació d\'un producte',
    entryContactLabel: 'O escriu-nos directament',
    title: 'Rep la fitxa del producte',
    subtitle: 'Deixa\'ns les teves dades i descarrega-la a l\'instant',
    product: 'Producte', productPlaceholder: 'Tria un producte',
    name: 'Nom', email: 'Correu', phone: 'Telèfon',
    profileLegend: 'Qui ets?',
    profiles: { particular: 'Particular', profesional: 'Professional' },
    profilingTitle: 'Per atendre\'t millor (opcional)',
    activity: 'Activitat principal', activityPlaceholder: 'Tria una activitat',
    activities: {
      ocio: 'Oci', charter: 'Xàrter / lloguer', vela: 'Esport: vela', buceo: 'Esport: busseig',
      skiwake: 'Esport: Ski / Wake', seguridad: 'Seguretat / salvament', pasajeros: 'Transport de passatgers',
      pesca: 'Pesca', marina: 'Marina / operador portuari', otra: 'Altra',
    },
    activityOther: 'Una altra activitat (especifica)',
    hasElectric: 'Ja tens embarcacions de propulsió elèctrica?',
    investing: 'Estàs pensant a invertir en propulsió elèctrica?',
    yes: 'Sí', no: 'No',
    demo: 'T\'interessa una demostració? Indica la teva localitat', demoPlaceholder: 'Localitat',
    consentBefore: 'Accepto la ', consentLink: 'política de privacitat',
    newsletter: 'Vull rebre novetats (opcional)',
    submit: 'Enviar i descarregar el PDF',
    errors: {
      required: 'Omple aquest camp', productRequired: 'Tria un producte', profileRequired: 'Tria una opció',
      email: 'Introdueix un correu vàlid', phone: 'Introdueix un telèfon vàlid', privacy: 'Has d\'acceptar la política de privacitat',
    },
    pendingTitle: 'Formulari llest',
    pendingText: 'Les dades són correctes. L\'enviament s\'activa a la fase següent.',
    privacyText: 'Si fas servir el formulari, desem el teu nom, correu, telèfon, el producte que t\'interessa, l\'idioma i el teu perfil (particular o professional). Si respons les preguntes opcionals, també la teva activitat, si ja tens embarcacions elèctriques, si penses invertir i la teva localitat. Els fem servir per enviar-te la fitxa i contactar-te sobre el teu interès; si marques la casella de novetats, també per enviar-te novetats. Responsable: {responsable}. Les dades es desen a Google (Formularis i Fulls de càlcul), que actua com a encarregat del tractament. Pots demanar-nos accés, rectificació o supressió escrivint a {email}.',
  },
  pt: {
    entryCta: 'Pedir informação sobre um produto',
    entryContactLabel: 'Ou escreve-nos diretamente',
    title: 'Recebe a ficha do produto',
    subtitle: 'Deixa-nos os teus dados e descarrega-a já',
    product: 'Produto', productPlaceholder: 'Escolhe um produto',
    name: 'Nome', email: 'E-mail', phone: 'Telefone',
    profileLegend: 'Quem és?',
    profiles: { particular: 'Particular', profesional: 'Profissional' },
    profilingTitle: 'Para te atendermos melhor (opcional)',
    activity: 'Atividade principal', activityPlaceholder: 'Escolhe uma atividade',
    activities: {
      ocio: 'Lazer', charter: 'Charter / aluguer', vela: 'Desporto: vela', buceo: 'Desporto: mergulho',
      skiwake: 'Desporto: Ski / Wake', seguridad: 'Segurança / salvamento', pasajeros: 'Transporte de passageiros',
      pesca: 'Pesca', marina: 'Marina / operador portuário', otra: 'Outra',
    },
    activityOther: 'Outra atividade (especifica)',
    hasElectric: 'Já tens embarcações de propulsão elétrica?',
    investing: 'Estás a pensar investir em propulsão elétrica?',
    yes: 'Sim', no: 'Não',
    demo: 'Tens interesse numa demonstração? Indica a tua localidade', demoPlaceholder: 'Localidade',
    consentBefore: 'Aceito a ', consentLink: 'política de privacidade',
    newsletter: 'Quero receber novidades (opcional)',
    submit: 'Enviar e descarregar o PDF',
    errors: {
      required: 'Preenche este campo', productRequired: 'Escolhe um produto', profileRequired: 'Escolhe uma opção',
      email: 'Introduz um e-mail válido', phone: 'Introduz um telefone válido', privacy: 'Tens de aceitar a política de privacidade',
    },
    pendingTitle: 'Formulário pronto',
    pendingText: 'Os dados estão corretos. O envio ativa-se na fase seguinte.',
    privacyText: 'Se usares o formulário, guardamos o teu nome, e-mail, telefone, o produto que te interessa, o idioma e o teu perfil (particular ou profissional). Se responderes às perguntas opcionais, também a tua atividade, se já tens embarcações elétricas, se pensas investir e a tua localidade. Usamos estes dados para te enviar a ficha e contactar-te sobre o teu interesse; se marcares a caixa de novidades, também para te enviar novidades. Responsável: {responsable}. Os dados ficam guardados na Google (Formulários e Folhas de cálculo), que atua como subcontratante. Podes pedir-nos acesso, retificação ou apagamento escrevendo para {email}.',
  },
  en: {
    entryCta: 'Request information on a product',
    entryContactLabel: 'Or write to us directly',
    title: 'Get the product sheet',
    subtitle: 'Leave us your details and download it instantly',
    product: 'Product', productPlaceholder: 'Choose a product',
    name: 'Name', email: 'Email', phone: 'Phone',
    profileLegend: 'Who are you?',
    profiles: { particular: 'Private customer', profesional: 'Professional' },
    profilingTitle: 'To help us serve you better (optional)',
    activity: 'Main activity', activityPlaceholder: 'Choose an activity',
    activities: {
      ocio: 'Leisure', charter: 'Charter / rental', vela: 'Sport: sailing', buceo: 'Sport: diving',
      skiwake: 'Sport: Ski / Wake', seguridad: 'Safety / rescue', pasajeros: 'Passenger transport',
      pesca: 'Fishing', marina: 'Marina / port operator', otra: 'Other',
    },
    activityOther: 'Other activity (please specify)',
    hasElectric: 'Do you already have electric-propulsion boats?',
    investing: 'Are you thinking of investing in electric propulsion?',
    yes: 'Yes', no: 'No',
    demo: 'Interested in a demo? Tell us your town or city', demoPlaceholder: 'Town or city',
    consentBefore: 'I accept the ', consentLink: 'privacy policy',
    newsletter: 'I want to receive news (optional)',
    submit: 'Send and download the PDF',
    errors: {
      required: 'Fill in this field', productRequired: 'Choose a product', profileRequired: 'Choose an option',
      email: 'Enter a valid email', phone: 'Enter a valid phone number', privacy: 'You must accept the privacy policy',
    },
    pendingTitle: 'Form ready',
    pendingText: 'Your details are valid. Sending is switched on in the next phase.',
    privacyText: 'If you use the form, we store your name, email, phone, the product you are interested in, your language and your profile (private customer or professional). If you answer the optional questions, we also store your activity, whether you already own electric boats, whether you plan to invest and your town or city. We use this to send you the product sheet and contact you about your interest; if you tick the news box, also to send you news. Controller: {responsable}. The data is stored with Google (Forms and Sheets), which acts as data processor. You can ask us for access, correction or deletion by writing to {email}.',
  },
};
```

- [ ] **Step 4: Connectar el diccionari.** A `site/js/i18n.js`: afegeix `import { FORM } from './i18n-form.js';` a dalt; canvia `export const DICT = {` per `const PAGE = {`; i, just abans de `export function resolveLang`, afegeix:

```js
export const DICT = Object.fromEntries(Object.entries(PAGE).map(([lang, page]) => [lang, { ...page, form: FORM[lang] }]));
```

  Al bloc `pt` de `PAGE` canvia només aquests literals visibles (no `messages`, `greeting` ni `closing`):

```js
    subtitle: 'Diz-nos o que procuras e respondemos',
    profileLegend: 'Quem és? (opcional)',
    contactLabel: 'Escreve-nos',
    contactHint: 'Abre com uma mensagem já escrita. Podes alterá-la antes de a enviar.',
    contactFallback: 'Não abre? Escreve-nos para',
    privacyText: 'Esta página não guarda dados pessoais. Se nos escreveres por WhatsApp ou por correio, usaremos os teus dados apenas para te responder.',
```

- [ ] **Step 5: Document de validació.** A `scripts/export-texts.mjs`, abans de la secció `## Missatges`, afegeix una taula del formulari generada de manera genèrica. Afegeix aquestes funcions a dalt del fitxer:

```js
const flat = (o, prefix = '') => Object.entries(o).flatMap(([k, v]) => (typeof v === 'object' ? flat(v, `${prefix}${k}.`) : [[`${prefix}${k}`, v]]));
const at = (o, path) => path.split('.').reduce((acc, k) => acc[k], o);
```

  i, dins de `renderTexts`, just després de la taula «Textos de la pàgina»:

```js
    '## Formulari de l\'Extra 1 (esborrany)',
    '',
    '| Clau | ' + config.languages.map((l) => l.toUpperCase()).join(' | ') + ' |',
    '|---|' + config.languages.map(() => '---|').join(''),
    ...flat(dict.es.form).map(([key]) => `| \`${key}\` | ${config.languages.map((l) => cell(at(dict[l].form, key))).join(' | ')} |`),
    '',
```

  (Insereix-ho dins l'array `out` amb l'operador d'escampament, igual que el bloc `UI.map`.) Després executa `npm run texts`.

- [ ] **Step 6:** `npm test` → PASS (inclou `texts-doc`, que compara el document regenerat).
- [ ] **Step 7: Commit**

```bash
git add site/js/i18n-form.js site/js/i18n.js scripts/export-texts.mjs docs/textos-contacte.md tests/form-i18n.test.mjs tests/i18n.test.mjs
git commit -m "feat: literals del formulari en 4 idiomes i tracte proper al portuguès" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 7: Components d'UI presentacionals (amb renderitzador fals)

**Files:**
- Create: `tests/helpers/fake-react.mjs`, `site/js/form/focus.js`, `site/js/ui/chrome.js`, `site/js/ui/entry-screen.js`, `site/js/ui/form-screen.js`
- Test: `tests/ui.test.mjs`, `tests/form-focus.test.mjs`

**Interfaces:**
- Consumes: `DICT[lang].form` (Task 6), `showsActivity`, `showsActivityOther`, `ACTIVITIES`, `PROFILES` (Task 2), `deselectProps` (Task 5), `firstErrorField` (Task 3), `icon` (existent).
- Produces: `createChrome({h,T,brand,languages}) -> Header({t,lang,onLang})`; `createEntryScreen({h,T,icon}) -> EntryScreen({t,links,email,profile,onProfile,onClearProfile,legalQuery,onOpenForm?})` (si no hi ha `onOpenForm`, és l'MVP d'ara); `createFormScreen({h,T}) -> FormScreen({t,products,values,errors,onChange(field,value),onSubmit(),onBack(),privacyHref})`; `focusFirstError(errors, doc) -> boolean`.

- [ ] **Step 1: Helper de proves i test del focus**

```js
// tests/helpers/fake-react.mjs
// Renderitzador mínim: h construeix un arbre i T retorna noms de component, així els components d'UI es proven a Node.
export const h = (type, props, ...children) => ({ type, props: props ?? {}, children: children.flat(Infinity) });
export const T = new Proxy({}, { get: (_, name) => `T.${String(name)}` });
export const findAll = (node, predicate, out = []) => {
  if (node && typeof node === 'object') {
    if (predicate(node)) out.push(node);
    node.children?.forEach((child) => findAll(child, predicate, out));
  }
  return out;
};
export const byType = (tree, type) => findAll(tree, (n) => n.type === type);
export const byName = (tree, name) => findAll(tree, (n) => n.props?.name === name);
export const textOf = (node) => (node && typeof node === 'object' ? (node.children ?? []).map(textOf).join('') : String(node ?? ''));
```

```js
// tests/form-focus.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { focusFirstError } from '../site/js/form/focus.js';

const fakeDoc = (present) => ({ querySelector: (sel) => (present.includes(sel) ? { focus() { this.focused = true; }, sel } : null) });

test('enfoca el primer camp amb error segons l\'ordre de la pantalla', () => {
  const found = {};
  const doc = { querySelector: (sel) => (found[sel] = { focus() { this.focused = true; } }) };
  assert.equal(focusFirstError({ phone: 'required', name: 'required' }, doc), true);
  assert.equal(found['[name="name"]'].focused, true);
  assert.equal(found['[name="phone"]'], undefined);
});
test('sense errors, o amb un camp que no existeix al DOM, no fa res', () => {
  assert.equal(focusFirstError({}, fakeDoc([])), false);
  assert.equal(focusFirstError({ email: 'email' }, fakeDoc([])), false);
});
```

- [ ] **Step 2:** `npm test` → FAIL. **Step 3:**

```js
// site/js/form/focus.js
import { firstErrorField } from './validate.js';

export function focusFirstError(errors, doc) {
  const field = firstErrorField(errors);
  const element = field && doc.querySelector(`[name="${field}"]`);
  if (!element) return false;
  element.focus();
  return true;
}
```

  **Step 4:** `npm test` → PASS.

- [ ] **Step 5: Tests de la UI que fallen**

```js
// tests/ui.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { h, T, byType, byName, findAll, textOf } from './helpers/fake-react.mjs';
import { DICT } from '../site/js/i18n.js';
import { CONFIG } from '../site/js/config.js';
import { emptyForm } from '../site/js/form/model.js';
import { icon } from '../site/js/icons.js';
import { createChrome } from '../site/js/ui/chrome.js';
import { createEntryScreen } from '../site/js/ui/entry-screen.js';
import { createFormScreen } from '../site/js/ui/form-screen.js';

const noop = () => {};
const Header = createChrome({ h, T, brand: CONFIG.brand, languages: CONFIG.languages });
const EntryScreen = createEntryScreen({ h, T, icon });
const FormScreen = createFormScreen({ h, T });

const entry = (extra = {}) => EntryScreen({
  t: DICT.es, links: { whatsapp: 'wa', email: 'mail' }, email: CONFIG.email, profile: '', onProfile: noop, onClearProfile: noop, legalQuery: '?lang=es', ...extra,
});
const form = (extra = {}) => FormScreen({
  t: DICT.es, products: CONFIG.products, values: emptyForm(), errors: {}, onChange: noop, onSubmit: noop, onBack: noop, privacyHref: 'privacy.html?lang=es#privacy', ...extra,
});
const buttons = (tree) => byType(tree, 'T.Button');

test('capçalera: marca i selector d\'idioma amb codis en majúscules', () => {
  const tree = Header({ t: DICT.ca, lang: 'ca', onLang: noop });
  assert.equal(textOf(tree).includes(CONFIG.brand), true);
  const [lang] = byType(tree, 'T.LangSwitch');
  assert.equal(lang.props.value, 'CA');
  assert.deepEqual(lang.props.languages.map((l) => l.code), ['ES', 'CA', 'PT', 'EN']);
});

test('entrada sense Extra 1: com l\'MVP (WhatsApp principal, cap botó nou)', () => {
  const [wa, mail] = buttons(entry());
  assert.equal(wa.props.variant, undefined);
  assert.equal(mail.props.variant, 'outline');
  assert.equal(buttons(entry()).length, 2);
  assert.equal(byType(entry(), 'T.SectionHeading')[0].props.level, 1);
});
test('entrada amb Extra 1: el botó nou és l\'únic principal i WhatsApp passa a secundari', () => {
  const onOpenForm = noop;
  const [cta, wa, mail] = buttons(entry({ onOpenForm }));
  assert.equal(textOf(cta), DICT.es.form.entryCta);
  assert.equal(cta.props.variant, undefined);
  assert.equal(cta.props.onClick, onOpenForm);
  assert.equal(wa.props.variant, 'outline');
  assert.equal(mail.props.variant, 'outline');
  assert.equal(textOf(byType(entry({ onOpenForm }), 'T.SectionLabel')[0]), DICT.es.form.entryContactLabel);
});
test('entrada: línia explicativa, adreça visible i enllaços legals amb la query', () => {
  const tree = entry({ legalQuery: '?lang=es&extra1=1' });
  assert.ok(textOf(tree).includes(DICT.es.contactHint));
  assert.ok(textOf(tree).includes(`${DICT.es.contactFallback} ${CONFIG.email}`));
  const [legal] = byType(tree, 'T.LegalLinks');
  assert.equal(legal.props.links[0].href, 'privacy.html?lang=es&extra1=1');
});
test('entrada: el perfil és desmarcable', () => {
  const wrapper = findAll(entry({ profile: 'particular' }), (n) => n.type === 'div' && typeof n.props.onClick === 'function' && typeof n.props.onKeyDown === 'function');
  assert.equal(wrapper.length, 1);
});

test('formulari: camps de contacte obligatoris amb el tipus de teclat adequat', () => {
  const tree = form();
  assert.equal(byName(tree, 'product')[0].props.required, true);
  assert.deepEqual(byName(tree, 'product')[0].props.options.map((o) => o.value), CONFIG.products.map((p) => p.id));
  for (const [name, type] of [['name', undefined], ['email', 'email'], ['phone', 'tel']]) {
    const [field] = byName(tree, name);
    assert.equal(field.props.required, true, name);
    assert.equal(field.props.type, type, name);
  }
});
test('formulari: el perfil és obligatori (porta «*») i no és desmarcable', () => {
  const [profile] = byName(form(), 'profile');
  assert.ok(profile.props.legend.endsWith(' *'));
  assert.deepEqual(profile.props.options.map((o) => o.label), ['Particular', 'Profesional']);
  const wrappers = findAll(form(), (n) => n.type === 'div' && n.props.onClick && findAll(n, (c) => c.props?.name === 'profile').length);
  assert.equal(wrappers.length, 0);
});
test('formulari: l\'activitat només surt per a Profesional, i «Otra» mostra el camp d\'especificar', () => {
  assert.equal(byName(form({ values: emptyForm({ profile: 'particular' }) }), 'activity').length, 0);
  const pro = form({ values: emptyForm({ profile: 'profesional' }) });
  const [activity] = byName(pro, 'activity');
  assert.equal(activity.props.options.length, 10);
  assert.equal(byName(pro, 'activityOther').length, 0);
  const other = form({ values: { ...emptyForm({ profile: 'profesional' }), activity: 'otra' } });
  assert.equal(byName(other, 'activityOther').length, 1);
});
test('formulari: la perfilació és opcional i les preguntes de sí/no es poden desmarcar', () => {
  const tree = form({ values: { ...emptyForm(), hasElectric: 'si' } });
  assert.ok(textOf(byType(tree, 'T.SectionLabel')[0]).includes('(opcional)'));
  for (const name of ['hasElectric', 'investing', 'demo']) {
    const [c] = byName(tree, name);
    assert.ok(!c.props.required && !String(c.props.legend ?? '').endsWith('*'), name);
  }
  const wrappers = findAll(tree, (n) => n.type === 'div' && n.props.onClick && n.props.onKeyDown);
  assert.equal(wrappers.length, 2);
});
test('formulari: els errors surten en l\'idioma actiu i es tradueixen en canviar-lo', () => {
  const errors = { email: 'email', privacy: 'privacy' };
  const es = form({ errors });
  assert.equal(byName(es, 'email')[0].props.error, DICT.es.form.errors.email);
  const ca = form({ errors, t: DICT.ca });
  assert.equal(byName(ca, 'email')[0].props.error, DICT.ca.form.errors.email);
  assert.equal(byName(ca, 'privacy')[0].props.error, DICT.ca.form.errors.privacy);
  assert.equal(byName(es, 'name')[0].props.error, undefined);
});
test('formulari: privacitat sense marcar, enllaç a pestanya nova, novetats opcional', () => {
  const tree = form();
  const [privacy] = byName(tree, 'privacy');
  assert.equal(privacy.props.checked, false);
  assert.equal(privacy.props.required, true);
  const [link] = byType(privacy, 'a');
  assert.deepEqual([link.props.href, link.props.target, link.props.rel], ['privacy.html?lang=es#privacy', '_blank', 'noopener']);
  assert.equal(byName(tree, 'newsletter')[0].props.required, undefined);
  assert.ok(textOf(byName(tree, 'newsletter')[0]).includes('(opcional)'));
});
test('formulari: botó d\'enviar principal i «← Volver» com a enllaç', () => {
  const [submit, back] = buttons(form());
  assert.deepEqual([submit.props.type, submit.props.full, textOf(submit)], ['submit', true, 'Enviar y descargar el PDF']);
  assert.deepEqual([back.props.variant, textOf(back)], ['link', '← Volver']);
});
test('formulari: enviar no recarrega la pàgina i crida onSubmit', () => {
  let sent = 0;
  const [formEl] = byType(form({ onSubmit: () => sent++ }), 'form');
  const e = { preventDefault() { this.prevented = true; } };
  formEl.props.onSubmit(e);
  assert.equal(e.prevented, true);
  assert.equal(sent, 1);
  assert.equal(formEl.props.noValidate, true);
});
test('formulari: cada control notifica el seu camp amb el valor correcte', () => {
  const calls = [];
  const tree = form({ onChange: (f, v) => calls.push([f, v]) });
  byName(tree, 'name')[0].props.onChange({ target: { value: 'Ana' } });
  byName(tree, 'privacy')[0].props.onChange({ target: { checked: true } });
  assert.deepEqual(calls, [['name', 'Ana'], ['privacy', true]]);
});
```

- [ ] **Step 6:** `npm test` → FAIL (els mòduls d'UI no existeixen).

- [ ] **Step 7: Implementació**

```js
// site/js/ui/chrome.js
export function createChrome({ h, T, brand, languages }) {
  return function Header({ t, lang, onLang }) {
    return h('div', { className: 'page__top' },
      h('span', { className: 'wordmark' }, brand),
      h(T.LangSwitch, {
        languages: languages.map((code) => ({ code: code.toUpperCase() })),
        value: lang.toUpperCase(), label: t.langLabel,
        onChange: (e) => onLang(e.target.value.toLowerCase()),
      }));
  };
}
```

```js
// site/js/ui/entry-screen.js
import { deselectProps } from '../chips.js';

export function createEntryScreen({ h, T, icon }) {
  return function EntryScreen({ t, links, email, profile, onProfile, onClearProfile, legalQuery, onOpenForm }) {
    const withForm = typeof onOpenForm === 'function';
    return h('div', { className: 'page__screen' },
      h(T.SectionHeading, { layout: 'mobile', align: 'start', level: 1, title: t.title, subtitle: t.subtitle, className: 'page__title' }),
      h('div', deselectProps(profile, onClearProfile),
        h(T.ChoiceChips, {
          legend: t.profileLegend, name: 'perfil', value: profile,
          options: [{ value: 'distribuidor', label: t.profileDistribuidor }, { value: 'particular', label: t.profileParticular }],
          onChange: (e) => onProfile(e.target.value),
        })),
      withForm ? h(T.Button, { full: true, onClick: onOpenForm }, t.form.entryCta) : null,
      h(T.SectionLabel, null, withForm ? t.form.entryContactLabel : t.contactLabel),
      h('div', { className: 'page__stack' },
        h(T.Button, { full: true, variant: withForm ? 'outline' : undefined, href: links.whatsapp }, icon(h, 'whatsapp'), t.whatsapp),
        h(T.Button, { full: true, variant: 'outline', href: links.email }, icon(h, 'mail'), t.emailLabel),
        h('p', { className: 'body-sm page__note' }, t.contactHint),
        h('p', { className: 'body-sm page__note' }, `${t.contactFallback} `, h('span', { className: 'page__address' }, email))),
      h(T.LegalLinks, {
        label: t.legalNav,
        links: [{ label: t.privacy, href: `privacy.html${legalQuery}` }, { label: t.cookies, href: `privacy.html${legalQuery}#cookies` }],
      }));
  };
}
```

```js
// site/js/ui/form-screen.js
import { ACTIVITIES, PROFILES, showsActivity, showsActivityOther } from '../form/model.js';
import { deselectProps } from '../chips.js';

export function createFormScreen({ h, T }) {
  return function FormScreen({ t, products, values, errors, onChange, onSubmit, onBack, privacyHref }) {
    const f = t.form;
    const set = (field) => (e) => onChange(field, e.target.value);
    const error = (field) => (errors[field] ? f.errors[errors[field]] : undefined);

    const text = (field, label, extra = {}) =>
      h(T.Field, { label, name: field, id: field, value: values[field], error: error(field), onChange: set(field), ...extra });

    const chips = (field, legend, options, { required = false } = {}) => {
      const group = h(T.ChoiceChips, { legend: required ? `${legend} *` : legend, name: field, value: values[field], options, onChange: set(field) });
      const message = error(field);
      const body = [group, message ? h('p', { className: 'caption form__error', role: 'alert' }, `! ${message}`) : null];
      return h('div', required ? {} : deselectProps(values[field], () => onChange(field, '')), ...body);
    };

    const yesNo = [{ value: 'si', label: f.yes }, { value: 'no', label: f.no }];

    return h('div', { className: 'page__screen page__screen--form' },
      h(T.SectionHeading, { layout: 'mobile', align: 'start', level: 1, title: f.title, subtitle: f.subtitle, className: 'page__title' }),
      h('form', { className: 'form', noValidate: true, onSubmit: (e) => { e.preventDefault(); onSubmit(); } },
        h('div', { className: 'form__group' },
          h(T.Select, {
            label: f.product, name: 'product', id: 'product', required: true, placeholder: f.productPlaceholder,
            options: products.map((p) => ({ value: p.id, label: p.name })),
            value: values.product, error: error('product'), onChange: set('product'),
          }),
          text('name', f.name, { required: true }),
          text('email', f.email, { required: true, type: 'email' }),
          text('phone', f.phone, { required: true, type: 'tel' }),
          chips('profile', f.profileLegend, PROFILES.map((p) => ({ value: p, label: f.profiles[p] })), { required: true })),
        h('section', { className: 'form__group' },
          h(T.SectionLabel, { as: 'h2' }, f.profilingTitle),
          showsActivity(values) ? h(T.Select, {
            label: f.activity, name: 'activity', id: 'activity', placeholder: f.activityPlaceholder,
            options: ACTIVITIES.map((a) => ({ value: a, label: f.activities[a] })),
            value: values.activity, onChange: set('activity'),
          }) : null,
          showsActivityOther(values) ? text('activityOther', f.activityOther) : null,
          chips('hasElectric', f.hasElectric, yesNo),
          chips('investing', f.investing, yesNo),
          text('demo', f.demo, { placeholder: f.demoPlaceholder })),
        h('div', { className: 'form__group' },
          h(T.Checkbox, { name: 'privacy', id: 'privacy', required: true, checked: values.privacy, error: error('privacy'), onChange: (e) => onChange('privacy', e.target.checked) },
            f.consentBefore, h('a', { href: privacyHref, target: '_blank', rel: 'noopener' }, f.consentLink)),
          h(T.Checkbox, { name: 'newsletter', id: 'newsletter', checked: values.newsletter, onChange: (e) => onChange('newsletter', e.target.checked) }, f.newsletter)),
        h('div', { className: 'form__actions' },
          h(T.Button, { type: 'submit', full: true }, f.submit),
          h(T.Button, { variant: 'link', onClick: onBack }, `← ${t.back}`))));
  };
}
```

- [ ] **Step 8:** `npm test` → PASS. Si un test del formulari falla perquè `byName` troba el `h(T.Field…)` i el `name` del `div` del xip, revisa que només el component porti `name`.
- [ ] **Step 9: Commit**

```bash
git add tests/helpers/fake-react.mjs tests/ui.test.mjs tests/form-focus.test.mjs site/js/form/focus.js site/js/ui
git commit -m "feat: components d'UI del formulari, l'entrada i la capçalera" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 8: Orquestració (`app.js`), CSS, preloads i privacitat

**Files:**
- Modify: `site/js/app.js` (reescriptura), `site/css/page.css`, `site/index.html`, `site/js/privacy.js`
- Create: `site/js/privacy-text.js`
- Test: `tests/privacy-text.test.mjs`; modifica `tests/html.test.mjs` i `tests/css.test.mjs`

**Interfaces:**
- Consumes: tot l'anterior. Produces: l'esdeveniment `window` `tsf:lead` amb `detail = {contact, profiling, hasProfiling}` en un enviament vàlid (el consumeix el pla d'enviament); `resolvePrivacyText(t, config, extra1) -> string`.

- [ ] **Step 1: Tests que fallen**

```js
// tests/privacy-text.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../site/js/config.js';
import { DICT } from '../site/js/i18n.js';
import { resolvePrivacyText } from '../site/js/privacy-text.js';

test('sense Extra 1 el text és el de l\'MVP', () => {
  for (const l of CONFIG.languages) assert.equal(resolvePrivacyText(DICT[l], CONFIG, false), DICT[l].privacyText);
});
test('amb Extra 1 el text diu qui és el responsable i el correu, sense marcadors per substituir', () => {
  for (const l of CONFIG.languages) {
    const text = resolvePrivacyText(DICT[l], CONFIG, true);
    assert.ok(text.includes(CONFIG.legalName), l);
    assert.ok(text.includes(CONFIG.email), l);
    assert.doesNotMatch(text, /\{[a-z]+\}/, l);
  }
});
```

  A `tests/html.test.mjs`:
  - **elimina** els tests `app.js: línia explicativa i adreça de recuperació…`, `app.js: el perfil es pot desmarcar amb deselectProps` i `app.js: el titular de la pàgina és un h1` (ara són proves de comportament a `tests/ui.test.mjs`);
  - **substitueix** el test `càrrega: cada mòdul que importa app.js té modulepreload…` per aquest, que segueix tots els imports (transitius):

```js
import { posix } from 'node:path';

const importsOf = (file) => [...readFileSync(`site/${file}`, 'utf8').matchAll(/from '(\.[^']+)'/g)]
  .map((m) => posix.normalize(posix.join(posix.dirname(file), m[1])));
const closure = (entry, seen = new Set()) => {
  for (const f of importsOf(entry)) if (!seen.has(f)) { seen.add(f); closure(f, seen); }
  return [...seen];
};

test('càrrega: tots els mòduls que arrosseguen app.js (transitius) tenen modulepreload', () => {
  const modules = closure('js/app.js');
  assert.ok(modules.length >= 10, modules.join(', '));
  for (const f of modules) assert.match(html, new RegExp(`<link rel="modulepreload" href="${f}">`), f);
});
```

  A `tests/css.test.mjs` afegeix:

```js
test('page.css: la pantalla del formulari ocupa l\'alçada i el botó s\'ancora a la base sense posició fixa', () => {
  assert.match(page, /\.page--form\s*\{[^}]*min-height:\s*100dvh/);
  assert.match(page, /\.page__screen\s*\{[^}]*display:\s*flex/);
  assert.match(page, /\.form__actions\s*\{[^}]*margin-top:\s*auto/);
  assert.doesNotMatch(page, /position:\s*fixed/);
});
```

- [ ] **Step 2:** `npm test` → FAIL (falten `privacy-text.js`, els preloads i el CSS).

- [ ] **Step 3: Implementació**

```js
// site/js/privacy-text.js
export function resolvePrivacyText(t, config, extra1) {
  if (!extra1) return t.privacyText;
  return t.form.privacyText.replace('{responsable}', config.legalName).replace('{email}', config.email);
}
```

```js
// site/js/privacy.js  (substitueix tot el contingut)
import { CONFIG } from './config.js';
import { DICT, resolveLang } from './i18n.js';
import { isExtra1Enabled, legalQuery } from './form/context.js';
import { resolvePrivacyText } from './privacy-text.js';

const search = window.location.search;
const lang = resolveLang(search, CONFIG);
const extra1 = isExtra1Enabled(CONFIG, search);
const t = DICT[lang];
document.documentElement.lang = lang;
document.title = `${t.privacyTitle} · ${CONFIG.brand}`;
for (const el of document.querySelectorAll('[data-key]')) el.textContent = t[el.dataset.key];
document.querySelector('[data-key="privacyText"]').textContent = resolvePrivacyText(t, CONFIG, extra1);
document.getElementById('back').href = `index.html${legalQuery(lang, extra1)}`;
```

```js
// site/js/app.js  (reescriptura: només estat i orquestració)
import { CONFIG } from './config.js';
import { DICT, resolveLang } from './i18n.js';
import { contactLinks } from './messages.js';
import { icon } from './icons.js';
import { isExtra1Enabled, legalQuery, profileFromEntry, resolveOrigin, resolveProduct } from './form/context.js';
import { emptyForm, formReducer } from './form/model.js';
import { clearError } from './form/validate.js';
import { newLeadId, submitForm } from './form/lead.js';
import { focusFirstError } from './form/focus.js';
import { createChrome } from './ui/chrome.js';
import { createEntryScreen } from './ui/entry-screen.js';
import { createFormScreen } from './ui/form-screen.js';

const R = window.React;
const T = window.TSF;
const h = R.createElement;
const search = window.location.search;
const extra1 = isExtra1Enabled(CONFIG, search);

const Header = createChrome({ h, T, brand: CONFIG.brand, languages: CONFIG.languages });
const EntryScreen = createEntryScreen({ h, T, icon });
const FormScreen = createFormScreen({ h, T });

function App() {
  const [lang, setLang] = R.useState(() => resolveLang(search, CONFIG));
  const [profile, setProfile] = R.useState('');
  const [view, setView] = R.useState('entry');
  const [values, dispatch] = R.useReducer(formReducer, undefined, () => emptyForm({ product: resolveProduct(search, CONFIG.products) }));
  const [errors, setErrors] = R.useState({});
  const [attempt, setAttempt] = R.useState(0);
  const t = DICT[lang];
  const query = legalQuery(lang, extra1);

  R.useEffect(() => {
    document.documentElement.lang = lang;
    document.title = CONFIG.brand;
  }, [lang]);
  R.useEffect(() => {
    if (attempt > 0) focusFirstError(errors, document);
  }, [attempt]);

  const change = (field, value) => {
    dispatch({ type: 'set', field, value });
    setErrors((current) => clearError(current, field));
  };
  const openForm = () => {
    dispatch({ type: 'prefill', field: 'profile', value: profileFromEntry(profile) });
    setView('form');
  };
  const submit = () => {
    const result = submitForm(values, { products: CONFIG.products, lang, origin: resolveOrigin(search), newId: newLeadId });
    if (result.errors) {
      setErrors(result.errors);
      setAttempt((n) => n + 1);
      return;
    }
    window.dispatchEvent(new CustomEvent('tsf:lead', { detail: result.lead }));
    setView('pending');
  };

  const screens = {
    entry: () => h(EntryScreen, {
      t, links: contactLinks(CONFIG, t, profile), email: CONFIG.email, profile, legalQuery: query,
      onProfile: setProfile, onClearProfile: () => setProfile(''), onOpenForm: extra1 ? openForm : undefined,
    }),
    form: () => h(FormScreen, {
      t, products: CONFIG.products, values, errors, onChange: change, onSubmit: submit,
      onBack: () => setView('entry'), privacyHref: `privacy.html${query}#privacy`,
    }),
    // Provisional: es retira quan arribi el pla d'enviament i de la pantalla de gràcies.
    pending: () => h('div', { className: 'page__screen' },
      h(T.Notice, { variant: 'info', title: t.form.pendingTitle }, t.form.pendingText),
      h(T.Button, { variant: 'outline', full: true, onClick: () => setView('entry') }, t.back)),
  };

  return h('main', { className: view === 'form' ? 'page page--form tsf-compact' : 'page tsf-compact' },
    h(Header, { t, lang, onLang: setLang }),
    screens[view]());
}

window.ReactDOM.createRoot(document.getElementById('root')).render(h(App));
```

  `site/css/page.css`: substitueix el bloc `@media (min-width: 768px) { … }` final per aquest i afegeix les regles noves just abans:

```css
/* Cada pantalla és una columna; el formulari ocupa l'alçada i empeny les accions cap avall (sense posició fixa: salta amb el teclat del mòbil) */
.page__screen { display: flex; flex-direction: column; gap: var(--space-3); }
.page--form { min-height: 100dvh; }
.page__screen--form { flex: 1; }
.form { display: flex; flex: 1; flex-direction: column; gap: var(--space-5); }
.form__group { display: flex; flex-direction: column; gap: var(--space-3); }
.form__error { color: var(--error); }
.form__actions { display: flex; flex-direction: column; gap: var(--space-2); margin-top: auto; padding-top: var(--space-5); }
@media (min-width: 768px) {
  .page, .page__screen { gap: var(--space-5); }
  .page { padding-top: var(--space-7); }
}
```

  `site/index.html`: afegeix, després de `<link rel="modulepreload" href="js/icons.js">`, els mòduls que falten (els tres primers ja hi són):

```html
<link rel="modulepreload" href="js/i18n-form.js">
<link rel="modulepreload" href="js/chips.js">
<link rel="modulepreload" href="js/form/context.js">
<link rel="modulepreload" href="js/form/model.js">
<link rel="modulepreload" href="js/form/validate.js">
<link rel="modulepreload" href="js/form/lead.js">
<link rel="modulepreload" href="js/form/focus.js">
<link rel="modulepreload" href="js/ui/chrome.js">
<link rel="modulepreload" href="js/ui/entry-screen.js">
<link rel="modulepreload" href="js/ui/form-screen.js">
```

- [ ] **Step 4:** `npm test` → PASS.
- [ ] **Step 5: Comprovar que l'MVP no ha canviat (interruptor apagat).** La referència és la versió publicada, que encara és la d'abans: `https://gllado-foranirvis.github.io/lead-capture/?lang=es`. A 360×740, mesura a les dues versions (la publicada i `http://localhost:8080/?lang=es`) amb `javascript_tool` el `top` i l'`height` de `h1`, dels xips, dels botons i dels enllaços legals:

```js
JSON.stringify(['h1', '.tsf-chips', 'a.tsf-btn--solid', 'a.tsf-btn--outline', '.tsf-legal'].map((s) => {
  const r = document.querySelector(s).getBoundingClientRect();
  return [s, Math.round(r.top), Math.round(r.height)];
}))
```

  Han de coincidir a ±1px, WhatsApp ha de continuar `solid`, el correu `outline`, i no hi ha d'haver botó nou. Recorda recarregar el local sense memòria cau (`fetch(url, { cache: 'reload' })`).
- [ ] **Step 6: Commit**

```bash
git add site/js/app.js site/js/privacy.js site/js/privacy-text.js site/css/page.css site/index.html tests/privacy-text.test.mjs tests/html.test.mjs tests/css.test.mjs
git commit -m "feat: orquestració del formulari, CSS, preloads i privacitat de l'Extra 1" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 9: Verificació al navegador, disseny i documentació

**Files:**
- Modify: `DESIGN.md`, `README.md`, `PRODUCT.md` (només si la verificació ho demana)
- Evidència: captures i mesures a `out/verificacio-extra1/` (fora de Git)

- [ ] **Step 1: Camí feliç amb `?extra1=1`** (`http://localhost:8080/?lang=es&extra1=1`, 360×740): el botó nou és l'únic negre; clicar-lo mostra la pantalla neta (logo i idioma, títol, camps, caselles, botó, «← Volver»). Escolta l'esdeveniment abans d'enviar: `window.__leads=[];addEventListener('tsf:lead',e=>__leads.push(e.detail))`. Omple producte, nom, correu, telèfon, perfil i marca privacitat; envia: apareix l'avís provisional i `__leads` té **un** element amb `contact` i `profiling` coherents.
- [ ] **Step 2: Errors.** Envia buit: errors a cada camp, en l'ordre de la pantalla; el focus va al **producte**. Corregeix un camp: el seu error desapareix sol. Canvia a català amb errors visibles: el text canvia i els valors s'hi queden.
- [ ] **Step 3: Dependències.** Tria «Profesional»: apareix «Actividad principal»; tria «Otra»: apareix el camp d'especificar; passa a «Particular»: tots dos desapareixen, i en tornar a «Profesional» estan buits. Les preguntes de sí/no es desmarquen tocant de nou el xip i amb la barra d'espai.
- [ ] **Step 4: Layout.** Amb el contingut més baix que la pantalla (finestra alta) el botó queda a la base; amb el contingut més alt (360×640) segueix l'últim camp i es pot fer scroll. Mesura que a 360px no hi ha scroll horitzontal en els **4 idiomes** i que cap opció del desplegable d'activitat es talla (mira PT i CA). Repeteix amb l'arrel a 24px de mida de lletra. Tema fosc (`data-theme="dark"`) i 768px.
- [ ] **Step 5: Privacitat.** L'enllaç de la casella obre una pestanya nova i `privacy.html?lang=es&extra1=1` mostra el text de l'Extra 1 amb el nom legal i el correu; sense `extra1=1` mostra el de l'MVP.
- [ ] **Step 6: Interruptor apagat.** Sense `?extra1=1` la pàgina és idèntica a la de producció (cap botó nou); amb `?extra1=1` el formulari es veu. Comprova també `?producto=model-b` (preselecciona) i `?o=tauleta` (el lead porta `origin: 'tauleta'`).
- [ ] **Step 7: Qualitat de disseny.** Executa `/Users/olgagarcia/.claude/skills/impeccable/scripts/impeccable detect --json site/js site/css site/index.html` (només ha de sortir el fals positiu de Montserrat) i passa `/impeccable audit site/` per accessibilitat i rendiment; arregla en un sol lot el que sigui real (focus, noms accessibles, contrast) i torna a executar `npm test`. Després `/impeccable polish` sobre la pantalla del formulari.
- [ ] **Step 8: Documentació.** A `DESIGN.md`, a Layout, afegeix l'excepció: «A la pantalla del formulari el botó principal s'ancora a la base de la pantalla quan el contingut hi cap (`min-height: 100dvh` i `margin-top: auto`, mai `position: fixed`), seguint el wireframe; si no hi cap, segueix l'últim camp. Això s'aparta de la regla de `mobile-first.md` perquè l'acció principal quedi a l'abast del polze.» A `README.md`, afegeix a «Comandes» el que ja existeix i una secció **Extra 1** que expliqui l'interruptor (`extra1` a `config.js`, `?extra1=1`), que el formulari acaba en l'esdeveniment `tsf:lead`, que `legalName` i `products` són de prova, i que `docs-privats/` no és al repo. Actualitza `.impeccable/design.json` amb `/impeccable document`.
- [ ] **Step 9: Commit final.** `npm test` → tot PASS; `git status` net. Després:

```bash
git add DESIGN.md README.md PRODUCT.md .impeccable/design.json
git commit -m "docs: excepció d'ancoratge del botó i guia de l'Extra 1" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

  **No fer `git push` fins que l'Olga ho demani:** el codi desplegat és inert sense `?extra1=1`, però el formulari seria visible per a qui conegui el paràmetre.

---

## Self-review

**Cobertura del brief.** Camps i perfil premarcat → T1, T2, T7. Perfilació opcional amb activitat només per a Profesional i «Otra» → T2, T7. Validació, errors a l'idioma actiu → T3, T6, T7. Tracte proper al PT i «Ski / Wake» → T6. Botó ancorat i excepció al `DESIGN.md` → T8, T9. Dos Forms enllaçats per identificador → T4 (`id` compartit i `hasProfiling`; el mapatge a `entry.*` és el pla següent). Privacitat esborrany nostre → T6 (text) i T8 (pàgina). Interruptor i MVP intacte → T1, T8, T9. Document de validació → T6. Fora d'abast declarat: enviament, gràcies/PDF, dos passos.

**Placeholders.** Les dades de prova (`Modelo A/B/C`, `legalName`) són valors reals de configuració, llistades a «Decisions obertes» i al README. No hi ha passos que descriguin què fer sense mostrar el codi, llevat dels de verificació manual (T9) i de les dues modificacions d'edició d'`i18n.js` i `export-texts.mjs`, que indiquen exactament quines línies canviar.

**Coherència de noms.** `emptyForm`, `formReducer`, `showsActivity`, `showsActivityOther`, `validateContact`, `firstErrorField`, `clearError`, `buildLead`, `submitForm`, `newLeadId`, `focusFirstError`, `deselectProps`, `resolvePrivacyText`, `legalQuery`, `profileFromEntry` i els components `createChrome/createEntryScreen/createFormScreen` coincideixen entre tasques i tests. Els codis d'error (`required`, `productRequired`, `profileRequired`, `email`, `phone`, `privacy`) són els mateixos a `validate.js`, a `i18n-form.js` i als tests.

**Review Focus.** Cada línia té el seu test: canvi d'idioma (T2 + T7), dependència d'activitat (T2 + T4), telèfons (T3), URL maliciosa (T1), privacitat (T6 + T8).

**Risc conegut.** Els components del sistema (`Select`, `Checkbox`, `ChoiceChips`) es proven amb un renderitzador fals; el que fan de debò al navegador (per exemple que un `select` tancat talli etiquetes llargues) només es veu a T9.
