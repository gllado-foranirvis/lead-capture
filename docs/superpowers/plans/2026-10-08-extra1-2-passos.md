# Extra 1 · flux de 2 passos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir el formulari d'una sola pantalla de l'Extra 1 per un flux de 2 passos (entrada, pas 1, pas 2, confirmació) amb indicador de pas, lead parcial al pas 1 i missatges de WhatsApp i correu que porten les dades de la sessió.

**Architecture:** Mòduls purs (`form/model`, `validate`, `lead`, `session`, `flow`, `focus`, `hints`, `steps`) provats amb `node:test`; components d'UI com a factories que reben `h` i `T` (provats amb el renderitzador fals `tests/helpers/fake-react.mjs`); `app.js` només orquestra l'estat (`view`: `entry | step1 | step2 | done`). El formulari d'una pantalla (`ui/form-screen.js`) es retira i queda recuperable a la branca `extra1-formulari`.

**Tech Stack:** HTML/CSS/JS pla (mòduls ES), React 18.3 UMD local, `window.TSF` del sistema de disseny, Node 22 per a tests.

**Spec:** `docs/superpowers/specs/2026-10-08-extra1-2-passos.md`. Base de disseny: `PRODUCT.md`, `DESIGN.md`, `the-silent-fleet-ds/`.

## Global Constraints

- Branca nova `extra1-2-passos` creada des de `extra1-formulari`. Cap `git push`, `git merge` ni PR sense que l'Olga ho demani.
- Cada commit acaba amb la línia `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>` (segon `-m`).
- Línia de base: `npm test` = 139 tests verds abans de començar.
- Textos: sense `!` ni `¡`, sense emojis, titulars en frase normal; tracte proper (tu) als 4 idiomes; el document es diu sempre «ficha» (EN «sheet») i no s'hi nomena cap «PDF» als literals visibles.
- `page.css`: cap color literal (`#hex`), cap `@import`, cap `max-width` a `@media`, cap `height: <n>px`, cap `white-space: nowrap`; només variables que existeixin a `site/ds/tokens.css`.
- Moviment: tot el que es mogui té guarda `@media (prefers-reduced-motion: no-preference)`; un canvi de color no en necessita.
- Àrea tàctil 48 px: ja la donen els components del sistema (`Button`, `Field`, `Checkbox`, `ChoiceChips`); no s'hi sobreescriu.
- Cap petició externa; la pàgina no desa res al navegador (cap cookie, `localStorage` ni analítica).
- Dades de prova (a marcar com a tals): llista de productes, número de WhatsApp, `dossierUrl`, text de privacitat, `legalName`.
- El correu del pas 1 es captura com a lead parcial **amb `privacy: false`**. Això és decisió de l'Olga; Bruno ho ha de validar (tema legal). El pla no envia res a cap servidor: només emet esdeveniments `window`.
- Els missatges de WhatsApp i correu només canvien per afegir línies de dades de sessió; sense dades, són exactament els d'abans.

## Review Focus

- Tornar enrere del pas 2 al pas 1 i avançar de nou: conserva els valors, reutilitza el mateix identificador de lead i emet un lead parcial actualitzat amb el correu nou (Task 7).
- Bloquejador de finestres emergents: el document s'obre de forma **síncrona** al clic final, abans de cap canvi d'estat o esdeveniment; si falla, la confirmació sempre té el botó per obrir-lo (Task 7).
- Nom amb símbols (`&`, accents, emoji, `$&`) o de més de 100 caràcters als missatges: arriba intacte i codificat, sense trencar un emoji (Task 3).
- Canviar d'idioma enmig del flux: l'estat es conserva i l'indicador, els textos i els missatges es tradueixen (Tasks 4 i 7).
- Tauleta compartida: després de la confirmació el formulari, l'identificador de lead i les dades de la confirmació s'esborren en tornar a l'inici (Task 7).
- `?producto=` amb un identificador desconegut s'ignora; `?producto=asesoramiento` és vàlid (Task 2).

## File Structure

```
site/js/form/model.js        (modifica) camps del flux, ADVICE, clip, reducer set/reset
site/js/form/validate.js     (modifica) validateStep1/validateStep2/validateContact
site/js/form/lead.js         (modifica) buildPartialLead, buildLead, submitForm amb id
site/js/form/session.js      (nou)      toSession: dades de sessió per als missatges
site/js/form/steps.js        (nou)      stepLabel
site/js/form/flow.js         (modifica) advanceStep1, handleSubmit
site/js/form/context.js      (modifica) sense profileFromEntry; resolveProduct accepta ADVICE
site/js/form/focus.js        (modifica) focusStepHeading
site/js/form/hints.js        (modifica) camps i tecla Intro del nou flux
site/js/messages.js          (modifica) missatges amb dades de sessió
site/js/i18n.js              (modifica) messageContext als 4 idiomes
site/js/i18n-form.js         (modifica) literals del nou flux
site/js/config.js            (modifica) dossierUrl, emailDelivery
site/js/ui/fields.js         (nou)      helpers text/xips compartits pels dos passos
site/js/ui/step-indicator.js (nou)      indicador de pas
site/js/ui/step-product.js   (nou)      pas 1
site/js/ui/step-contact.js   (nou)      pas 2
site/js/ui/done-screen.js    (nou)      confirmació
site/js/ui/entry-screen.js   (modifica) entrada de l'Extra 1 sense xips
site/js/ui/form-screen.js    (esborra)
site/js/app.js               (modifica) orquestració
site/css/page.css            (modifica) indicador, capçalera de pas, transició
site/index.html              (modifica) modulepreload
site/dossier-prova.pdf       (nou)      PDF de prova generat per script
scripts/make-test-pdf.mjs    (nou)
scripts/export-texts.mjs     (modifica) perfils com a objecte + secció de dades de sessió
docs/ README.md DESIGN.md    (modifica)
```

---

### Task 1: Model i validació de 2 passos

**Files:**
- Modify: `site/js/form/model.js`, `site/js/form/validate.js`
- Test: `tests/form-model.test.mjs` (substituir sencer), `tests/form-validate.test.mjs` (substituir sencer)

**Interfaces:**
- Produces (`model.js`): `PROFILES = ['particular','profesional']`, `ADVICE = 'asesoramiento'`, `MAX = { name: 100, email: 254, phone: 30 }`, `clip(value, max) -> string`, `emptyForm({ product }) -> { product, email, name, profile, phone, hasBoat, privacy, newsletter }`, `formReducer(state, action)` amb accions `set {field,value}` i `reset {initial}`.
- Produces (`validate.js`): `STEP_FIELDS = { 1: ['product','email'], 2: ['name','profile','phone','privacy'] }`, `FIELD_ORDER`, `validateStep1(values, products)`, `validateStep2(values)`, `validateContact(values, products)`, `firstErrorField(errors)`, `clearError(errors, field)`. Codis d'error: `productRequired`, `required`, `email`, `profileRequired`, `phone`, `privacy`.

- [ ] **Step 1: Crear la branca**

```bash
cd "/Users/olgagarcia/vibe coding/lead capture"
git switch extra1-formulari && git switch -c extra1-2-passos && npm test 2>&1 | grep -E "^# (pass|fail)"
```
Expected: `# pass 139`, `# fail 0`.

- [ ] **Step 2: Escriure els tests (substituir els dos fitxers)**

```js
// tests/form-model.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { ADVICE, MAX, PROFILES, clip, emptyForm, formReducer } from '../site/js/form/model.js';

test('formulari buit: només els camps del flux de 2 passos, tot net', () => {
  assert.deepEqual(emptyForm(), {
    product: '', email: '', name: '', profile: '', phone: '', hasBoat: '', privacy: false, newsletter: false,
  });
});
test('emptyForm accepta el producte inicial', () => {
  assert.equal(emptyForm({ product: 'model-a' }).product, 'model-a');
});
test('constants del flux', () => {
  assert.deepEqual(PROFILES, ['particular', 'profesional']);
  assert.equal(ADVICE, 'asesoramiento');
  assert.deepEqual(MAX, { name: 100, email: 254, phone: 30 });
});
test('set canvia un camp existent i ignora els desconeguts (com la perfilació antiga)', () => {
  const s = emptyForm();
  assert.equal(formReducer(s, { type: 'set', field: 'name', value: 'Ana' }).name, 'Ana');
  assert.equal(formReducer(s, { type: 'set', field: 'activity', value: 'ocio' }), s);
});
test('reset torna al formulari buit amb el producte inicial', () => {
  const dirty = { ...emptyForm(), name: 'Ana', privacy: true };
  assert.deepEqual(formReducer(dirty, { type: 'reset', initial: { product: 'model-a' } }), emptyForm({ product: 'model-a' }));
});
test('clip retalla i no trenca un emoji', () => {
  assert.equal(clip('  hola  ', 10), 'hola');
  assert.equal(clip(undefined, 5), '');
  const cut = clip('😀'.repeat(150), 100);
  assert.equal(Array.from(cut).length, 100);
  assert.doesNotMatch(cut, /[\ud800-\udbff](?![\udc00-\udfff])/);
});
```

```js
// tests/form-validate.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  FIELD_ORDER, STEP_FIELDS, clearError, firstErrorField, validateContact, validateStep1, validateStep2,
} from '../site/js/form/validate.js';

const PRODUCTS = [{ id: 'model-a', name: 'Modelo A' }];
const ok1 = { product: 'model-a', email: 'ana@example.com' };
const ok2 = { name: 'Ana', profile: 'particular', phone: '+34 600 00 00 00', privacy: true };

test('pas 1: producte i correu són obligatoris', () => {
  assert.deepEqual(validateStep1({}, PRODUCTS), { product: 'productRequired', email: 'required' });
  assert.deepEqual(validateStep1(ok1, PRODUCTS), {});
});
test('pas 1: «asesoramiento» és una opció vàlida; un producte inventat no', () => {
  assert.deepEqual(validateStep1({ ...ok1, product: 'asesoramiento' }, PRODUCTS), {});
  assert.equal(validateStep1({ ...ok1, product: 'inventat' }, PRODUCTS).product, 'productRequired');
});
test('correu: formes vàlides', () => {
  for (const email of ['ana@example.com', 'a@sub.example.co.uk', ' ana@example.com '])
    assert.equal(validateStep1({ ...ok1, email }, PRODUCTS).email, undefined, email);
});
test('correu: formes invàlides (inclou «a@.b.co» i «a@b..co»)', () => {
  for (const email of ['ana', 'a@b', 'a@b.c', 'a@.b.co', 'a@b..co', 'a b@c.com'])
    assert.equal(validateStep1({ ...ok1, email }, PRODUCTS).email, 'email', email);
});
test('pas 2: nom, perfil, telèfon i privacitat són obligatoris', () => {
  assert.deepEqual(validateStep2({}), { name: 'required', profile: 'profileRequired', phone: 'required', privacy: 'privacy' });
  assert.deepEqual(validateStep2(ok2), {});
});
test('telèfon: formes vàlides i invàlides (el «+» només al principi)', () => {
  for (const phone of ['+34 600 00 00 00', '600123456', '(93) 123-45-67'])
    assert.equal(validateStep2({ ...ok2, phone }).phone, undefined, phone);
  for (const phone of ['abc', '12345', '600+123456', '1'.repeat(16)])
    assert.equal(validateStep2({ ...ok2, phone }).phone, 'phone', phone);
});
test('la privacitat només val si és exactament true', () => {
  assert.equal(validateStep2({ ...ok2, privacy: 'true' }).privacy, 'privacy');
});
test('validateContact uneix els dos passos', () => {
  assert.deepEqual(validateContact({ ...ok1, ...ok2 }, PRODUCTS), {});
  assert.deepEqual(Object.keys(validateContact({}, PRODUCTS)).sort(), [...FIELD_ORDER].sort());
  assert.deepEqual(FIELD_ORDER, [...STEP_FIELDS[1], ...STEP_FIELDS[2]]);
});
test('firstErrorField segueix l\'ordre del flux; clearError treu un sol camp', () => {
  assert.equal(firstErrorField({ privacy: 'privacy', email: 'email' }), 'email');
  assert.equal(firstErrorField({}), undefined);
  assert.deepEqual(clearError({ email: 'x', name: 'y' }, 'email'), { name: 'y' });
});
```

- [ ] **Step 3: Veure'ls fallar**

Run: `node --test tests/form-model.test.mjs tests/form-validate.test.mjs 2>&1 | grep -E "^# (pass|fail)"`
Expected: fallen (no existeixen `ADVICE`, `clip`, `validateStep1`…).

- [ ] **Step 4: Implementar**

```js
// site/js/form/model.js
export const PROFILES = ['particular', 'profesional'];
export const ADVICE = 'asesoramiento';
export const MAX = { name: 100, email: 254, phone: 30 };

// Array.from evita partir un emoji (parell subrogat) pel mig.
export const clip = (value, max) => Array.from(String(value ?? '').trim()).slice(0, max).join('');

export const emptyForm = ({ product = '' } = {}) => ({
  product, email: '', name: '', profile: '', phone: '', hasBoat: '', privacy: false, newsletter: false,
});

export function formReducer(state, action) {
  switch (action.type) {
    case 'set':
      return Object.hasOwn(state, action.field) ? { ...state, [action.field]: action.value } : state;
    case 'reset':
      return emptyForm(action.initial);
    default:
      return state;
  }
}
```

```js
// site/js/form/validate.js
import { ADVICE, PROFILES } from './model.js';

export const STEP_FIELDS = { 1: ['product', 'email'], 2: ['name', 'profile', 'phone', 'privacy'] };
export const FIELD_ORDER = [...STEP_FIELDS[1], ...STEP_FIELDS[2]];

const EMAIL = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[^\s@.]{2,}$/;
const PHONE_CHARS = /^\+?[\d\s().-]+$/;
const PHONE_DIGITS = { min: 7, max: 15 };

const text = (values, field) => String(values[field] ?? '').trim();
const digitCount = (s) => s.replace(/\D/g, '').length;

function phoneError(phone) {
  if (!phone) return 'required';
  const n = digitCount(phone);
  return PHONE_CHARS.test(phone) && n >= PHONE_DIGITS.min && n <= PHONE_DIGITS.max ? undefined : 'phone';
}

export function validateStep1(values, products) {
  const errors = {};
  if (![...products.map((p) => p.id), ADVICE].includes(values.product)) errors.product = 'productRequired';
  const email = text(values, 'email');
  if (!email) errors.email = 'required';
  else if (!EMAIL.test(email)) errors.email = 'email';
  return errors;
}

export function validateStep2(values) {
  const errors = {};
  if (!text(values, 'name')) errors.name = 'required';
  if (!PROFILES.includes(values.profile)) errors.profile = 'profileRequired';
  const phone = phoneError(text(values, 'phone'));
  if (phone) errors.phone = phone;
  if (values.privacy !== true) errors.privacy = 'privacy';
  return errors;
}

export const validateContact = (values, products) => ({ ...validateStep1(values, products), ...validateStep2(values) });

export const firstErrorField = (errors) => FIELD_ORDER.find((field) => errors[field]);

export function clearError(errors, field) {
  const { [field]: _removed, ...rest } = errors;
  return rest;
}
```

- [ ] **Step 5: Veure'ls passar**

Run: `node --test tests/form-model.test.mjs tests/form-validate.test.mjs 2>&1 | grep -E "^# (pass|fail)"`
Expected: `# fail 0`. (La resta de la suite quedarà en vermell fins a la Task 7: `lead.js`, `flow.js` i `app.js` encara usen l'API antiga. No cal que el conjunt sigui verd entre tasques 1–6; sí al final de la Task 7.)

- [ ] **Step 6: Commit**

```bash
git add site/js/form/model.js site/js/form/validate.js tests/form-model.test.mjs tests/form-validate.test.mjs
git commit -m "feat: model i validació del flux de 2 passos" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 2: Lead parcial, lead final i context

**Files:**
- Modify: `site/js/form/lead.js`, `site/js/form/context.js`
- Test: `tests/form-lead.test.mjs` (substituir), `tests/form-context.test.mjs` (substituir)

**Interfaces:**
- Consumes: `clip`, `MAX`, `ADVICE` (Task 1), `validateContact`.
- Produces: `newLeadId() -> string`; `buildPartialLead(values, { id, lang, origin }) -> { id, stage:'step1', product, email, privacy:false, lang, origin }`; `buildLead(values, { id, lang, origin }) -> { contact, profiling, hasProfiling }`; `submitForm(values, { products, id, lang, origin }) -> { errors } | { lead }`. `context.js`: `isExtra1Enabled`, `resolveOrigin`, `resolveProduct(search, products)` (accepta `ADVICE`), `legalQuery`. `profileFromEntry` desapareix.

- [ ] **Step 1: Tests**

```js
// tests/form-lead.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildLead, buildPartialLead, newLeadId, submitForm } from '../site/js/form/lead.js';
import { emptyForm } from '../site/js/form/model.js';

const PRODUCTS = [{ id: 'model-a', name: 'Modelo A' }];
const values = {
  ...emptyForm({ product: 'model-a' }), email: ' Ana@Example.com ', name: '  Ana  ', profile: 'profesional',
  phone: ' +34 600 00 00 00 ', hasBoat: 'si', privacy: true, newsletter: true,
};
const ctx = { id: 'id-1', lang: 'es', origin: 'mobil' };

test('lead parcial: privacitat NO acceptada encara que la casella estigui marcada, correu normalitzat', () => {
  assert.deepEqual(buildPartialLead(values, ctx), {
    id: 'id-1', stage: 'step1', product: 'model-a', email: 'ana@example.com', privacy: false, lang: 'es', origin: 'mobil',
  });
});
test('lead final: contacte normalitzat i privacitat acceptada', () => {
  const { contact } = buildLead(values, ctx);
  assert.deepEqual(contact, {
    id: 'id-1', product: 'model-a', name: 'Ana', email: 'ana@example.com', phone: '+34 600 00 00 00',
    privacy: true, newsletter: true, lang: 'es', profile: 'profesional', origin: 'mobil',
  });
});
test('perfilació: només «hasBoat» i només si és sí o no', () => {
  assert.deepEqual(buildLead(values, ctx).profiling, { id: 'id-1', hasBoat: 'si' });
  assert.equal(buildLead(values, ctx).hasProfiling, true);
  const none = buildLead({ ...values, hasBoat: '' }, ctx);
  assert.deepEqual([none.profiling, none.hasProfiling], [{ id: 'id-1' }, false]);
  assert.equal(buildLead({ ...values, hasBoat: 'potser' }, ctx).hasProfiling, false);
});
test('el nom llarg es retalla sense trencar un emoji', () => {
  const { contact } = buildLead({ ...values, name: '😀'.repeat(150) }, ctx);
  assert.equal(Array.from(contact.name).length, 100);
});
test('submitForm: errors o lead, amb el mateix id al contacte i a la perfilació', () => {
  assert.ok(submitForm(emptyForm(), { products: PRODUCTS, ...ctx }).errors.product);
  const { lead } = submitForm(values, { products: PRODUCTS, ...ctx });
  assert.deepEqual([lead.contact.id, lead.profiling.id], ['id-1', 'id-1']);
});
test('newLeadId dona identificadors diferents', () => {
  assert.notEqual(newLeadId(), newLeadId());
});
```

```js
// tests/form-context.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { isExtra1Enabled, legalQuery, resolveOrigin, resolveProduct } from '../site/js/form/context.js';

const PRODUCTS = [{ id: 'model-a', name: 'Modelo A' }];

test('l\'interruptor: config o ?extra1=1', () => {
  assert.equal(isExtra1Enabled({ extra1: false }, ''), false);
  assert.equal(isExtra1Enabled({ extra1: false }, '?extra1=1'), true);
  assert.equal(isExtra1Enabled({ extra1: true }, ''), true);
});
test('origen: mòbil per defecte, tauleta amb ?o=tauleta', () => {
  assert.equal(resolveOrigin(''), 'mobil');
  assert.equal(resolveOrigin('?o=tauleta'), 'tauleta');
  assert.equal(resolveOrigin('?o=altre'), 'mobil');
});
test('?producto= vàlid, «asesoramiento» vàlid i desconegut ignorat', () => {
  assert.equal(resolveProduct('?producto=model-a', PRODUCTS), 'model-a');
  assert.equal(resolveProduct('?producto=asesoramiento', PRODUCTS), 'asesoramiento');
  assert.equal(resolveProduct('?producto=inventat', PRODUCTS), '');
  assert.equal(resolveProduct('', PRODUCTS), '');
});
test('la query legal conserva l\'idioma i, amb Extra 1, el paràmetre', () => {
  assert.equal(legalQuery('ca', false), '?lang=ca');
  assert.equal(legalQuery('ca', true), '?lang=ca&extra1=1');
});
```

- [ ] **Step 2: Veure'ls fallar.** Run: `node --test tests/form-lead.test.mjs tests/form-context.test.mjs 2>&1 | grep -E "^# (pass|fail)"` → Expected: fallen.

- [ ] **Step 3: Implementar**

```js
// site/js/form/lead.js
import { MAX, clip } from './model.js';
import { validateContact } from './validate.js';

export const newLeadId = () =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

const BOAT_ANSWERS = ['si', 'no'];

// El pas 1 desa el correu abans del consentiment: queda registrat que la privacitat NO s'ha acceptat.
export function buildPartialLead(values, { id, lang, origin }) {
  return { id, stage: 'step1', product: values.product, email: clip(values.email, MAX.email).toLowerCase(), privacy: false, lang, origin };
}

function buildContact(values, { id, lang, origin }) {
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
  if (BOAT_ANSWERS.includes(values.hasBoat)) profiling.hasBoat = values.hasBoat;
  return profiling;
}

export function buildLead(values, context) {
  const profiling = buildProfiling(values, context.id);
  return { contact: buildContact(values, context), profiling, hasProfiling: Object.keys(profiling).length > 1 };
}

export function submitForm(values, { products, ...context }) {
  const errors = validateContact(values, products);
  return Object.keys(errors).length ? { errors } : { lead: buildLead(values, context) };
}
```

```js
// site/js/form/context.js
import { ADVICE } from './model.js';

const MOBILE = 'mobil';
const TABLET = 'tauleta';

const param = (search, name) => new URLSearchParams(search).get(name);

export const isExtra1Enabled = (config, search) => config.extra1 === true || param(search, 'extra1') === '1';

export const resolveOrigin = (search) => (param(search, 'o') === TABLET ? TABLET : MOBILE);

export function resolveProduct(search, products) {
  const wanted = param(search, 'producto');
  return wanted === ADVICE || products.some((p) => p.id === wanted) ? wanted : '';
}

export const legalQuery = (lang, extra1) => `?lang=${lang}${extra1 ? '&extra1=1' : ''}`;
```

- [ ] **Step 4: Veure'ls passar.** Run: `node --test tests/form-lead.test.mjs tests/form-context.test.mjs 2>&1 | grep -E "^# (pass|fail)"` → Expected: `# fail 0`.

- [ ] **Step 5: Commit**

```bash
git add site/js/form/lead.js site/js/form/context.js tests/form-lead.test.mjs tests/form-context.test.mjs
git commit -m "feat: lead parcial del pas 1 (privacy false) i lead final" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 3: Missatges amb les dades de la sessió

**Files:**
- Create: `site/js/form/session.js`
- Modify: `site/js/messages.js`, `site/js/i18n.js` (clau `messageContext` als 4 idiomes), `scripts/export-texts.mjs`
- Test: `tests/messages.test.mjs` (substituir), `tests/form-session.test.mjs` (nou)

**Interfaces:**
- Consumes: `clip`, `MAX`, `ADVICE` (Task 1); `DICT[lang].form.{yes,no,productAdvice}` (Task 4: aquest test fixa les claus, el diccionari les afegeix a la Task 4; per això `form-session.test.mjs` usa un diccionari fals).
- Produces: `toSession(values, { products, dict }) -> { profile, product, hasBoat, name }` (cadenes; `profile` és la clau de missatge: `'' | 'particular' | 'distribuidor'`); `contactLinks(config, dict, session = {}) -> { whatsapp, email }`; `whatsappText(dict, session = {})`; `emailBody(dict, session = {})`. `dict.messageContext = { name, product, boat }` amb `{value}`.

- [ ] **Step 1: Tests**

```js
// tests/form-session.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { toSession } from '../site/js/form/session.js';

const products = [{ id: 'model-a', name: 'Modelo A' }];
const dict = { form: { yes: 'Sí', no: 'No', productAdvice: 'No lo sé aún' } };
const full = { product: 'model-a', profile: 'profesional', hasBoat: 'si', name: '  Ana ' };

test('dades de la sessió traduïdes al diccionari actual; «profesional» usa el missatge «distribuidor»', () => {
  assert.deepEqual(toSession(full, { products, dict }), { profile: 'distribuidor', product: 'Modelo A', hasBoat: 'Sí', name: 'Ana' });
});
test('particular, «no» i l\'opció d\'assessorament', () => {
  assert.deepEqual(
    toSession({ product: 'asesoramiento', profile: 'particular', hasBoat: 'no', name: '' }, { products, dict }),
    { profile: 'particular', product: 'No lo sé aún', hasBoat: 'No', name: '' },
  );
});
test('valors absents o desconeguts queden buits', () => {
  const empty = { profile: '', product: '', hasBoat: '', name: '' };
  assert.deepEqual(toSession({}, { products, dict }), empty);
  assert.deepEqual(toSession({ product: 'x', profile: 'x', hasBoat: 'potser' }, { products, dict }), empty);
});
test('el nom es retalla a 100 caràcters', () => {
  assert.equal(Array.from(toSession({ name: 'a'.repeat(300) }, { products, dict }).name).length, 100);
});
```

```js
// tests/messages.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../site/js/config.js';
import { DICT } from '../site/js/i18n.js';
import { contactLinks, emailBody, mailtoUrl, normalizeNumber, whatsappText, whatsappUrl } from '../site/js/messages.js';

const wa = (url) => decodeURIComponent(url.split('text=')[1]);
const mail = (url) => new URLSearchParams(url.split('?')[1]);

test('normalizeNumber deixa només dígits', () => {
  assert.equal(normalizeNumber('+34 600-00 00.00'), '34600000000');
  assert.equal(normalizeNumber('0034600000000'), '34600000000');
});
test('whatsappUrl i mailtoUrl codifiquen accents, ç, ñ i salts de línia', () => {
  const url = whatsappUrl('34600000000', 'Hola,\n\nGràcies, señor ã ·');
  assert.doesNotMatch(url, /[\s\n]/);
  assert.equal(wa(url), 'Hola,\n\nGràcies, señor ã ·');
  const m = mailtoUrl('info@thesilentfleet.com', 'Distribució · Saló', 'Línia 1\n\nLínia 2');
  assert.equal(mail(m).get('subject'), 'Distribució · Saló');
  assert.equal(mail(m).get('body'), 'Línia 1\n\nLínia 2');
});
test('sense dades de sessió: els 12 missatges de sempre (4 idiomes × perfil buit, distribuidor, particular)', () => {
  for (const lang of CONFIG.languages) for (const profile of ['', 'distribuidor', 'particular']) {
    const d = DICT[lang];
    const m = d.messages[profile || 'none'];
    const { whatsapp, email } = contactLinks(CONFIG, d, { profile });
    assert.equal(wa(whatsapp), `${d.greeting}\n\n${m.text}`, `${lang}/${profile}`);
    assert.equal(mail(email).get('subject'), m.subject);
    assert.equal(mail(email).get('body'), `${d.greeting}\n\n${m.text}\n\n${d.closing}`);
  }
});
test('sense cap argument de sessió, o amb perfil desconegut, cau al missatge genèric', () => {
  assert.equal(whatsappText(DICT.es), `${DICT.es.greeting}\n\n${DICT.es.messages.none.text}`);
  assert.equal(whatsappText(DICT.es, { profile: 'inventat' }), whatsappText(DICT.es));
});
test('amb dades de sessió: nom, producte i embarcació van entre el text i el comiat', () => {
  const session = { profile: 'particular', name: 'Ana', product: 'Modelo A', hasBoat: 'Sí' };
  const d = DICT.es;
  const lines = 'Me llamo Ana.\nProducto de interés: Modelo A\nTengo embarcación: Sí';
  assert.equal(whatsappText(d, session), `${d.greeting}\n\n${d.messages.particular.text}\n\n${lines}`);
  assert.equal(emailBody(d, session), `${d.greeting}\n\n${d.messages.particular.text}\n\n${lines}\n\n${d.closing}`);
});
test('les línies que no tenen valor no apareixen', () => {
  assert.equal(whatsappText(DICT.ca, { product: 'Modelo A' }), `${DICT.ca.greeting}\n\n${DICT.ca.messages.none.text}\n\nProducte d'interès: Modelo A`);
});
test('un nom amb símbols arriba intacte als dos canals', () => {
  const name = 'Ana & "Joe" ñ 😀 $& {value}';
  const { whatsapp, email } = contactLinks(CONFIG, DICT.es, { name });
  assert.ok(wa(whatsapp).includes(`Me llamo ${name}.`));
  assert.ok(mail(email).get('body').includes(`Me llamo ${name}.`));
});
test('el número de config es normalitza a l\'enllaç', () => {
  const { whatsapp } = contactLinks({ ...CONFIG, whatsappNumber: '+34 600-00 00 00' }, DICT.es, {});
  assert.match(whatsapp, /^https:\/\/wa\.me\/34600000000\?/);
});
test('cada idioma té les tres línies de dades amb {value}', () => {
  for (const lang of CONFIG.languages) for (const key of ['name', 'product', 'boat'])
    assert.match(DICT[lang].messageContext[key], /\{value\}/, `${lang}.${key}`);
});
```

- [ ] **Step 2: Veure'ls fallar.** Run: `node --test tests/form-session.test.mjs tests/messages.test.mjs 2>&1 | grep -E "^# (pass|fail)"` → Expected: fallen.

- [ ] **Step 3: Implementar**

```js
// site/js/form/session.js
import { ADVICE, MAX, clip } from './model.js';

// «Profesional» del formulari fa servir el missatge «distribuidor» (decisió oberta amb Bruno).
const MESSAGE_PROFILE = { profesional: 'distribuidor', particular: 'particular' };
const BOAT_ANSWER = { si: 'yes', no: 'no' };

// Dades de la sessió en l'idioma actual, preparades per als missatges de WhatsApp i correu.
export function toSession(values, { products, dict }) {
  const product = values.product === ADVICE ? dict.form.productAdvice : products.find((p) => p.id === values.product)?.name;
  const boat = BOAT_ANSWER[values.hasBoat];
  return {
    profile: MESSAGE_PROFILE[values.profile] ?? '',
    product: product ?? '',
    hasBoat: boat ? dict.form[boat] : '',
    name: clip(values.name, MAX.name),
  };
}
```

```js
// site/js/messages.js
export function normalizeNumber(raw) {
  return String(raw).replace(/\D/g, '').replace(/^00/, '');
}

export function whatsappUrl(number, text) {
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

export function mailtoUrl(email, subject, body) {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

// Un perfil desconegut o absent cau al missatge genèric.
const messageFor = (dict, profile) => (Object.hasOwn(dict.messages, profile) ? dict.messages[profile] : dict.messages.none);
const fill = (template, value) => template.replace('{value}', () => value);

// Línies amb el que el visitant ja ha donat a la sessió; les buides no hi surten.
function contextLines(dict, { name, product, hasBoat } = {}) {
  return [
    name && fill(dict.messageContext.name, name),
    product && fill(dict.messageContext.product, product),
    hasBoat && fill(dict.messageContext.boat, hasBoat),
  ].filter(Boolean);
}

const block = (lines) => (lines.length ? [lines.join('\n')] : []);

export function whatsappText(dict, session = {}) {
  return [dict.greeting, messageFor(dict, session.profile).text, ...block(contextLines(dict, session))].join('\n\n');
}

export function emailBody(dict, session = {}) {
  return [dict.greeting, messageFor(dict, session.profile).text, ...block(contextLines(dict, session)), dict.closing].join('\n\n');
}

export function contactLinks(config, dict, session = {}) {
  return {
    whatsapp: whatsappUrl(normalizeNumber(config.whatsappNumber), whatsappText(dict, session)),
    email: mailtoUrl(config.email, messageFor(dict, session.profile).subject, emailBody(dict, session)),
  };
}
```

A `site/js/i18n.js`, dins de cada idioma de `PAGE` (al mateix nivell que `messages`), afegir:

```js
// es
messageContext: { name: 'Me llamo {value}.', product: 'Producto de interés: {value}', boat: 'Tengo embarcación: {value}' },
// ca
messageContext: { name: 'Em dic {value}.', product: 'Producte d\'interès: {value}', boat: 'Tinc embarcació: {value}' },
// pt
messageContext: { name: 'Chamo-me {value}.', product: 'Produto de interesse: {value}', boat: 'Tenho embarcação: {value}' },
// en
messageContext: { name: 'My name is {value}.', product: 'Product of interest: {value}', boat: 'I own a boat: {value}' },
```

A `scripts/export-texts.mjs`: (a) a les crides de la secció de missatges, passar objecte: `whatsappText(d, { profile: key })` i `emailBody(d, { profile: key })`; (b) després del bucle de perfils de cada idioma, afegir un exemple amb dades de sessió: dins del `for (const lang …)`, abans de `out.push('')` final del bucle, afegir

```js
    const example = { profile: 'particular', name: 'Ana', product: 'Modelo A', hasBoat: d.form.yes };
    out.push(`| Particular amb dades de sessió (exemple) | WhatsApp | — | ${cell(whatsappText(d, example))} |`);
    out.push(`| Particular amb dades de sessió (exemple) | Correu | ${cell(d.messages.particular.subject)} | ${cell(emailBody(d, example))} |`);
```

i a la llista de punts de «## Missatges», afegir la línia `'- **Dades de la sessió:** si el visitant ja ha donat el nom, el producte o si té embarcació, es nota en una línia entre el text i el comiat; les que no té no hi surten.',`.

- [ ] **Step 4: Passar.** Run: `node --test tests/form-session.test.mjs tests/messages.test.mjs 2>&1 | grep -E "^# (pass|fail)"` → Expected: `# fail 0`. Després `npm run texts` per regenerar `docs/textos-contacte.md`.

- [ ] **Step 5: Commit**

```bash
git add site/js/form/session.js site/js/messages.js site/js/i18n.js scripts/export-texts.mjs docs/textos-contacte.md tests/form-session.test.mjs tests/messages.test.mjs
git commit -m "feat: WhatsApp i correu porten les dades de la sessió" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 4: Literals del nou flux (4 idiomes)

**Files:**
- Modify: `site/js/i18n-form.js` (substituir sencer), `site/js/privacy-text.js` (sense canvis; només es comprova)
- Test: `tests/form-i18n.test.mjs` (substituir)

**Interfaces:**
- Produces: `FORM[lang]` amb les claus: `entryTitle, entrySubtitle, entryCta, entryContactLabel, entryWhatsapp, entryEmail, stepOf, step1Title, step1Subtitle, productLegend, productAdvice, email, next, step2Title, step2Subtitle, name, phone, profileLegend, profiles{particular,profesional}, hasBoat, yes, no, consentBefore, consentLink, newsletter, submit, requiredNote, errors{required,productRequired,profileRequired,email,phone,privacy}, doneTitle, doneText, doneTextMail, doneOpen, doneHelp, doneHome, privacyText`. `stepOf` conté `{n}` i `{total}`.

- [ ] **Step 1: Test**

```js
// tests/form-i18n.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../site/js/config.js';
import { DICT } from '../site/js/i18n.js';
import { PROFILES } from '../site/js/form/model.js';

const ERROR_CODES = ['required', 'productRequired', 'profileRequired', 'email', 'phone', 'privacy'];
const leaves = (o) => Object.values(o).flatMap((v) => (typeof v === 'object' ? leaves(v) : [v]));

test('cada idioma té una etiqueta per a cada perfil i un missatge per a cada codi d\'error', () => {
  for (const l of CONFIG.languages) {
    assert.deepEqual(Object.keys(DICT[l].form.profiles).sort(), [...PROFILES].sort(), l);
    assert.deepEqual(Object.keys(DICT[l].form.errors).sort(), [...ERROR_CODES].sort(), l);
  }
});
test('ja no queden claus de la perfilació antiga', () => {
  for (const l of CONFIG.languages) for (const key of ['activity', 'activities', 'hasElectric', 'investing', 'demo', 'profilingTitle', 'pendingTitle'])
    assert.equal(Object.hasOwn(DICT[l].form, key), false, `${l}.${key}`);
});
test('l\'indicador de pas té {n} i {total}', () => {
  for (const l of CONFIG.languages) assert.match(DICT[l].form.stepOf, /\{n\}.*\{total\}/, l);
});
test('el text de privacitat de l\'Extra 1: responsable, correu, WhatsApp, el correu parcial, i no diu que no es guarden dades', () => {
  for (const l of CONFIG.languages) {
    const text = DICT[l].form.privacyText;
    assert.match(text, /\{responsable\}/, l);
    assert.match(text, /\{email\}/, l);
    assert.match(text, /WhatsApp/, l);
    assert.doesNotMatch(text, /no guarda|no desa|não guarda|not store|does not store/i, l);
  }
});
test('el text de privacitat avisa que el correu es desa al pas 1 encara que no s\'acabi', () => {
  const expect = { es: /aunque no (llegues|lo termines)/, ca: /encara que no (arribis|l'acabis)/, pt: /mesmo que não (chegues|termines)/, en: /even if you do not (finish|complete)/ };
  for (const l of CONFIG.languages) assert.match(DICT[l].form.privacyText, expect[l], l);
});
test('portuguès: tracte proper (tu), «e-mail» i no «correio», a tots els literals visibles', () => {
  const formal = /\b(Diga|Escreva|Pode|Podem|Contacte|Introduza|Preencha|Escolha)\b|Quem é\?|\b(seu|sua|seus|suas|lhe)\b/i;
  const { messages, ...ui } = DICT.pt;
  for (const s of leaves(ui)) { assert.doesNotMatch(s, formal, s); assert.doesNotMatch(s, /correio/, s); }
});
test('cap literal porta marques d\'obligatorietat escrites al final (el component les afegeix)', () => {
  for (const l of CONFIG.languages) for (const s of leaves(DICT[l].form)) assert.doesNotMatch(s, /\*$/, s);
});
test('la nota de l\'asterisc comença per «* »', () => {
  for (const l of CONFIG.languages) assert.match(DICT[l].form.requiredNote, /^\* \S/, l);
});
test('els literals visibles no nomenen cap «PDF»', () => {
  for (const l of CONFIG.languages) for (const s of leaves(DICT[l].form)) assert.doesNotMatch(s, /PDF/, s);
});
test('el botó d\'entrada i el d\'enviament', () => {
  assert.deepEqual(CONFIG.languages.map((l) => DICT[l].form.entryCta), ['Descubrir la gama eléctrica', 'Descobrir la gamma elèctrica', 'Descobrir a gama elétrica', 'Discover the electric range']);
  assert.deepEqual(CONFIG.languages.map((l) => DICT[l].form.submit), ['Acceder a la ficha de la gama', 'Accedir a la fitxa de la gamma', 'Aceder à ficha da gama', 'Get the range sheet']);
});
test('la confirmació té una versió amb correu i una sense', () => {
  for (const l of CONFIG.languages) assert.notEqual(DICT[l].form.doneText, DICT[l].form.doneTextMail, l);
});
```

- [ ] **Step 2: Veure'l fallar.** Run: `node --test tests/form-i18n.test.mjs 2>&1 | grep -E "^# (pass|fail)"` → Expected: fallen.

- [ ] **Step 3: Substituir `site/js/i18n-form.js`**

```js
// Literals del flux de 2 passos de l'Extra 1. Tracte proper. El document es diu «ficha» fins que Bruno decideixi.
// Esborrany pendent de validar per Bruno (vegeu docs/textos-contacte.md).
export const FORM = {
  es: {
    entryTitle: 'Hablemos de propulsión eléctrica',
    entrySubtitle: 'Explora los modelos disponibles y consulta todas sus especificaciones técnicas.',
    entryCta: 'Descubrir la gama eléctrica',
    entryContactLabel: 'O escríbenos directamente',
    entryWhatsapp: 'Escribir por WhatsApp', entryEmail: 'Escribir por correo',
    stepOf: 'Paso {n} de {total}',
    requiredNote: '* Campo obligatorio',
    step1Title: 'Descubre la gama eléctrica',
    step1Subtitle: 'Dinos qué buscas para mostrarte las opciones ideales.',
    productLegend: 'Modelo o potencia de interés', productAdvice: 'No lo sé aún / Busco asesoramiento',
    email: 'Correo electrónico', next: 'Ver modelos disponibles',
    step2Title: 'Casi listo para ver la gama completa',
    step2Subtitle: 'Personalizamos la información según tu perfil para enviarte la propuesta adecuada.',
    name: 'Nombre', phone: 'Teléfono',
    profileLegend: '¿Quién eres?',
    profiles: { particular: 'Particular', profesional: 'Profesional' },
    hasBoat: '¿Tienes embarcación actualmente?',
    yes: 'Sí', no: 'No',
    consentBefore: 'Acepto la ', consentLink: 'política de privacidad',
    newsletter: 'Quiero recibir novedades (opcional)',
    submit: 'Acceder a la ficha de la gama',
    errors: {
      required: 'Completa este campo', productRequired: 'Elige una opción', profileRequired: 'Elige una opción',
      email: 'Introduce un correo válido', phone: 'Introduce un teléfono válido, por ejemplo +34 600 00 00 00',
      privacy: 'Acepta la política de privacidad para continuar',
    },
    doneTitle: 'Aquí tienes la gama eléctrica',
    doneText: 'Hemos abierto la ficha en tu navegador.',
    doneTextMail: 'Hemos abierto la ficha en tu navegador y te la hemos enviado por correo para que la consultes cuando quieras.',
    doneOpen: 'Abrir la ficha',
    doneHelp: '¿Tienes dudas sobre qué motor encaja en tu embarcación? Habla directamente con un especialista por WhatsApp.',
    doneHome: 'Volver al inicio',
    privacyText: 'Si usas el formulario, guardamos tu correo y el producto que te interesa en cuanto pasas al segundo paso, aunque no llegues a terminarlo; en ese caso constará que no has aceptado la política de privacidad. Si lo terminas, guardamos también tu nombre, teléfono, el idioma, tu perfil (particular o profesional) y, si lo indicas, si ya tienes embarcación. Los usamos para enviarte la ficha y contactarte sobre tu interés; si marcas la casilla de novedades, también para enviarte novedades. Responsable: {responsable}. Los datos se guardan en Google (Formularios y Hojas de cálculo), que actúa como encargado del tratamiento. Puedes pedirnos acceso, rectificación o supresión escribiendo a {email}. Si nos escribes por WhatsApp o por correo, usaremos tus datos solo para responderte.',
  },
  ca: {
    entryTitle: 'Parlem de propulsió elèctrica',
    entrySubtitle: 'Explora els models disponibles i consulta\'n totes les especificacions tècniques.',
    entryCta: 'Descobrir la gamma elèctrica',
    entryContactLabel: 'O escriu-nos directament',
    entryWhatsapp: 'Escriure per WhatsApp', entryEmail: 'Escriure per correu',
    stepOf: 'Pas {n} de {total}',
    requiredNote: '* Camp obligatori',
    step1Title: 'Descobreix la gamma elèctrica',
    step1Subtitle: 'Digue\'ns què busques per mostrar-te les opcions ideals.',
    productLegend: 'Model o potència d\'interès', productAdvice: 'Encara no ho sé / Busco assessorament',
    email: 'Correu electrònic', next: 'Veure els models disponibles',
    step2Title: 'Gairebé a punt per veure la gamma completa',
    step2Subtitle: 'Personalitzem la informació segons el teu perfil per enviar-te la proposta adequada.',
    name: 'Nom', phone: 'Telèfon',
    profileLegend: 'Qui ets?',
    profiles: { particular: 'Particular', profesional: 'Professional' },
    hasBoat: 'Tens una embarcació actualment?',
    yes: 'Sí', no: 'No',
    consentBefore: 'Accepto la ', consentLink: 'política de privacitat',
    newsletter: 'Vull rebre novetats (opcional)',
    submit: 'Accedir a la fitxa de la gamma',
    errors: {
      required: 'Omple aquest camp', productRequired: 'Tria una opció', profileRequired: 'Tria una opció',
      email: 'Introdueix un correu vàlid', phone: 'Introdueix un telèfon vàlid, per exemple +34 600 00 00 00',
      privacy: 'Accepta la política de privacitat per continuar',
    },
    doneTitle: 'Aquí tens la gamma elèctrica',
    doneText: 'Hem obert la fitxa al teu navegador.',
    doneTextMail: 'Hem obert la fitxa al teu navegador i te l\'hem enviada per correu perquè la consultis quan vulguis.',
    doneOpen: 'Obrir la fitxa',
    doneHelp: 'Tens dubtes sobre quin motor encaixa a la teva embarcació? Parla directament amb un especialista per WhatsApp.',
    doneHome: 'Tornar a l\'inici',
    privacyText: 'Si fas servir el formulari, desem el teu correu i el producte que t\'interessa tan bon punt passes al segon pas, encara que no arribis a acabar-lo; en aquest cas constarà que no has acceptat la política de privacitat. Si l\'acabes, desem també el teu nom, telèfon, l\'idioma, el teu perfil (particular o professional) i, si ho indiques, si ja tens embarcació. Els fem servir per enviar-te la fitxa i contactar-te sobre el teu interès; si marques la casella de novetats, també per enviar-te novetats. Responsable: {responsable}. Les dades es desen a Google (Formularis i Fulls de càlcul), que actua com a encarregat del tractament. Pots demanar-nos accés, rectificació o supressió escrivint a {email}. Si ens escrius per WhatsApp o per correu, farem servir les teves dades només per respondre\'t.',
  },
  pt: {
    entryTitle: 'Falemos de propulsão elétrica',
    entrySubtitle: 'Explora os modelos disponíveis e consulta todas as suas especificações técnicas.',
    entryCta: 'Descobrir a gama elétrica',
    entryContactLabel: 'Ou escreve-nos diretamente',
    entryWhatsapp: 'Escrever por WhatsApp', entryEmail: 'Escrever por e-mail',
    stepOf: 'Passo {n} de {total}',
    requiredNote: '* Campo obrigatório',
    step1Title: 'Descobre a gama elétrica',
    step1Subtitle: 'Diz-nos o que procuras para te mostrarmos as opções ideais.',
    productLegend: 'Modelo ou potência de interesse', productAdvice: 'Ainda não sei / Procuro aconselhamento',
    email: 'E-mail', next: 'Ver modelos disponíveis',
    step2Title: 'Quase pronto para ver a gama completa',
    step2Subtitle: 'Personalizamos a informação de acordo com o teu perfil para te enviarmos a proposta adequada.',
    name: 'Nome', phone: 'Telefone',
    profileLegend: 'Quem és?',
    profiles: { particular: 'Particular', profesional: 'Profissional' },
    hasBoat: 'Tens atualmente uma embarcação?',
    yes: 'Sim', no: 'Não',
    consentBefore: 'Aceito a ', consentLink: 'política de privacidade',
    newsletter: 'Quero receber novidades (opcional)',
    submit: 'Aceder à ficha da gama',
    errors: {
      required: 'Preenche este campo', productRequired: 'Escolhe uma opção', profileRequired: 'Escolhe uma opção',
      email: 'Introduz um e-mail válido', phone: 'Introduz um telefone válido, por exemplo +351 912 345 678',
      privacy: 'Aceita a política de privacidade para continuar',
    },
    doneTitle: 'Aqui tens a gama elétrica',
    doneText: 'Abrimos a ficha no teu navegador.',
    doneTextMail: 'Abrimos a ficha no teu navegador e enviámo-la por e-mail para a consultares quando quiseres.',
    doneOpen: 'Abrir a ficha',
    doneHelp: 'Tens dúvidas sobre que motor se adapta à tua embarcação? Fala diretamente com um especialista por WhatsApp.',
    doneHome: 'Voltar ao início',
    privacyText: 'Se usares o formulário, guardamos o teu e-mail e o produto que te interessa assim que passas ao segundo passo, mesmo que não chegues a terminá-lo; nesse caso ficará registado que não aceitaste a política de privacidade. Se o terminares, guardamos também o teu nome, telefone, o idioma, o teu perfil (particular ou profissional) e, se o indicares, se já tens embarcação. Usamos estes dados para te enviar a ficha e contactar-te sobre o teu interesse; se marcares a caixa de novidades, também para te enviar novidades. Responsável: {responsable}. Os dados ficam guardados na Google (Formulários e Folhas de cálculo), que atua como subcontratante. Podes pedir-nos acesso, retificação ou apagamento escrevendo para {email}. Se nos escreveres por WhatsApp ou por e-mail, usaremos os teus dados apenas para te responder.',
  },
  en: {
    entryTitle: 'Let\'s talk about electric propulsion',
    entrySubtitle: 'Explore the available models and see all their technical specifications.',
    entryCta: 'Discover the electric range',
    entryContactLabel: 'Or write to us directly',
    entryWhatsapp: 'Message us on WhatsApp', entryEmail: 'Email us',
    stepOf: 'Step {n} of {total}',
    requiredNote: '* Required field',
    step1Title: 'Discover the electric range',
    step1Subtitle: 'Tell us what you are looking for and we will show you the right options.',
    productLegend: 'Model or power of interest', productAdvice: 'Not sure yet / I need advice',
    email: 'Email', next: 'See available models',
    step2Title: 'Almost ready to see the full range',
    step2Subtitle: 'We tailor the information to your profile so we can send you the right proposal.',
    name: 'Name', phone: 'Phone',
    profileLegend: 'Who are you?',
    profiles: { particular: 'Private customer', profesional: 'Professional' },
    hasBoat: 'Do you currently own a boat?',
    yes: 'Yes', no: 'No',
    consentBefore: 'I accept the ', consentLink: 'privacy policy',
    newsletter: 'I\'d like to receive updates (optional)',
    submit: 'Get the range sheet',
    errors: {
      required: 'Fill in this field', productRequired: 'Choose an option', profileRequired: 'Choose an option',
      email: 'Enter a valid email', phone: 'Enter a valid phone number, for example +34 600 00 00 00',
      privacy: 'Accept the privacy policy to continue',
    },
    doneTitle: 'Here is the electric range',
    doneText: 'We have opened the sheet in your browser.',
    doneTextMail: 'We have opened the sheet in your browser and emailed it to you to read whenever you like.',
    doneOpen: 'Open the sheet',
    doneHelp: 'Not sure which motor fits your boat? Talk to a specialist directly on WhatsApp.',
    doneHome: 'Back to start',
    privacyText: 'If you use the form, we store your email and the product you are interested in as soon as you move to the second step, even if you do not finish it; in that case it will be recorded that you have not accepted the privacy policy. If you finish it, we also store your name, phone, language, your profile (private customer or professional) and, if you tell us, whether you already own a boat. We use this to send you the product sheet and contact you about your interest; if you tick the updates box, also to send you updates. Controller: {responsable}. The data is stored with Google (Forms and Sheets), which acts as data processor. You can ask us for access, correction or deletion by writing to {email}. If you write to us by WhatsApp or email, we will use your details only to reply.',
  },
};
```

- [ ] **Step 4: Passar.** Run: `node --test tests/form-i18n.test.mjs tests/i18n.test.mjs tests/privacy-text.test.mjs 2>&1 | grep -E "^# (pass|fail)"` → Expected: `# fail 0`. (`tests/ui.test.mjs` i `tests/texts-doc.test.mjs` fallaran fins a la Task 6; `npm run texts` es torna a executar a la Task 8.)

- [ ] **Step 5: Commit**

```bash
git add site/js/i18n-form.js tests/form-i18n.test.mjs
git commit -m "feat: literals del flux de 2 passos en 4 idiomes" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 5: Indicador de pas (impeccable)

Aquest és el disseny de l'indicador, decidit amb l'enfocament d'impeccable per a una **extensió d'una superfície existent**: hereta el món del sistema, sense torneig de conceptes i sense canviar `DESIGN.md` més que per documentar el component.

**Decisió de disseny (contracte):**
- **Què diu:** el text visible «Paso 1 de 2» (la informació essencial és el text) i, a sota, un traç de dos segments. Cap percentatge.
- **Forma:** dos segments iguals de 4 px d'alçada amb extrems de píndola (`--radius-pill`), separats per `--space-1`. Plens: `--action` (negre en clar, blanc en fosc). Buits: `--border-strong`. El segment del pas actual i els anteriors estan plens (pas 1 = 50 %, pas 2 = 100 %).
- **On:** a dalt de la pantalla, sota la capçalera, sobre el títol; ocupa l'ample de la columna. Una sola línia de text `caption` en `--text-muted`.
- **Moviment:** només el canvi de color del segment (200 ms), dins `prefers-reduced-motion: no-preference`; sense reduir-lo, l'estat es veu igual (el canvi és instantani).
- **Accessibilitat:** el traç és `role="progressbar"` amb `aria-valuemin/max/now`, `aria-valuetext` i `aria-label` amb el mateix text que veu l'usuari. Els segments no tenen text.
- **Prohibit:** gradients, ombres, animació d'amplada, percentatges, un cercle de progrés.

**Files:**
- Create: `site/js/form/steps.js`, `site/js/ui/step-indicator.js`
- Modify: `site/css/page.css`
- Test: `tests/form-steps.test.mjs` (nou), `tests/ui-steps.test.mjs` (nou; aquí només l'indicador, la resta d'UI s'hi afegeix a la Task 6), `tests/css.test.mjs` (afegir)

**Interfaces:**
- Produces: `stepLabel(template, n, total) -> string`; `createStepIndicator({ h }) -> ({ step, total, label }) -> element`.

- [ ] **Step 1: Tests**

```js
// tests/form-steps.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { stepLabel } from '../site/js/form/steps.js';

test('stepLabel omple {n} i {total}', () => {
  assert.equal(stepLabel('Paso {n} de {total}', 1, 2), 'Paso 1 de 2');
  assert.equal(stepLabel('Step {n} of {total}', 2, 2), 'Step 2 of 2');
});
```

```js
// tests/ui-steps.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { h, byType, findAll, textOf } from './helpers/fake-react.mjs';
import { createStepIndicator } from '../site/js/ui/step-indicator.js';

const StepIndicator = createStepIndicator({ h });
const segments = (tree) => findAll(tree, (n) => n.type === 'span');
const track = (tree) => findAll(tree, (n) => n.props?.role === 'progressbar')[0];

test('indicador: text visible, barra amb valors i un nom accessible igual al text', () => {
  const tree = StepIndicator({ step: 1, total: 2, label: 'Paso 1 de 2' });
  assert.ok(textOf(tree).includes('Paso 1 de 2'));
  const bar = track(tree);
  assert.deepEqual(
    [bar.props['aria-valuemin'], bar.props['aria-valuemax'], bar.props['aria-valuenow'], bar.props['aria-valuetext'], bar.props['aria-label']],
    [1, 2, 1, 'Paso 1 de 2', 'Paso 1 de 2'],
  );
});
test('indicador: pas 1 = un segment ple; pas 2 = els dos plens', () => {
  const on = (step) => segments(StepIndicator({ step, total: 2, label: 'x' })).filter((s) => s.props.className.includes('steps__seg--on')).length;
  assert.deepEqual([on(1), on(2)], [1, 2]);
});
test('indicador: els segments no porten text (el text és el de l\'etiqueta)', () => {
  for (const s of segments(StepIndicator({ step: 1, total: 2, label: 'x' }))) assert.equal(textOf(s), '');
});
```

Afegir a `tests/css.test.mjs`:

```js
test('page.css: el moviment de l\'indicador i de les pantalles té guarda de reduced-motion', () => {
  for (const selector of ['.steps__seg', 'screen-in']) {
    const at = page.indexOf(selector);
    assert.ok(at >= 0, selector);
  }
  const motion = [...page.matchAll(/@media \(prefers-reduced-motion: no-preference\) \{([\s\S]*?)\n\}/g)].map((m) => m[1]).join('\n');
  assert.match(motion, /\.steps__seg[^{]*\{[^}]*transition/);
  assert.match(motion, /animation:\s*screen-in/);
  assert.doesNotMatch(page.replace(/@media \(prefers-reduced-motion: no-preference\) \{[\s\S]*?\n\}/g, ''), /(^|\s)(transition|animation):/);
});
```

- [ ] **Step 2: Veure'ls fallar.** Run: `node --test tests/form-steps.test.mjs tests/ui-steps.test.mjs tests/css.test.mjs 2>&1 | grep -E "^# (pass|fail)"` → Expected: fallen.

- [ ] **Step 3: Implementar**

```js
// site/js/form/steps.js
export const stepLabel = (template, n, total) => template.replace('{n}', String(n)).replace('{total}', String(total));
```

```js
// site/js/ui/step-indicator.js
// Indicador de pas: el text és la informació; la barra de segments l'acompanya i és un progressbar accessible.
export function createStepIndicator({ h }) {
  return function StepIndicator({ step, total, label }) {
    const segments = Array.from({ length: total }, (_, i) =>
      h('span', { key: i, className: i < step ? 'steps__seg steps__seg--on' : 'steps__seg' }));
    return h('div', { className: 'steps' },
      h('p', { className: 'caption steps__label' }, label),
      h('div', {
        className: 'steps__track', role: 'progressbar',
        'aria-valuemin': 1, 'aria-valuemax': total, 'aria-valuenow': step, 'aria-valuetext': label, 'aria-label': label,
      }, ...segments));
  };
}
```

Afegir al final de `site/css/page.css` (abans del bloc `@media (min-width: 768px)` si hi cal mantenir l'ordre; l'ordre no afecta):

```css
.steps { display: flex; flex-direction: column; gap: var(--space-2); }
.steps__label { margin: 0; color: var(--text-muted); }
.steps__track { display: grid; grid-auto-flow: column; grid-auto-columns: 1fr; gap: var(--space-1); }
.steps__seg { height: var(--space-1); border-radius: var(--radius-pill); background: var(--border-strong); }
.steps__seg--on { background: var(--action); }
.page__heading:focus { outline: none; }

@keyframes screen-in { from { opacity: 0; transform: translateY(var(--space-2)); } }
@media (prefers-reduced-motion: no-preference) {
  .steps__seg { transition: background-color 200ms ease-out; }
  .page__screen { animation: screen-in 180ms ease-out; }
}
```

- [ ] **Step 4: Passar.** Run: `node --test tests/form-steps.test.mjs tests/ui-steps.test.mjs tests/css.test.mjs 2>&1 | grep -E "^# (pass|fail)"` → Expected: `# fail 0`.

- [ ] **Step 5: Commit**

```bash
git add site/js/form/steps.js site/js/ui/step-indicator.js site/css/page.css tests/form-steps.test.mjs tests/ui-steps.test.mjs tests/css.test.mjs
git commit -m "feat: indicador de pas accessible amb barra de segments" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 6: Pantalles (entrada, pas 1, pas 2, confirmació)

**Files:**
- Create: `site/js/ui/fields.js`, `site/js/ui/step-product.js`, `site/js/ui/step-contact.js`, `site/js/ui/done-screen.js`
- Modify: `site/js/ui/entry-screen.js`
- Delete: `site/js/ui/form-screen.js`
- Test: `tests/ui-steps.test.mjs` (ampliar), `tests/ui.test.mjs` (treure els tests del formulari antic i de l'entrada d'Extra 1 antiga)

**Interfaces:**
- Consumes: `createStepIndicator` (Task 5), `stepLabel`, `deselectProps` (`chips.js`), `ADVICE`/`PROFILES` (Task 1), literals de la Task 4.
- Produces:
  - `makeFields({ h, T, f, values, errors, onChange }) -> { text(field, label, extra), chips(field, legend, options, { required }) }`. `chips` posa ` *` al `legend` si és obligatori, mostra l'error amb `role="alert"` i el prefix `! `, i fa el grup desmarcable només si no és obligatori.
  - `createStepProduct({ h, T }) -> StepProduct({ t, products, values, errors, onChange, onNext, onBack, onKeyDown })`.
  - `createStepContact({ h, T }) -> StepContact({ t, values, errors, onChange, onSubmit, onBack, onKeyDown, privacyHref })`.
  - `createDoneScreen({ h, T, icon }) -> DoneScreen({ t, emailDelivery, dossierUrl, whatsappHref, onHome })`.
  - `createEntryScreen({ h, T, icon }) -> EntryScreen({ t, links, email, profile, onProfile, onClearProfile, legalQuery, onOpenForm })`: amb `onOpenForm` (Extra 1) mostra `entryTitle/entrySubtitle`, el CTA, **cap xip de perfil**, i els botons `entryWhatsapp/entryEmail`; sense ell és l'MVP intacte.
  - Totes les pantalles de pas porten un contenidor `div.page__heading` amb `tabIndex: -1` i `data-step-heading: ''` que envolta el `SectionHeading` (focus en canviar de pantalla).

- [ ] **Step 1: Comprovar que el `Button` del sistema reenvia `target` i `rel`**

Run: `grep -n "target\|rel\|\.\.\.rest\|href" the-silent-fleet-ds/components/Button/*.jsx the-silent-fleet-ds/components/Button/*.js 2>/dev/null | head; ls the-silent-fleet-ds/components | head -30`
Expected: es veu si `Button` reenvia atributs a l'`<a>`. **Si no els reenvia**, a `done-screen.js` el botó d'obrir la ficha s'implementa com `onClick: () => window.open(dossierUrl, '_blank', 'noopener')` en lloc de `href` (el test de l'Step 2 fixa només `textOf(...)` i que el primer botó és el principal, no el mecanisme).

- [ ] **Step 2: Tests (afegir a `tests/ui-steps.test.mjs`; a dalt, ampliar els imports)**

```js
import { DICT } from '../site/js/i18n.js';
import { CONFIG } from '../site/js/config.js';
import { emptyForm } from '../site/js/form/model.js';
import { icon } from '../site/js/icons.js';
import { T, byName } from './helpers/fake-react.mjs';
import { createEntryScreen } from '../site/js/ui/entry-screen.js';
import { createStepProduct } from '../site/js/ui/step-product.js';
import { createStepContact } from '../site/js/ui/step-contact.js';
import { createDoneScreen } from '../site/js/ui/done-screen.js';

const noop = () => {};
const EntryScreen = createEntryScreen({ h, T, icon });
const StepProduct = createStepProduct({ h, T });
const StepContact = createStepContact({ h, T });
const DoneScreen = createDoneScreen({ h, T, icon });
const buttons = (tree) => byType(tree, 'T.Button');
const deselectable = (tree) => findAll(tree, (n) => n.type === 'div' && typeof n.props.onClick === 'function' && typeof n.props.onKeyDown === 'function');
const entry = (extra = {}) => EntryScreen({
  t: DICT.es, links: { whatsapp: 'wa', email: 'mail' }, email: CONFIG.email, profile: '', onProfile: noop, onClearProfile: noop, legalQuery: '?lang=es', ...extra,
});
const product = (extra = {}) => StepProduct({
  t: DICT.es, products: CONFIG.products, values: emptyForm(), errors: {}, onChange: noop, onNext: noop, onBack: noop, ...extra,
});
const contact = (extra = {}) => StepContact({
  t: DICT.es, values: emptyForm(), errors: {}, onChange: noop, onSubmit: noop, onBack: noop, privacyHref: 'privacy.html?lang=es#privacy', ...extra,
});

test('entrada amb Extra 1: títol nou, CTA únic principal, WhatsApp i correu secundaris amb text nou, cap xip de perfil', () => {
  const tree = entry({ onOpenForm: noop });
  const [cta, wa, mail] = buttons(tree);
  assert.equal(byType(tree, 'T.SectionHeading')[0].props.title, DICT.es.form.entryTitle);
  assert.equal(byType(tree, 'T.SectionHeading')[0].props.subtitle, DICT.es.form.entrySubtitle);
  assert.deepEqual([textOf(cta), cta.props.variant, cta.props.onClick], [DICT.es.form.entryCta, undefined, noop]);
  assert.deepEqual([textOf(wa), wa.props.variant, textOf(mail), mail.props.variant], [DICT.es.form.entryWhatsapp, 'outline', DICT.es.form.entryEmail, 'outline']);
  assert.equal(byType(tree, 'T.ChoiceChips').length, 0);
  assert.equal(buttons(tree).length, 3);
});
test('entrada sense Extra 1: l\'MVP intacte (xips de perfil, WhatsApp principal)', () => {
  const tree = entry();
  assert.equal(byType(tree, 'T.ChoiceChips').length, 1);
  assert.equal(buttons(tree)[0].props.variant, undefined);
  assert.equal(buttons(tree).length, 2);
});
test('pas 1: indicador 1 de 2, xips de producte obligatoris amb l\'opció d\'assessorament al final, correu tipus email', () => {
  const tree = product();
  assert.equal(findAll(tree, (n) => n.props?.role === 'progressbar')[0].props['aria-valuenow'], 1);
  assert.ok(textOf(tree).includes('Paso 1 de 2'));
  const [chips] = byName(tree, 'product');
  assert.equal(chips.type, 'T.ChoiceChips');
  assert.equal(chips.props.legend, `${DICT.es.form.productLegend} *`);
  const labels = chips.props.options.map((o) => o.label);
  assert.deepEqual(labels, [...CONFIG.products.map((p) => p.name), DICT.es.form.productAdvice]);
  assert.equal(chips.props.options.at(-1).value, 'asesoramiento');
  const [email] = byName(tree, 'email');
  assert.deepEqual([email.props.type, email.props.required], ['email', true]);
  assert.equal(deselectable(tree).length, 0, 'els xips obligatoris no es poden desmarcar');
});
test('pas 1: nota de l\'asterisc, botó «Ver modelos disponibles →» i «← Volver»', () => {
  const [next, back] = buttons(product());
  assert.ok(textOf(product()).includes(DICT.es.form.requiredNote));
  assert.deepEqual([next.props.type, next.props.full, textOf(next)], ['submit', true, 'Ver modelos disponibles →']);
  assert.deepEqual([back.props.variant, textOf(back)], ['link', '← Volver']);
});
test('pas 1: els errors es veuen abans de seguir (xips amb alerta, correu amb error)', () => {
  const tree = product({ errors: { product: 'productRequired', email: 'email' } });
  const alerts = findAll(tree, (n) => n.props?.role === 'alert');
  assert.deepEqual(alerts.map(textOf), ['! Elige una opción']);
  assert.equal(byName(tree, 'email')[0].props.error, DICT.es.form.errors.email);
});
test('pas 1: Intro envia el pas, no recarrega i crida onNext; onKeyDown arriba al formulari', () => {
  let called = 0;
  const onKeyDown = noop;
  const [formEl] = byType(product({ onNext: () => called++, onKeyDown }), 'form');
  const e = { preventDefault() { this.prevented = true; } };
  formEl.props.onSubmit(e);
  assert.deepEqual([e.prevented, called, formEl.props.onKeyDown, formEl.props.noValidate], [true, 1, onKeyDown, true]);
});
test('pas 1: el contenidor del títol rep el focus en entrar', () => {
  const [head] = findAll(product(), (n) => n.props?.['data-step-heading'] !== undefined);
  assert.deepEqual([head.props.tabIndex, head.props.className], [-1, 'page__heading']);
});
test('pas 2: indicador 2 de 2 i els camps en l\'ordre del brief', () => {
  const tree = contact();
  assert.equal(findAll(tree, (n) => n.props?.role === 'progressbar')[0].props['aria-valuenow'], 2);
  const order = findAll(tree, (n) => ['T.Field', 'T.ChoiceChips', 'T.Checkbox'].includes(n.type)).map((n) => n.props.name);
  assert.deepEqual(order, ['name', 'profile', 'phone', 'hasBoat', 'privacy', 'newsletter']);
});
test('pas 2: nom i telèfon obligatoris (tel), perfil obligatori no desmarcable, embarcació opcional desmarcable', () => {
  const tree = contact();
  assert.deepEqual([byName(tree, 'name')[0].props.required, byName(tree, 'phone')[0].props.type, byName(tree, 'phone')[0].props.required], [true, 'tel', true]);
  assert.equal(byName(tree, 'profile')[0].props.legend, `${DICT.es.form.profileLegend} *`);
  assert.equal(byName(tree, 'hasBoat')[0].props.legend, DICT.es.form.hasBoat);
  assert.deepEqual(byName(tree, 'hasBoat')[0].props.options.map((o) => o.label), ['Sí', 'No']);
  assert.equal(deselectable(tree).length, 1);
});
test('pas 2: privacitat sense marcar amb enllaç a pestanya nova; novetats opcional', () => {
  const tree = contact();
  const [privacy] = byName(tree, 'privacy');
  assert.deepEqual([privacy.props.checked, privacy.props.required], [false, true]);
  const [link] = byType(privacy, 'a');
  assert.deepEqual([link.props.href, link.props.target, link.props.rel], ['privacy.html?lang=es#privacy', '_blank', 'noopener']);
  assert.ok(textOf(byName(tree, 'newsletter')[0]).includes('(opcional)'));
  assert.equal(byName(tree, 'newsletter')[0].props.required, undefined);
});
test('pas 2: botó final i «← Volver»; els errors de nom i perfil es veuen', () => {
  const tree = contact({ errors: { name: 'required', profile: 'profileRequired', privacy: 'privacy' } });
  const [submit, back] = buttons(tree);
  assert.deepEqual([submit.props.type, textOf(submit)], ['submit', 'Acceder a la ficha de la gama']);
  assert.deepEqual([back.props.variant, textOf(back)], ['link', '← Volver']);
  assert.equal(byName(tree, 'name')[0].props.error, DICT.es.form.errors.required);
  assert.deepEqual(findAll(tree, (n) => n.props?.role === 'alert').map(textOf), ['! Elige una opción']);
  assert.equal(byName(tree, 'privacy')[0].props.error, DICT.es.form.errors.privacy);
});
test('pas 2: enviar no recarrega i crida onSubmit', () => {
  let sent = 0;
  const [formEl] = byType(contact({ onSubmit: () => sent++ }), 'form');
  formEl.props.onSubmit({ preventDefault() {} });
  assert.equal(sent, 1);
});
test('confirmació: ficha, ajuda per WhatsApp amb l\'enllaç de la sessió i tornada a l\'inici', () => {
  let home = 0;
  const tree = DoneScreen({ t: DICT.es, emailDelivery: false, dossierUrl: 'dossier.pdf', whatsappHref: 'https://wa.me/1', onHome: () => home++ });
  const [open, wa, back] = buttons(tree);
  assert.equal(textOf(open), DICT.es.form.doneOpen);
  assert.equal(open.props.variant, undefined);
  assert.deepEqual([textOf(wa), wa.props.variant, wa.props.href], [DICT.es.form.entryWhatsapp, 'outline', 'https://wa.me/1']);
  assert.deepEqual([back.props.variant, textOf(back)], ['link', DICT.es.form.doneHome]);
  back.props.onClick();
  assert.equal(home, 1);
  assert.ok(textOf(tree).includes(DICT.es.form.doneTitle) || byType(tree, 'T.SectionHeading')[0].props.title === DICT.es.form.doneTitle);
  assert.ok(textOf(tree).includes(DICT.es.form.doneHelp));
});
test('confirmació: el subtítol parla del correu només si l\'enviament existeix', () => {
  const sub = (emailDelivery) => byType(DoneScreen({ t: DICT.es, emailDelivery, dossierUrl: 'd.pdf', whatsappHref: 'w', onHome: noop }), 'T.SectionHeading')[0].props.subtitle;
  assert.equal(sub(false), DICT.es.form.doneText);
  assert.equal(sub(true), DICT.es.form.doneTextMail);
});
```

A `tests/ui.test.mjs`: eliminar l'import de `form-screen.js` i la constant `FormScreen`/`form`, i **esborrar tots els tests** el títol dels quals comença per `formulari` i els dos de l'entrada d'Extra 1 antiga (`entrada amb Extra 1: el botó nou…`); conservar la capçalera, l'entrada sense Extra 1, la línia explicativa i el perfil desmarcable de l'MVP.

- [ ] **Step 3: Veure'ls fallar.** Run: `node --test tests/ui-steps.test.mjs 2>&1 | grep -E "^# (pass|fail)"` → Expected: fallen (els mòduls no existeixen).

- [ ] **Step 4: Implementar**

```js
// site/js/ui/fields.js
import { deselectProps } from '../chips.js';

// Camps comuns als dos passos: text amb error i xips amb error accessible.
export function makeFields({ h, T, f, values, errors, onChange }) {
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

  return { text, chips };
}
```

```js
// site/js/ui/step-product.js
import { ADVICE } from '../form/model.js';
import { stepLabel } from '../form/steps.js';
import { makeFields } from './fields.js';
import { createStepIndicator } from './step-indicator.js';

export function createStepProduct({ h, T }) {
  const StepIndicator = createStepIndicator({ h });
  return function StepProduct({ t, products, values, errors, onChange, onNext, onBack, onKeyDown }) {
    const f = t.form;
    const { text, chips } = makeFields({ h, T, f, values, errors, onChange });
    const options = [...products.map((p) => ({ value: p.id, label: p.name })), { value: ADVICE, label: f.productAdvice }];

    return h('div', { className: 'page__screen page__screen--form' },
      h(StepIndicator, { step: 1, total: 2, label: stepLabel(f.stepOf, 1, 2) }),
      h('div', { className: 'page__heading', tabIndex: -1, 'data-step-heading': '' },
        h(T.SectionHeading, { layout: 'mobile', align: 'start', level: 1, title: f.step1Title, subtitle: f.step1Subtitle, className: 'page__title' })),
      h('p', { className: 'body-sm page__note' }, f.requiredNote),
      h('form', { className: 'form', noValidate: true, onKeyDown, onSubmit: (e) => { e.preventDefault(); onNext(); } },
        h('div', { className: 'form__group' },
          chips('product', f.productLegend, options, { required: true }),
          text('email', f.email, { required: true, type: 'email' })),
        h('div', { className: 'form__actions' },
          h(T.Button, { type: 'submit', full: true }, `${f.next} →`),
          h(T.Button, { variant: 'link', onClick: onBack }, `← ${t.back}`))));
  };
}
```

```js
// site/js/ui/step-contact.js
import { PROFILES } from '../form/model.js';
import { stepLabel } from '../form/steps.js';
import { makeFields } from './fields.js';
import { createStepIndicator } from './step-indicator.js';

export function createStepContact({ h, T }) {
  const StepIndicator = createStepIndicator({ h });
  return function StepContact({ t, values, errors, onChange, onSubmit, onBack, onKeyDown, privacyHref }) {
    const f = t.form;
    const { text, chips } = makeFields({ h, T, f, values, errors, onChange });
    const error = (field) => (errors[field] ? f.errors[errors[field]] : undefined);
    const yesNo = [{ value: 'si', label: f.yes }, { value: 'no', label: f.no }];

    return h('div', { className: 'page__screen page__screen--form' },
      h(StepIndicator, { step: 2, total: 2, label: stepLabel(f.stepOf, 2, 2) }),
      h('div', { className: 'page__heading', tabIndex: -1, 'data-step-heading': '' },
        h(T.SectionHeading, { layout: 'mobile', align: 'start', level: 1, title: f.step2Title, subtitle: f.step2Subtitle, className: 'page__title' })),
      h('p', { className: 'body-sm page__note' }, f.requiredNote),
      h('form', { className: 'form', noValidate: true, onKeyDown, onSubmit: (e) => { e.preventDefault(); onSubmit(); } },
        h('div', { className: 'form__group' },
          text('name', f.name, { required: true }),
          chips('profile', f.profileLegend, PROFILES.map((p) => ({ value: p, label: f.profiles[p] })), { required: true }),
          text('phone', f.phone, { required: true, type: 'tel' }),
          chips('hasBoat', f.hasBoat, yesNo)),
        h('div', { className: 'form__group' },
          h(T.Checkbox, { name: 'privacy', id: 'privacy', required: true, checked: values.privacy, error: error('privacy'), onChange: (e) => onChange('privacy', e.target.checked) },
            // Un sol element: l'etiqueta del Checkbox és flex i, amb tres fills, es perdria l'espai abans de l'enllaç.
            h('span', null, f.consentBefore, h('a', { href: privacyHref, target: '_blank', rel: 'noopener' }, f.consentLink))),
          h(T.Checkbox, { name: 'newsletter', id: 'newsletter', checked: values.newsletter, onChange: (e) => onChange('newsletter', e.target.checked) }, f.newsletter)),
        h('div', { className: 'form__actions' },
          h(T.Button, { type: 'submit', full: true }, f.submit),
          h(T.Button, { variant: 'link', onClick: onBack }, `← ${t.back}`))));
  };
}
```

```js
// site/js/ui/done-screen.js
export function createDoneScreen({ h, T, icon }) {
  return function DoneScreen({ t, emailDelivery, dossierUrl, whatsappHref, onHome }) {
    const f = t.form;
    return h('div', { className: 'page__screen' },
      h('div', { className: 'page__heading', tabIndex: -1, 'data-step-heading': '' },
        h(T.SectionHeading, {
          layout: 'mobile', align: 'start', level: 1, title: f.doneTitle,
          subtitle: emailDelivery ? f.doneTextMail : f.doneText, className: 'page__title',
        })),
      // Pla B: si el navegador ha bloquejat l'obertura automàtica, aquest botó obre la ficha.
      h(T.Button, { full: true, href: dossierUrl, target: '_blank', rel: 'noopener' }, f.doneOpen),
      h('p', { className: 'body-sm page__note' }, f.doneHelp),
      h(T.Button, { full: true, variant: 'outline', href: whatsappHref }, icon(h, 'whatsapp'), f.entryWhatsapp),
      h(T.Button, { variant: 'link', onClick: onHome }, f.doneHome));
  };
}
```
(Si a l'Step 1 el `Button` no reenvia `target`/`rel`, canviar el primer botó per `onClick: () => window.open(dossierUrl, '_blank', 'noopener')` sense `href`.)

```js
// site/js/ui/entry-screen.js
import { deselectProps } from '../chips.js';

export function createEntryScreen({ h, T, icon }) {
  return function EntryScreen({ t, links, email, profile, onProfile, onClearProfile, legalQuery, onOpenForm }) {
    const withForm = typeof onOpenForm === 'function';
    const f = t.form;
    const heading = h(T.SectionHeading, {
      layout: 'mobile', align: 'start', level: 1, className: 'page__title',
      title: withForm ? f.entryTitle : t.title, subtitle: withForm ? f.entrySubtitle : t.subtitle,
    });
    return h('div', { className: 'page__screen' },
      h('div', { className: 'page__heading', tabIndex: -1, 'data-step-heading': '' }, heading),
      // El perfil només es pregunta a l'MVP; amb l'Extra 1 es demana al pas 2, perquè la primera decisió sigui un sol clic.
      withForm ? null : h('div', deselectProps(profile, onClearProfile),
        h(T.ChoiceChips, {
          legend: t.profileLegend, name: 'perfil', value: profile,
          options: [{ value: 'distribuidor', label: t.profileDistribuidor }, { value: 'particular', label: t.profileParticular }],
          onChange: (e) => onProfile(e.target.value),
        })),
      withForm ? h(T.Button, { full: true, onClick: onOpenForm }, f.entryCta) : null,
      h(T.SectionLabel, null, withForm ? f.entryContactLabel : t.contactLabel),
      h('div', { className: 'page__stack' },
        h(T.Button, { full: true, variant: withForm ? 'outline' : undefined, href: links.whatsapp }, icon(h, 'whatsapp'), withForm ? f.entryWhatsapp : t.whatsapp),
        h(T.Button, { full: true, variant: 'outline', href: links.email }, icon(h, 'mail'), withForm ? f.entryEmail : t.emailLabel),
        h('p', { className: 'body-sm page__note' }, t.contactHint),
        h('p', { className: 'body-sm page__note' }, `${t.contactFallback} `, h('span', { className: 'page__address' }, email))),
      h(T.LegalLinks, {
        label: t.legalNav,
        links: [{ label: t.privacy, href: `privacy.html${legalQuery}` }, { label: t.cookies, href: `privacy.html${legalQuery}#cookies` }],
      }));
  };
}
```
Esborrar `site/js/ui/form-screen.js` (`git rm`).

- [ ] **Step 5: Passar.** Run: `node --test tests/ui-steps.test.mjs tests/ui.test.mjs tests/chips.test.mjs 2>&1 | grep -E "^# (pass|fail)"` → Expected: `# fail 0`. Si algun test de l'entrada MVP de `ui.test.mjs` falla perquè ara hi ha un `div.page__heading` extra, ajustar-lo cercant per tipus (`byType`), no per posició.

- [ ] **Step 6: Commit**

```bash
git rm site/js/ui/form-screen.js
git add site/js/ui tests/ui.test.mjs tests/ui-steps.test.mjs
git commit -m "feat: pantalles del flux de 2 passos (entrada, pas 1, pas 2, confirmació)" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 7: Flux, focus, tecles, configuració i orquestració

**Files:**
- Modify: `site/js/form/flow.js`, `site/js/form/focus.js`, `site/js/form/hints.js`, `site/js/config.js`, `site/js/app.js`, `site/index.html`
- Create: `scripts/make-test-pdf.mjs`, `site/dossier-prova.pdf` (generat)
- Test: `tests/form-flow.test.mjs`, `tests/form-focus.test.mjs`, `tests/form-hints.test.mjs` (substituir/ampliar), `tests/config.test.mjs` (ampliar)

**Interfaces:**
- Consumes: Tasks 1–6.
- Produces:
  - `advanceStep1(values, deps) -> boolean` amb `deps = { products, search, lang, leadId, newId, setLeadId, setErrors, bumpAttempt, emitPartial, goTo }`.
  - `handleSubmit(values, deps) -> boolean` amb `deps = { products, search, lang, leadId, newId, dispatch, setErrors, setLeadId, setReceipt, bumpAttempt, openDocument, emitLead, goTo }`.
  - `focusStepHeading(doc) -> boolean`.
  - `FIELD_HINTS` i `NEXT_FIELD = { name: 'profile', phone: 'privacy' }`.
  - `CONFIG.dossierUrl = 'dossier-prova.pdf'`, `CONFIG.emailDelivery = false`.
  - Esdeveniments `window`: `tsf:lead-partial` (detail = lead parcial) i `tsf:lead` (detail = `{ contact, profiling, hasProfiling }`).

- [ ] **Step 1: Tests**

```js
// tests/form-flow.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { advanceStep1, handleSubmit } from '../site/js/form/flow.js';
import { emptyForm } from '../site/js/form/model.js';

const PRODUCTS = [{ id: 'model-a', name: 'Modelo A' }];
const step1 = { ...emptyForm({ product: 'model-a' }), email: 'Ana@Example.com' };
const full = { ...step1, name: 'Ana', profile: 'particular', phone: '+34 600 00 00 00', hasBoat: 'si', privacy: true };

const harness = (extra = {}, search = '?producto=model-a&o=tauleta') => {
  const calls = [];
  const rec = (name) => (...args) => calls.push([name, ...args]);
  return {
    calls,
    deps: {
      products: PRODUCTS, search, lang: 'es', leadId: '', newId: () => 'id-1',
      setLeadId: rec('setLeadId'), setErrors: rec('setErrors'), bumpAttempt: rec('bumpAttempt'), dispatch: rec('dispatch'),
      setReceipt: rec('setReceipt'), openDocument: rec('openDocument'), emitPartial: rec('emitPartial'), emitLead: rec('emitLead'), goTo: rec('goTo'),
      ...extra,
    },
  };
};
const names = (calls) => calls.map((c) => c[0]);
const call = (calls, name) => calls.find((c) => c[0] === name);

test('pas 1 vàlid: desa un id, emet el lead parcial amb privacy false i passa al pas 2', () => {
  const { calls, deps } = harness();
  assert.equal(advanceStep1(step1, deps), true);
  assert.deepEqual(call(calls, 'setLeadId'), ['setLeadId', 'id-1']);
  assert.deepEqual(call(calls, 'emitPartial')[1], {
    id: 'id-1', stage: 'step1', product: 'model-a', email: 'ana@example.com', privacy: false, lang: 'es', origin: 'tauleta',
  });
  assert.deepEqual(call(calls, 'goTo'), ['goTo', 'step2']);
  assert.deepEqual(call(calls, 'setErrors'), ['setErrors', {}]);
});
test('pas 1 invàlid: mostra els errors abans de seguir, no emet ni avança', () => {
  const { calls, deps } = harness();
  assert.equal(advanceStep1(emptyForm(), deps), false);
  assert.deepEqual(call(calls, 'setErrors')[1], { product: 'productRequired', email: 'required' });
  assert.deepEqual(names(calls), ['setErrors', 'bumpAttempt']);
});
test('tornar al pas 1 i avançar de nou reutilitza l\'id i emet el lead parcial actualitzat', () => {
  const { calls, deps } = harness({ leadId: 'id-0', newId: () => { throw new Error('no ha de crear un id nou'); } });
  advanceStep1({ ...step1, email: 'nou@example.com' }, deps);
  assert.equal(call(calls, 'emitPartial')[1].id, 'id-0');
  assert.equal(call(calls, 'emitPartial')[1].email, 'nou@example.com');
});
test('enviament final: obre el document PRIMER (dins el gest), després emet el lead i neteja per al següent visitant', () => {
  const { calls, deps } = harness({ leadId: 'id-0' });
  assert.equal(handleSubmit(full, deps), true);
  assert.equal(names(calls)[0], 'openDocument');
  const lead = call(calls, 'emitLead')[1];
  assert.deepEqual([lead.contact.id, lead.profiling.id, lead.contact.origin, lead.contact.privacy], ['id-0', 'id-0', 'tauleta', true]);
  assert.deepEqual(call(calls, 'setReceipt')[1], { product: 'model-a', profile: 'particular', hasBoat: 'si', name: 'Ana' });
  assert.deepEqual(call(calls, 'dispatch')[1], { type: 'reset', initial: { product: 'model-a' } });
  assert.deepEqual(call(calls, 'setLeadId'), ['setLeadId', '']);
  assert.deepEqual(call(calls, 'setErrors'), ['setErrors', {}]);
  assert.deepEqual(call(calls, 'goTo'), ['goTo', 'done']);
});
test('enviament final sense id previ en crea un', () => {
  const { calls, deps } = harness();
  handleSubmit(full, deps);
  assert.equal(call(calls, 'emitLead')[1].contact.id, 'id-1');
});
test('enviament final invàlid: errors, cap document, cap lead; torna al pas 2 si l\'error és del pas 2', () => {
  const { calls, deps } = harness();
  assert.equal(handleSubmit({ ...full, privacy: false }, deps), false);
  assert.deepEqual(call(calls, 'setErrors')[1], { privacy: 'privacy' });
  assert.deepEqual(call(calls, 'goTo'), ['goTo', 'step2']);
  assert.equal(names(calls).includes('openDocument') || names(calls).includes('emitLead'), false);
});
test('enviament final amb un error del pas 1 torna al pas 1', () => {
  const { calls, deps } = harness();
  handleSubmit({ ...full, email: '' }, deps);
  assert.deepEqual(call(calls, 'goTo'), ['goTo', 'step1']);
});
test('el reinici torna a preseleccionar el producte de la URL, o cap', () => {
  const withProduct = harness({}, '?producto=model-a');
  handleSubmit(full, withProduct.deps);
  assert.deepEqual(call(withProduct.calls, 'dispatch')[1].initial, { product: 'model-a' });
  const without = harness({}, '');
  handleSubmit(full, without.deps);
  assert.deepEqual(call(without.calls, 'dispatch')[1].initial, { product: '' });
});
```

```js
// afegir a tests/form-focus.test.mjs
import { focusStepHeading } from '../site/js/form/focus.js';

test('focusStepHeading dona el focus al contenidor del títol i diu si l\'ha trobat', () => {
  let focused = 0;
  const doc = { querySelector: (s) => (s === '[data-step-heading]' ? { focus: () => focused++ } : null) };
  assert.equal(focusStepHeading(doc), true);
  assert.equal(focused, 1);
  assert.equal(focusStepHeading({ querySelector: () => null }), false);
});
```

```js
// tests/form-hints.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { FIELD_HINTS, NEXT_FIELD, advanceOnEnter, applyFieldHints } from '../site/js/form/hints.js';

const fakeDoc = (names) => {
  const els = Object.fromEntries(names.map((n) => [n, { name: n, attrs: {}, focused: false, setAttribute(k, v) { this.attrs[k] = v; }, focus() { this.focused = true; } }]));
  return { els, querySelector: (sel) => els[sel.match(/name="(.+)"/)[1]] ?? null };
};
const enter = (name, extra = {}) => ({ key: 'Enter', target: { name, tagName: 'INPUT' }, preventDefault() { this.prevented = true; }, ...extra });

test('els camps de text porten autocompletat, teclat i tecla d\'Intro adequats', () => {
  assert.deepEqual(FIELD_HINTS.email, { autocomplete: 'email', inputmode: 'email', autocapitalize: 'none', spellcheck: 'false', enterkeyhint: 'go' });
  assert.deepEqual(FIELD_HINTS.name, { autocomplete: 'name', autocapitalize: 'words', enterkeyhint: 'next' });
  assert.deepEqual(FIELD_HINTS.phone, { autocomplete: 'tel', inputmode: 'tel', enterkeyhint: 'next' });
  assert.deepEqual(Object.keys(FIELD_HINTS).sort(), ['email', 'name', 'phone']);
});
test('applyFieldHints aplica els atributs als camps presents i compta els aplicats', () => {
  const doc = fakeDoc(['email']);
  assert.equal(applyFieldHints(doc), 1);
  assert.equal(doc.els.email.attrs.inputmode, 'email');
});
test('Intro avança: nom → perfil, telèfon → privacitat', () => {
  assert.deepEqual(NEXT_FIELD, { name: 'profile', phone: 'privacy' });
  const doc = fakeDoc(['profile', 'privacy']);
  const a = enter('name');
  assert.equal(advanceOnEnter(a, doc), true);
  assert.deepEqual([a.prevented, doc.els.profile.focused], [true, true]);
  assert.equal(advanceOnEnter(enter('phone'), doc), true);
  assert.equal(doc.els.privacy.focused, true);
});
test('Intro al correu no avança: envia el pas 1', () => {
  const e = enter('email');
  assert.equal(advanceOnEnter(e, fakeDoc([])), false);
  assert.equal(e.prevented, undefined);
});
test('altres tecles, altres elements o un destí que no existeix no fan res', () => {
  const doc = fakeDoc(['profile']);
  assert.equal(advanceOnEnter(enter('name', { key: 'a' }), doc), false);
  assert.equal(advanceOnEnter({ ...enter('name'), target: { name: 'name', tagName: 'SELECT' } }, doc), false);
  assert.equal(advanceOnEnter(enter('phone'), doc), false);
});
```

Afegir a `tests/config.test.mjs`:

```js
import { existsSync, readFileSync } from 'node:fs';
test('el document de prova existeix a site/ i és un PDF', () => {
  assert.equal(CONFIG.emailDelivery, false);
  assert.ok(existsSync(`site/${CONFIG.dossierUrl}`));
  const pdf = readFileSync(`site/${CONFIG.dossierUrl}`, 'latin1');
  assert.ok(pdf.startsWith('%PDF-') && pdf.trimEnd().endsWith('%%EOF'));
});
```
(si `config.test.mjs` ja importa `CONFIG`/`assert`, no duplicar els imports.)

- [ ] **Step 2: Veure'ls fallar.** Run: `node --test tests/form-flow.test.mjs tests/form-focus.test.mjs tests/form-hints.test.mjs tests/config.test.mjs 2>&1 | grep -E "^# (pass|fail)"` → Expected: fallen.

- [ ] **Step 3: Implementar**

```js
// site/js/form/flow.js
import { buildPartialLead, submitForm } from './lead.js';
import { resolveOrigin, resolveProduct } from './context.js';
import { STEP_FIELDS, firstErrorField, validateStep1 } from './validate.js';

// Pas 1: els errors es veuen abans de seguir. El correu es desa com a lead parcial (privacy: false) amb un id que
// es conserva si el visitant torna enrere i avança de nou.
export function advanceStep1(values, { products, search, lang, leadId, newId, setLeadId, setErrors, bumpAttempt, emitPartial, goTo }) {
  const errors = validateStep1(values, products);
  if (Object.keys(errors).length) {
    setErrors(errors);
    bumpAttempt();
    return false;
  }
  const id = leadId || newId();
  setLeadId(id);
  setErrors({});
  emitPartial(buildPartialLead(values, { id, lang, origin: resolveOrigin(search) }));
  goTo('step2');
  return true;
}

// El document s'obre abans de qualsevol altra cosa: el navegador només ho permet dins del gest de l'usuari.
// Un enviament vàlid deixa el formulari net per al següent visitant de la tauleta; la confirmació conserva
// només el que necessita per al WhatsApp (receipt).
export function handleSubmit(values, {
  products, search, lang, leadId, newId, dispatch, setErrors, setLeadId, setReceipt, bumpAttempt, openDocument, emitLead, goTo,
}) {
  const result = submitForm(values, { products, id: leadId || newId(), lang, origin: resolveOrigin(search) });
  if (result.errors) {
    setErrors(result.errors);
    bumpAttempt();
    goTo(STEP_FIELDS[1].includes(firstErrorField(result.errors)) ? 'step1' : 'step2');
    return false;
  }
  openDocument();
  emitLead(result.lead);
  setReceipt({ product: values.product, profile: values.profile, hasBoat: values.hasBoat, name: values.name });
  dispatch({ type: 'reset', initial: { product: resolveProduct(search, products) } });
  setErrors({});
  setLeadId('');
  goTo('done');
  return true;
}
```

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

// En canviar de pantalla el focus va al títol, perquè el lector de pantalla anunciï el pas nou.
export function focusStepHeading(doc) {
  const element = doc.querySelector('[data-step-heading]');
  if (!element) return false;
  element.focus();
  return true;
}
```

```js
// site/js/form/hints.js
// Ajustos de teclat i autocompletat dels <input> del formulari. Tokens d'autocomplete de l'estàndard HTML.
export const FIELD_HINTS = {
  name: { autocomplete: 'name', autocapitalize: 'words', enterkeyhint: 'next' },
  email: { autocomplete: 'email', inputmode: 'email', autocapitalize: 'none', spellcheck: 'false', enterkeyhint: 'go' },
  phone: { autocomplete: 'tel', inputmode: 'tel', enterkeyhint: 'next' },
};

export function applyFieldHints(doc, hints = FIELD_HINTS) {
  let applied = 0;
  for (const [field, attributes] of Object.entries(hints)) {
    const element = doc.querySelector(`[name="${field}"]`);
    if (!element) continue;
    for (const [attribute, value] of Object.entries(attributes)) element.setAttribute(attribute, value);
    applied += 1;
  }
  return applied;
}

// Intro avança al camp següent en lloc d'enviar el pas (a iOS no s'ha verificat en un mòbil real).
// El correu no hi és: és l'últim camp del pas 1 i Intro l'envia («go»).
export const NEXT_FIELD = { name: 'profile', phone: 'privacy' };

export function advanceOnEnter(event, doc) {
  const next = NEXT_FIELD[event.target.name];
  if (event.key !== 'Enter' || event.target.tagName !== 'INPUT' || !next) return false;
  const element = doc.querySelector(`[name="${next}"]`);
  if (!element) return false;
  event.preventDefault();
  element.focus();
  return true;
}
```

A `site/js/config.js`, afegir després de `extra1`:
```js
  dossierUrl: 'dossier-prova.pdf', // PROVA: substituir pel document real de Bruno (a site/)
  emailDelivery: false, // posar-ho a true quan l'enviament del correu amb la ficha existeixi: només canvia el text de la confirmació
```

```js
// scripts/make-test-pdf.mjs — PDF d'una pàgina per provar l'obertura del document (no és el document real).
import { writeFileSync } from 'node:fs';

const stream = 'BT /F1 18 Tf 72 760 Td (The Silent Fleet - documento de prueba) Tj ET';
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
writeFileSync('site/dossier-prova.pdf', pdf, 'latin1');
console.log('Generat site/dossier-prova.pdf');
```
Run: `node scripts/make-test-pdf.mjs`

`site/js/app.js` (substituir sencer):

```js
import { CONFIG } from './config.js';
import { DICT, resolveLang } from './i18n.js';
import { contactLinks } from './messages.js';
import { icon } from './icons.js';
import { isExtra1Enabled, legalQuery, resolveProduct } from './form/context.js';
import { emptyForm, formReducer } from './form/model.js';
import { clearError } from './form/validate.js';
import { newLeadId } from './form/lead.js';
import { advanceStep1, handleSubmit } from './form/flow.js';
import { toSession } from './form/session.js';
import { focusFirstError, focusStepHeading } from './form/focus.js';
import { advanceOnEnter, applyFieldHints } from './form/hints.js';
import { createChrome } from './ui/chrome.js';
import { createEntryScreen } from './ui/entry-screen.js';
import { createStepProduct } from './ui/step-product.js';
import { createStepContact } from './ui/step-contact.js';
import { createDoneScreen } from './ui/done-screen.js';

const R = window.React;
const T = window.TSF;
const h = R.createElement;
const search = window.location.search;
const extra1 = isExtra1Enabled(CONFIG, search);

const Header = createChrome({ h, T, brand: CONFIG.brand, languages: CONFIG.languages });
const EntryScreen = createEntryScreen({ h, T, icon });
const StepProduct = createStepProduct({ h, T });
const StepContact = createStepContact({ h, T });
const DoneScreen = createDoneScreen({ h, T, icon });

const emit = (name) => (detail) => window.dispatchEvent(new CustomEvent(name, { detail }));
const openDocument = () => { if (CONFIG.dossierUrl) window.open(CONFIG.dossierUrl, '_blank', 'noopener'); };

function App() {
  const [lang, setLang] = R.useState(() => resolveLang(search, CONFIG));
  const [profile, setProfile] = R.useState(''); // només l'entrada de l'MVP
  const [view, setView] = R.useState('entry'); // entry | step1 | step2 | done
  const [values, dispatch] = R.useReducer(formReducer, undefined, () => emptyForm({ product: resolveProduct(search, CONFIG.products) }));
  const [errors, setErrors] = R.useState({});
  const [attempt, setAttempt] = R.useState(0);
  const [leadId, setLeadId] = R.useState('');
  const [receipt, setReceipt] = R.useState(null);
  const mounted = R.useRef(false);
  const t = DICT[lang];
  const query = legalQuery(lang, extra1);
  const sessionOf = (source) => toSession(source, { products: CONFIG.products, dict: t });
  const bumpAttempt = () => setAttempt((n) => n + 1);

  R.useEffect(() => {
    document.documentElement.lang = lang;
    document.title = CONFIG.brand;
  }, [lang]);
  // Primer el títol del pas nou i, després, el primer error: l'error guanya el focus.
  R.useEffect(() => {
    if (mounted.current) {
      focusStepHeading(document);
      window.scrollTo(0, 0);
    } else {
      mounted.current = true;
    }
    if (view === 'step1' || view === 'step2') applyFieldHints(document);
  }, [view]);
  R.useEffect(() => {
    if (attempt > 0) focusFirstError(errors, document);
  }, [attempt]);

  const change = (field, value) => {
    dispatch({ type: 'set', field, value });
    setErrors((current) => clearError(current, field));
  };
  const common = { products: CONFIG.products, search, lang, leadId, newId: newLeadId, setLeadId, setErrors, bumpAttempt, goTo: setView };
  const next = () => advanceStep1(values, { ...common, emitPartial: emit('tsf:lead-partial') });
  const submit = () => handleSubmit(values, { ...common, dispatch, setReceipt, openDocument, emitLead: emit('tsf:lead') });
  const goHome = () => { setReceipt(null); setView('entry'); };
  const goBack = (to) => () => { setErrors({}); setView(to); };

  const screens = {
    entry: () => h(EntryScreen, {
      t, links: contactLinks(CONFIG, t, extra1 ? sessionOf(values) : { profile }), email: CONFIG.email, profile, legalQuery: query,
      onProfile: setProfile, onClearProfile: () => setProfile(''), onOpenForm: extra1 ? () => setView('step1') : undefined,
    }),
    step1: () => h(StepProduct, {
      t, products: CONFIG.products, values, errors, onChange: change, onNext: next, onKeyDown: (e) => advanceOnEnter(e, document), onBack: goBack('entry'),
    }),
    step2: () => h(StepContact, {
      t, values, errors, onChange: change, onSubmit: submit, onKeyDown: (e) => advanceOnEnter(e, document), onBack: goBack('step1'),
      privacyHref: `privacy.html${query}#privacy`,
    }),
    done: () => h(DoneScreen, {
      t, emailDelivery: CONFIG.emailDelivery, dossierUrl: CONFIG.dossierUrl, onHome: goHome,
      whatsappHref: contactLinks(CONFIG, t, receipt ? sessionOf(receipt) : {}).whatsapp,
    }),
  };

  const isStep = view === 'step1' || view === 'step2';
  return h('main', { className: isStep ? 'page page--form tsf-compact' : 'page tsf-compact' },
    h(Header, { t, lang, onLang: setLang }),
    screens[view]());
}

window.ReactDOM.createRoot(document.getElementById('root')).render(h(App));
```

`site/index.html`: a la llista de `<link rel="modulepreload">` afegir `js/form/session.js`, `js/form/steps.js`, `js/ui/fields.js`, `js/ui/step-indicator.js`, `js/ui/step-product.js`, `js/ui/step-contact.js`, `js/ui/done-screen.js` i treure `js/ui/form-screen.js` (veure'n el format actual amb `grep -n modulepreload site/index.html`; `tests/html.test.mjs` indica si en falta algun).

- [ ] **Step 4: Passar la suite sencera.** Run: `npm test 2>&1 | grep -E "^# (pass|fail)|^not ok"` → Expected: només pot fallar `texts-doc` (es regenera a la Task 8). Si falla un altre test (per exemple `html` per un `modulepreload`), arreglar-lo ara.

- [ ] **Step 5: Commit**

```bash
git add site scripts tests
git commit -m "feat: orquestració del flux de 2 passos, lead parcial i confirmació" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 8: Documentació, regeneració de textos i comprovació en navegador

**Files:**
- Modify: `README.md`, `DESIGN.md`, `docs/textos-contacte.md` (generat)

- [ ] **Step 1: Regenerar els textos i comprovar la suite**

Run: `npm run texts && npm test 2>&1 | grep -E "^# (pass|fail)"`
Expected: `# fail 0`.

- [ ] **Step 2: README.** Substituir la secció «Extra 1: formulari de contacte i perfilació» per un resum del flux:
  - Entrada → Pas 1 (producte + correu) → Pas 2 (nom, perfil, telèfon, embarcació, privacitat, novetats) → Confirmació (obre `CONFIG.dossierUrl` i ofereix WhatsApp amb les dades de la sessió).
  - Interruptor `extra1` (config o `?extra1=1`); `?producto=<id>|asesoramiento`; `?o=tauleta`.
  - Esdeveniments `window`: `tsf:lead-partial` (`{ id, stage:'step1', product, email, privacy:false, lang, origin }`) en passar del pas 1 al 2, i `tsf:lead` (`{ contact, profiling, hasProfiling }`) en acabar; comparteixen `id`. **Encara no s'envia res a cap servidor.**
  - Taula «Dades a substituir» amb: llista de productes (ara Modelo A/B/C de prova), `dossierUrl` (PDF de prova generat per `scripts/make-test-pdf.mjs`), `emailDelivery`, nom legal, text de privacitat.
  - «Pendent de Bruno»: la mateixa llista de l'especificació.

- [ ] **Step 3: DESIGN.md.** Afegir, a la secció de components, una entrada «Indicador de pas» amb el contracte de la Task 5 (text + traç de dos segments, `--action` / `--border-strong`, 4 px, `progressbar`, moviment només de color amb guarda), i anotar que en els passos el botó de l'acció s'ancora a la base només si el contingut cap (regla ja existent per al formulari), i que l'entrada de l'Extra 1 no porta xips de perfil.

- [ ] **Step 4: Comprovació al navegador, una sola passada (no un bucle)**

Run: `npm run serve` (en segon pla). Amb el navegador del panell, a `http://localhost:8080/?lang=es&extra1=1`, a 360×740 i 768×1024, claror i fosc:
  1. Entrada: un sol botó sòlid, sense xips; WhatsApp i correu amb text nou.
  2. Pas 1: indicador «Paso 1 de 2» amb un segment ple; enviar buit mostra els errors de producte i correu i **no avança**; triar un producte i escriure un correu mal escrit mostra l'error del correu; correcte → pas 2 (focus al títol, transició suau).
  3. Pas 2: segments plens; enviar buit mostra els errors i el focus va al primer; telèfon amb teclat numèric (atribut `inputmode`); «← Volver» torna al pas 1 amb els valors.
  4. Enviar bé: s'obre el PDF de prova en una pestanya, es veu la confirmació, el WhatsApp porta nom, producte, embarcació i perfil, «Volver al inicio» torna a l'entrada neta.
  5. A la consola: `window.addEventListener('tsf:lead-partial', e => console.log('partial', e.detail)); window.addEventListener('tsf:lead', e => console.log('lead', e.detail))` abans de provar; comprovar que el parcial porta `privacy:false` i que els dos `id` coincideixen.
  6. `?lang=pt`, `ca`, `en`: cap desbordament horitzontal (`document.documentElement.scrollWidth <= innerWidth`) i cap text tallat; l'indicador diu «Passo», «Pas», «Step».
  7. `prefers-reduced-motion`: sense animació i l'estat dels segments continua visible.
Arreglar el que surti en **un sol lot**, tornar a comprovar-ho una vegada i parar. No es verifica al navegador de l'ordinador el comportament dels bloquejadors de finestres ni dels teclats d'iOS/Android: queda com a pendent de prova en un mòbil real.

- [ ] **Step 5: Commit**

```bash
git add README.md DESIGN.md docs/textos-contacte.md
git commit -m "docs: flux de 2 passos, indicador de pas i textos regenerats" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

## Dades a substituir abans d'activar `extra1`

| On | Valor de prova | Qui el dona |
|---|---|---|
| `site/js/config.js` `products` | Modelo A / B / C (a més de l'opció fixa d'assessorament) | Bruno: llista real de models o potències |
| `site/js/config.js` `dossierUrl` | `dossier-prova.pdf` (generat) | Bruno: document real |
| `site/js/config.js` `emailDelivery` | `false` | Es posa a `true` quan existeixi l'enviament del correu |
| `site/js/config.js` `legalName` | PENDIENTE… | Bruno |
| `site/js/i18n-form.js` `privacyText` | Esborrany nostre, ara amb el correu parcial | Bruno (RGPD) |
| Nom del document | «ficha» | Bruno decideix si és «ficha» o «dossier» |

## Self-review

- **Cobertura de l'especificació:** entrada sense selectors (T6) · pas 1 amb xips obligatoris i correu `type=email` i error abans de seguir (T1, T6, T7) · pas 2 amb nom, perfil, telèfon `tel`, embarcació opcional, dues caselles (T6) · indicador amb disseny d'impeccable (T5) · transició sense recarregar i amb guarda de moviment (T5, T7) · confirmació amb document i WhatsApp (T6, T7) · lliurament doble: el document s'obre síncron i el lead s'emet (T7), amb el **correu real pendent** (pla posterior) · lead parcial amb `privacy:false` (T2, T7) · missatges amb dades de sessió (T3, T7) · perfilació retallada (T1, T2, T4) · «ficha» (T4).
- **Placeholders:** cap; els valors de prova són configuració llistada a la taula.
- **Coherència de noms:** `advanceStep1`, `handleSubmit`, `buildPartialLead`, `toSession`, `stepLabel`, `makeFields`, `focusStepHeading`, `STEP_FIELDS`, `ADVICE`, `messageContext`, `receipt`, `leadId` coincideixen entre T1–T7 i els tests.
- **Fora d'abast (declarat):** enviament real a Google, correu automàtic amb la ficha, validació legal del correu parcial, prova en mòbil real, `rem`.
