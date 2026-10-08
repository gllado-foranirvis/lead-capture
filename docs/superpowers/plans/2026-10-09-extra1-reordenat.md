# Extra 1 · flux reordenat Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reordenar el flux de 2 passos de l'Extra 1: perfil sempre visible a l'inici, pas 1 amb les dades de contacte i consentiment, pas 2 amb la perfilació (perfil, activitat, embarcació, intenció de compra, model), i un document general de l'empresa al final.

**Architecture:** Mateixa estructura que el flux actual (mòduls purs a `site/js/form/`, factories d'UI que reben `h` i `T`, `app.js` que orquestra). El perfil passa a viure només a `values.profile` (inici, pas 2 i missatges comparteixen la mateixa dada). `step-contact.js` esdevé el pas 1 i un `step-profile.js` nou és el pas 2; `step-product.js` s'esborra.

**Tech Stack:** HTML/CSS/JS pla (mòduls ES), React 18.3 UMD local, `window.TSF`, Node 22 per a tests.

**Spec:** `docs/superpowers/specs/2026-10-09-extra1-reordenat.md`. Base: `PRODUCT.md`, `DESIGN.md`, i el pla anterior `docs/superpowers/plans/2026-10-08-extra1-2-passos.md` (ja executat; aquest pla el modifica).

## Global Constraints

- Treballar a la branca `extra1-2-passos`, amb commits nous (cap `git push`, `git merge` ni PR sense que l'Olga ho demani).
- Cada commit acaba amb la línia `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>` (segon `-m`).
- Línia de base: `npm test` = 148 tests verds abans de començar.
- Textos: sense `!` ni `¡`, sense emojis; tracte proper (tu) als 4 idiomes (el test del portuguès prohibeix «seu/sua/seus/suas/lhe» i el d'ES/CA prohibeix «su/sus/usted»); el document es diu «dossier» (no «ficha» ni «PDF») als literals visibles; «Ski / Wake» no es tradueix.
- `page.css`: cap color literal, cap `@import`, cap `max-width` a `@media`, cap `height: <n>px`, cap `white-space: nowrap`; moviment només amb guarda de `prefers-reduced-motion`.
- Només el perfil és obligatori a la perfilació; el pas 1 demana nom, correu, telèfon i privacitat.
- El lead parcial s'emet en continuar el pas 1 i **porta `privacy: true`** (el consentiment és al pas 1). No hi ha cap lead amb `privacy: false`.
- Sense dades, els missatges de WhatsApp i correu són exactament els de sempre.
- Cap petició externa; res no es desa al navegador. Cap `ADVICE` nou: l'opció d'assessorament (`asesoramiento`) existeix i es manté.
- Dades de prova: llista de productes, número de WhatsApp, `dossierUrl` (PDF de prova), text de privacitat, `legalName`.

## Review Focus

- Canviar el perfil a l'inici, a l'inici de nou després de tornar enrere i al pas 2 és sempre la mateixa dada: no es perd ni es duplica (Tasks 1 i 5).
- Passar de Profesional a Particular esborra l'activitat i l'activitat «altra» (Task 1) i no arriben al lead (Task 2).
- Tornar enrere del pas 2 al pas 1 conserva el que s'ha escrit; continuar de nou reutilitza el mateix id i emet un lead parcial actualitzat (Task 5).
- Tauleta compartida: tornar a l'inici descarta dades, perfil i id; la confirmació conserva només el necessari per al WhatsApp i es neteja en anar a l'inici (Task 5).
- Un nom o una activitat «altra» amb símbols (`&`, `$&`, emoji, més de 100/120 caràcters) arriba intacte als missatges i al lead (Tasks 1 i 2).
- Canviar d'idioma enmig del flux conserva l'estat i tradueix indicador, textos, etiquetes d'activitat i missatges (Tasks 3 i 5).

## File Structure

```
site/js/form/model.js        (modifica) camps, ACTIVITIES, showsActivity*, dependències
site/js/form/validate.js     (modifica) pas 1 = contacte, pas 2 = només el perfil
site/js/form/lead.js         (modifica) lead parcial amb contacte, perfilació amb activitat/embarcació/intenció
site/js/form/session.js      (modifica) activitat i intenció per als missatges
site/js/form/flow.js         (modifica) advanceStep1 sense producte, handleSubmit
site/js/form/hints.js        (modifica) Intro: nom → correu → telèfon → privacitat
site/js/messages.js          (modifica) línies d'activitat i intenció
site/js/i18n.js              (modifica) messageContext amb activity i intent
site/js/i18n-form.js         (substitueix) literals del flux reordenat
site/js/ui/fields.js         (modifica) helper select
site/js/ui/entry-screen.js   (modifica) xips de perfil sempre, opcions per props
site/js/ui/step-contact.js   (substitueix) pas 1: contacte
site/js/ui/step-profile.js   (nou)        pas 2: perfilació
site/js/ui/step-product.js   (esborra)
site/js/app.js               (modifica) una sola dada de perfil, nous passos
site/index.html              (modifica) modulepreload
README.md DESIGN.md docs/textos-contacte.md
tests/* (substitucions indicades a cada tasca)
```

---

### Task 1: Model i validació

**Files:**
- Modify: `site/js/form/model.js`, `site/js/form/validate.js`
- Test: `tests/form-model.test.mjs`, `tests/form-validate.test.mjs` (substituir)

**Interfaces:**
- Produces (`model.js`): `PROFILES`, `ACTIVITIES = ['ocio','charter','vela','buceo','skiwake','seguridad','pasajeros','pesca','marina','otra']`, `ADVICE`, `MAX = { name:100, email:254, phone:30, activityOther:120 }`, `clip`, `emptyForm({product}) -> { product, email, name, profile, phone, activity, activityOther, hasBoat, intent, privacy, newsletter }`, `showsActivity(values)`, `showsActivityOther(values)`, `formReducer` (`set` aplica dependències; `reset`).
- Produces (`validate.js`): `STEP_FIELDS = { 1: ['name','email','phone','privacy'], 2: ['profile'] }`, `FIELD_ORDER`, `validateStep1(values)`, `validateStep2(values)`, `validateContact(values)`, `firstErrorField`, `clearError`. Codis: `required`, `email`, `phone`, `privacy`, `profileRequired`.

- [ ] **Step 1: Tests**

```js
// tests/form-model.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { ACTIVITIES, ADVICE, MAX, PROFILES, clip, emptyForm, formReducer, showsActivity, showsActivityOther } from '../site/js/form/model.js';

test('formulari buit: contacte, perfilació i consentiments nets', () => {
  assert.deepEqual(emptyForm(), {
    product: '', email: '', name: '', profile: '', phone: '', activity: '', activityOther: '', hasBoat: '', intent: '', privacy: false, newsletter: false,
  });
});
test('emptyForm accepta el producte inicial', () => {
  assert.equal(emptyForm({ product: 'model-a' }).product, 'model-a');
});
test('constants', () => {
  assert.deepEqual(PROFILES, ['particular', 'profesional']);
  assert.equal(ACTIVITIES.length, 10);
  assert.equal(ACTIVITIES.at(-1), 'otra');
  assert.equal(ADVICE, 'asesoramiento');
  assert.deepEqual(MAX, { name: 100, email: 254, phone: 30, activityOther: 120 });
});
test('l\'activitat només s\'aplica a Profesional; «altra» mostra el camp d\'especificar', () => {
  assert.equal(showsActivity({ profile: 'profesional' }), true);
  assert.equal(showsActivity({ profile: 'particular' }), false);
  assert.equal(showsActivityOther({ profile: 'profesional', activity: 'otra' }), true);
  assert.equal(showsActivityOther({ profile: 'profesional', activity: 'vela' }), false);
  assert.equal(showsActivityOther({ profile: 'particular', activity: 'otra' }), false);
});
test('set canvia un camp existent i ignora els desconeguts', () => {
  const s = emptyForm();
  assert.equal(formReducer(s, { type: 'set', field: 'name', value: 'Ana' }).name, 'Ana');
  assert.equal(formReducer(s, { type: 'set', field: 'demo', value: 'x' }), s);
});
test('passar de Profesional a Particular (o desmarcar el perfil) esborra l\'activitat i l\'activitat «altra»', () => {
  let s = formReducer(emptyForm(), { type: 'set', field: 'profile', value: 'profesional' });
  s = formReducer(s, { type: 'set', field: 'activity', value: 'otra' });
  s = formReducer(s, { type: 'set', field: 'activityOther', value: 'Remolcadors' });
  assert.deepEqual([s.activity, s.activityOther], ['otra', 'Remolcadors']);
  assert.deepEqual(['particular', ''].map((p) => {
    const n = formReducer(s, { type: 'set', field: 'profile', value: p });
    return [n.activity, n.activityOther];
  }), [['', ''], ['', '']]);
});
test('canviar l\'activitat a una altra que no és «otra» esborra l\'especificació', () => {
  let s = formReducer({ ...emptyForm(), profile: 'profesional', activity: 'otra', activityOther: 'x' }, { type: 'set', field: 'activity', value: 'vela' });
  assert.equal(s.activityOther, '');
});
test('reset torna al formulari buit amb el producte inicial', () => {
  const dirty = { ...emptyForm(), name: 'Ana', privacy: true, profile: 'profesional', activity: 'vela' };
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

const ok1 = { name: 'Ana', email: 'ana@example.com', phone: '+34 600 00 00 00', privacy: true };
const ok2 = { profile: 'particular' };

test('pas 1: nom, correu, telèfon i privacitat són obligatoris', () => {
  assert.deepEqual(validateStep1({}), { name: 'required', email: 'required', phone: 'required', privacy: 'privacy' });
  assert.deepEqual(validateStep1(ok1), {});
});
test('correu: formes vàlides', () => {
  for (const email of ['ana@example.com', 'a@sub.example.co.uk', ' ana@example.com '])
    assert.equal(validateStep1({ ...ok1, email }).email, undefined, email);
});
test('correu: formes invàlides (inclou «a@.b.co» i «a@b..co»)', () => {
  for (const email of ['ana', 'a@b', 'a@b.c', 'a@.b.co', 'a@b..co', 'a b@c.com'])
    assert.equal(validateStep1({ ...ok1, email }).email, 'email', email);
});
test('telèfon: formes vàlides i invàlides (el «+» només al principi)', () => {
  for (const phone of ['+34 600 00 00 00', '600123456', '(93) 123-45-67'])
    assert.equal(validateStep1({ ...ok1, phone }).phone, undefined, phone);
  for (const phone of ['abc', '12345', '600+123456', '1'.repeat(16)])
    assert.equal(validateStep1({ ...ok1, phone }).phone, 'phone', phone);
});
test('la privacitat només val si és exactament true', () => {
  assert.equal(validateStep1({ ...ok1, privacy: 'true' }).privacy, 'privacy');
});
test('pas 2: només el perfil és obligatori', () => {
  assert.deepEqual(validateStep2({}), { profile: 'profileRequired' });
  assert.deepEqual(validateStep2({ profile: 'inventat' }), { profile: 'profileRequired' });
  assert.deepEqual(validateStep2(ok2), {});
  assert.deepEqual(validateStep2({ ...ok2, activity: '', hasBoat: '', intent: '', product: '' }), {});
});
test('validateContact uneix els dos passos i FIELD_ORDER segueix el flux', () => {
  assert.deepEqual(validateContact({ ...ok1, ...ok2 }), {});
  assert.deepEqual(Object.keys(validateContact({})).sort(), [...FIELD_ORDER].sort());
  assert.deepEqual(FIELD_ORDER, [...STEP_FIELDS[1], ...STEP_FIELDS[2]]);
  assert.deepEqual(FIELD_ORDER, ['name', 'email', 'phone', 'privacy', 'profile']);
});
test('firstErrorField segueix l\'ordre del flux; clearError treu un sol camp', () => {
  assert.equal(firstErrorField({ profile: 'profileRequired', email: 'email' }), 'email');
  assert.equal(firstErrorField({}), undefined);
  assert.deepEqual(clearError({ email: 'x', name: 'y' }, 'email'), { name: 'y' });
});
```

- [ ] **Step 2: Veure'ls fallar.** Run: `node --test tests/form-model.test.mjs tests/form-validate.test.mjs 2>&1 | grep -E "^# (pass|fail)"` → Expected: fallen.

- [ ] **Step 3: Implementar**

```js
// site/js/form/model.js
export const PROFILES = ['particular', 'profesional'];
export const ACTIVITIES = ['ocio', 'charter', 'vela', 'buceo', 'skiwake', 'seguridad', 'pasajeros', 'pesca', 'marina', 'otra'];
export const ADVICE = 'asesoramiento';
export const MAX = { name: 100, email: 254, phone: 30, activityOther: 120 };

// Array.from evita partir un emoji (parell subrogat) pel mig.
export const clip = (value, max) => Array.from(String(value ?? '').trim()).slice(0, max).join('');

export const emptyForm = ({ product = '' } = {}) => ({
  product, email: '', name: '', profile: '', phone: '',
  activity: '', activityOther: '', hasBoat: '', intent: '',
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
    case 'reset':
      return emptyForm(action.initial);
    default:
      return state;
  }
}
```

```js
// site/js/form/validate.js
import { PROFILES } from './model.js';

export const STEP_FIELDS = { 1: ['name', 'email', 'phone', 'privacy'], 2: ['profile'] };
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

// Pas 1: contacte i consentiment.
export function validateStep1(values) {
  const errors = {};
  if (!text(values, 'name')) errors.name = 'required';
  const email = text(values, 'email');
  if (!email) errors.email = 'required';
  else if (!EMAIL.test(email)) errors.email = 'email';
  const phone = phoneError(text(values, 'phone'));
  if (phone) errors.phone = phone;
  if (values.privacy !== true) errors.privacy = 'privacy';
  return errors;
}

// Pas 2: només el perfil és obligatori; la resta de la perfilació és opcional.
export function validateStep2(values) {
  return PROFILES.includes(values.profile) ? {} : { profile: 'profileRequired' };
}

export const validateContact = (values) => ({ ...validateStep1(values), ...validateStep2(values) });

export const firstErrorField = (errors) => FIELD_ORDER.find((field) => errors[field]);

export function clearError(errors, field) {
  const { [field]: _removed, ...rest } = errors;
  return rest;
}
```

- [ ] **Step 4: Passar.** Run: `node --test tests/form-model.test.mjs tests/form-validate.test.mjs 2>&1 | grep -E "^# (pass|fail)"` → Expected: `# fail 0`. (La resta de la suite queda en vermell fins al final de la Task 5.)

- [ ] **Step 5: Commit**

```bash
git add site/js/form/model.js site/js/form/validate.js tests/form-model.test.mjs tests/form-validate.test.mjs
git commit -m "feat: model i validació amb el contacte al pas 1 i la perfilació al pas 2" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 2: Leads, dades de sessió i missatges

**Files:**
- Modify: `site/js/form/lead.js`, `site/js/form/session.js`, `site/js/messages.js`, `site/js/i18n.js`, `scripts/export-texts.mjs`
- Test: `tests/form-lead.test.mjs`, `tests/form-session.test.mjs` (substituir), `tests/messages.test.mjs` (modificar)

**Interfaces:**
- Consumes: `clip`, `MAX`, `ACTIVITIES`, `PROFILES`, `validateContact` (Task 1).
- Produces:
  - `buildPartialLead(values, { id, lang, origin }) -> { id, stage:'step1', name, email, phone, privacy:true, newsletter, lang, origin, profile? }` (`profile` només si és vàlid).
  - `buildLead(values, { id, lang, origin }) -> { contact, profiling, hasProfiling }`; `contact` = `{ id, product, name, email, phone, privacy:true, newsletter, lang, profile, origin }`; `profiling` = `{ id, activity?, activityOther?, hasBoat?, intent? }`.
  - `submitForm(values, { id, lang, origin }) -> { errors } | { lead }` (ja no rep `products`).
  - `toSession(values, { products, dict }) -> { profile, product, activity, hasBoat, intent, name }`.
  - `contactLinks(config, dict, session)`: línies en l'ordre nom, producte, activitat, embarcació, intenció; `dict.messageContext = { name, product, activity, boat, intent }`.

- [ ] **Step 1: Tests**

```js
// tests/form-lead.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildLead, buildPartialLead, newLeadId, submitForm } from '../site/js/form/lead.js';
import { emptyForm } from '../site/js/form/model.js';

const values = {
  ...emptyForm({ product: 'model-a' }), email: ' Ana@Example.com ', name: '  Ana  ', profile: 'profesional',
  phone: ' +34 600 00 00 00 ', activity: 'vela', hasBoat: 'si', intent: 'no', privacy: true, newsletter: true,
};
const ctx = { id: 'id-1', lang: 'es', origin: 'mobil' };

test('lead parcial: contacte normalitzat amb consentiment i el perfil si ja el coneixem', () => {
  assert.deepEqual(buildPartialLead(values, ctx), {
    id: 'id-1', stage: 'step1', name: 'Ana', email: 'ana@example.com', phone: '+34 600 00 00 00',
    privacy: true, newsletter: true, lang: 'es', origin: 'mobil', profile: 'profesional',
  });
});
test('lead parcial sense perfil escollit no porta la clau «profile»', () => {
  assert.equal(Object.hasOwn(buildPartialLead({ ...values, profile: '' }, ctx), 'profile'), false);
});
test('lead final: contacte i producte', () => {
  assert.deepEqual(buildLead(values, ctx).contact, {
    id: 'id-1', product: 'model-a', name: 'Ana', email: 'ana@example.com', phone: '+34 600 00 00 00',
    privacy: true, newsletter: true, lang: 'es', profile: 'profesional', origin: 'mobil',
  });
});
test('perfilació completa d\'un Profesional', () => {
  const { profiling, hasProfiling } = buildLead(values, ctx);
  assert.deepEqual(profiling, { id: 'id-1', activity: 'vela', hasBoat: 'si', intent: 'no' });
  assert.equal(hasProfiling, true);
});
test('activitat «otra» porta el text escrit, retallat a 120 caràcters sense trencar un emoji', () => {
  const { profiling } = buildLead({ ...values, activity: 'otra', activityOther: ` ${'😀'.repeat(200)} ` }, ctx);
  assert.equal(profiling.activity, 'otra');
  assert.equal(Array.from(profiling.activityOther).length, 120);
});
test('un Particular no envia activitat encara que el camp tingui valor', () => {
  const { profiling } = buildLead({ ...values, profile: 'particular', activity: 'vela' }, ctx);
  assert.equal(Object.hasOwn(profiling, 'activity'), false);
});
test('«hasBoat» i «intent» només si són sí o no; sense res, no hi ha perfilació', () => {
  const none = buildLead({ ...values, activity: '', hasBoat: 'potser', intent: '' }, ctx);
  assert.deepEqual([none.profiling, none.hasProfiling], [{ id: 'id-1' }, false]);
});
test('el nom llarg es retalla sense trencar un emoji', () => {
  assert.equal(Array.from(buildLead({ ...values, name: '😀'.repeat(150) }, ctx).contact.name).length, 100);
});
test('submitForm: errors o lead, amb el mateix id al contacte i a la perfilació', () => {
  assert.ok(submitForm(emptyForm(), ctx).errors.name);
  const { lead } = submitForm(values, ctx);
  assert.deepEqual([lead.contact.id, lead.profiling.id], ['id-1', 'id-1']);
});
test('submitForm: sense perfil no hi ha lead', () => {
  assert.equal(submitForm({ ...values, profile: '' }, ctx).errors.profile, 'profileRequired');
});
test('newLeadId dona identificadors diferents', () => {
  assert.notEqual(newLeadId(), newLeadId());
});
```

```js
// tests/form-session.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { toSession } from '../site/js/form/session.js';

const products = [{ id: 'model-a', name: 'Modelo A' }];
const dict = { form: { yes: 'Sí', no: 'No', productAdvice: 'No lo sé aún', activities: { vela: 'Deporte: vela', otra: 'Otra' } } };
const full = { product: 'model-a', profile: 'profesional', activity: 'vela', hasBoat: 'si', intent: 'no', name: '  Ana ' };

test('dades de la sessió traduïdes al diccionari actual; «profesional» usa el missatge «distribuidor»', () => {
  assert.deepEqual(toSession(full, { products, dict }), {
    profile: 'distribuidor', product: 'Modelo A', activity: 'Deporte: vela', hasBoat: 'Sí', intent: 'No', name: 'Ana',
  });
});
test('particular, l\'opció d\'assessorament i cap activitat', () => {
  assert.deepEqual(
    toSession({ product: 'asesoramiento', profile: 'particular', activity: 'vela', hasBoat: 'no', intent: 'si', name: '' }, { products, dict }),
    { profile: 'particular', product: 'No lo sé aún', activity: '', hasBoat: 'No', intent: 'Sí', name: '' },
  );
});
test('activitat «otra» usa el text escrit si n\'hi ha', () => {
  assert.equal(toSession({ profile: 'profesional', activity: 'otra', activityOther: ' Remolcadors ' }, { products, dict }).activity, 'Remolcadors');
  assert.equal(toSession({ profile: 'profesional', activity: 'otra', activityOther: '' }, { products, dict }).activity, 'Otra');
});
test('valors absents o desconeguts queden buits', () => {
  const empty = { profile: '', product: '', activity: '', hasBoat: '', intent: '', name: '' };
  assert.deepEqual(toSession({}, { products, dict }), empty);
  assert.deepEqual(toSession({ product: 'x', profile: 'x', activity: 'x', hasBoat: 'potser', intent: 'potser' }, { products, dict }), empty);
});
test('el nom i l\'activitat escrita es retallen', () => {
  assert.equal(Array.from(toSession({ name: 'a'.repeat(300) }, { products, dict }).name).length, 100);
  assert.equal(Array.from(toSession({ profile: 'profesional', activity: 'otra', activityOther: 'b'.repeat(300) }, { products, dict }).activity).length, 120);
});
```

A `tests/messages.test.mjs`, substituir el test «amb dades de sessió…» i el de «línies buides» i el de «cada idioma té les tres línies» per:

```js
test('amb dades de sessió: les línies van entre el text i el comiat, en ordre', () => {
  const session = { profile: 'particular', name: 'Ana', product: 'Modelo A', activity: 'Deporte: vela', hasBoat: 'Sí', intent: 'No' };
  const d = DICT.es;
  const lines = 'Me llamo Ana.\nProducto de interés: Modelo A\nActividad: Deporte: vela\nTengo embarcación: Sí\nIntención de compra: No';
  assert.equal(whatsappText(d, session), `${d.greeting}\n\n${d.messages.particular.text}\n\n${lines}`);
  assert.equal(emailBody(d, session), `${d.greeting}\n\n${d.messages.particular.text}\n\n${lines}\n\n${d.closing}`);
});
test('les línies que no tenen valor no apareixen', () => {
  assert.equal(whatsappText(DICT.ca, { intent: 'Sí' }), `${DICT.ca.greeting}\n\n${DICT.ca.messages.none.text}\n\nIntenció de compra: Sí`);
});
test('cada idioma té les cinc línies de dades amb {value}', () => {
  for (const lang of CONFIG.languages) for (const key of ['name', 'product', 'activity', 'boat', 'intent'])
    assert.match(DICT[lang].messageContext[key], /\{value\}/, `${lang}.${key}`);
});
```

- [ ] **Step 2: Veure'ls fallar.** Run: `node --test tests/form-lead.test.mjs tests/form-session.test.mjs tests/messages.test.mjs 2>&1 | grep -E "^# (pass|fail)"` → Expected: fallen.

- [ ] **Step 3: Implementar**

```js
// site/js/form/lead.js
import { ACTIVITIES, MAX, PROFILES, clip, showsActivity } from './model.js';
import { validateContact } from './validate.js';

export const newLeadId = () =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

const YES_NO = ['si', 'no'];
const answered = (value) => clip(value, 1) !== '';

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

// El pas 1 ja té el consentiment: el lead parcial és un contacte real i porta el perfil si el visitant ja l'ha triat.
export function buildPartialLead(values, { id, lang, origin }) {
  const { product: _product, ...contact } = buildContact(values, { id, lang, origin });
  const lead = { ...contact, stage: 'step1' };
  if (!PROFILES.includes(values.profile)) delete lead.profile;
  return lead;
}

function buildProfiling(values, id) {
  const profiling = { id };
  if (showsActivity(values) && ACTIVITIES.includes(values.activity)) {
    profiling.activity = values.activity;
    if (values.activity === 'otra' && answered(values.activityOther)) profiling.activityOther = clip(values.activityOther, MAX.activityOther);
  }
  if (YES_NO.includes(values.hasBoat)) profiling.hasBoat = values.hasBoat;
  if (YES_NO.includes(values.intent)) profiling.intent = values.intent;
  return profiling;
}

export function buildLead(values, context) {
  const profiling = buildProfiling(values, context.id);
  return { contact: buildContact(values, context), profiling, hasProfiling: Object.keys(profiling).length > 1 };
}

export function submitForm(values, context) {
  const errors = validateContact(values);
  return Object.keys(errors).length ? { errors } : { lead: buildLead(values, context) };
}
```

(El test del lead parcial fixa l'ordre de claus només per valor: `deepEqual` no depèn de l'ordre.)

```js
// site/js/form/session.js
import { MAX, clip, showsActivity } from './model.js';

// «Profesional» del formulari fa servir el missatge «distribuidor» (decisió oberta amb Bruno).
const MESSAGE_PROFILE = { profesional: 'distribuidor', particular: 'particular' };
const ANSWER = { si: 'yes', no: 'no' };

const answer = (value, dict) => (ANSWER[value] ? dict.form[ANSWER[value]] : '');

function activityLabel(values, dict) {
  if (!showsActivity(values)) return '';
  const written = clip(values.activityOther, MAX.activityOther);
  if (values.activity === 'otra' && written) return written;
  return dict.form.activities[values.activity] ?? '';
}

// Dades de la sessió en l'idioma actual, preparades per als missatges de WhatsApp i correu.
export function toSession(values, { products, dict }) {
  const product = values.product === 'asesoramiento' ? dict.form.productAdvice : products.find((p) => p.id === values.product)?.name;
  return {
    profile: MESSAGE_PROFILE[values.profile] ?? '',
    product: product ?? '',
    activity: activityLabel(values, dict),
    hasBoat: answer(values.hasBoat, dict),
    intent: answer(values.intent, dict),
    name: clip(values.name, MAX.name),
  };
}
```

A `site/js/messages.js`, substituir `contextLines` per:

```js
// Línies amb el que el visitant ja ha donat a la sessió; les buides no hi surten.
function contextLines(dict, { name, product, activity, hasBoat, intent } = {}) {
  const c = dict.messageContext;
  return [
    name && fill(c.name, name),
    product && fill(c.product, product),
    activity && fill(c.activity, activity),
    hasBoat && fill(c.boat, hasBoat),
    intent && fill(c.intent, intent),
  ].filter(Boolean);
}
```

A `site/js/i18n.js`, a cada `messageContext` afegir (dins de l'objecte, després de `boat`):
- es: `activity: 'Actividad: {value}', intent: 'Intención de compra: {value}'`
- ca: `activity: 'Activitat: {value}', intent: 'Intenció de compra: {value}'`
- pt: `activity: 'Atividade: {value}', intent: 'Intenção de compra: {value}'`
- en: `activity: 'Activity: {value}', intent: 'Purchase intent: {value}'`

A `scripts/export-texts.mjs`, l'exemple amb dades de sessió passa a `{ profile: 'particular', name: 'Ana', product: 'Modelo A', hasBoat: d.form.yes, intent: d.form.no }`.

- [ ] **Step 4: Passar.** Run: `node --test tests/form-lead.test.mjs tests/form-session.test.mjs tests/messages.test.mjs 2>&1 | grep -E "^# (pass|fail)"` → Expected: `# fail 0`. Després `npm run texts` (pot fallar fins a la Task 3 si `i18n-form.js` encara té l'estructura antiga; en aquest cas es regenera a la Task 3).

- [ ] **Step 5: Commit**

```bash
git add site/js/form/lead.js site/js/form/session.js site/js/messages.js site/js/i18n.js scripts/export-texts.mjs tests/form-lead.test.mjs tests/form-session.test.mjs tests/messages.test.mjs
git commit -m "feat: lead parcial amb contacte, perfilació completa i missatges amb activitat i intenció" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 3: Literals del flux reordenat (4 idiomes)

**Files:**
- Modify: `site/js/i18n-form.js` (substituir sencer)
- Test: `tests/form-i18n.test.mjs` (substituir)

**Interfaces:**
- Produces: `FORM[lang]` amb: `entryTitle, entrySubtitle, entryProfileLegend, entryCta, entryContactLabel, entryWhatsapp, entryEmail, stepOf, requiredNote, step1Title, step1Subtitle, next, name, email, phone, consentBefore, consentLink, newsletter, step2Title, step2Subtitle, profileLegend, profiles{particular,profesional}, activity, activityPlaceholder, activities{…10}, activityOther, hasBoat, intent, productLegend, productAdvice, yes, no, submit, errors{required,profileRequired,email,phone,privacy}, doneTitle, doneText, doneTextMail, doneOpen, doneHelp, doneHome, privacyText`.

- [ ] **Step 1: Test**

```js
// tests/form-i18n.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../site/js/config.js';
import { DICT } from '../site/js/i18n.js';
import { ACTIVITIES, PROFILES } from '../site/js/form/model.js';

const ERROR_CODES = ['required', 'profileRequired', 'email', 'phone', 'privacy'];
const leaves = (o) => Object.values(o).flatMap((v) => (typeof v === 'object' ? leaves(v) : [v]));

test('cada idioma té una etiqueta per a cada activitat i perfil, i un missatge per a cada codi d\'error', () => {
  for (const l of CONFIG.languages) {
    assert.deepEqual(Object.keys(DICT[l].form.activities).sort(), [...ACTIVITIES].sort(), l);
    assert.deepEqual(Object.keys(DICT[l].form.profiles).sort(), [...PROFILES].sort(), l);
    assert.deepEqual(Object.keys(DICT[l].form.errors).sort(), [...ERROR_CODES].sort(), l);
  }
});
test('«Ski / Wake» no es tradueix a cap idioma', () => {
  for (const l of CONFIG.languages) assert.match(DICT[l].form.activities.skiwake, /Ski \/ Wake/, l);
});
test('ja no queden claus de versions anteriors', () => {
  for (const l of CONFIG.languages) for (const key of ['hasElectric', 'investing', 'demo', 'demoPlaceholder', 'profilingTitle', 'pendingTitle', 'entryHint'])
    assert.equal(Object.hasOwn(DICT[l].form, key), false, `${l}.${key}`);
});
test('l\'indicador de pas té {n} i {total}', () => {
  for (const l of CONFIG.languages) assert.match(DICT[l].form.stepOf, /\{n\}.*\{total\}/, l);
});
test('el text de privacitat: responsable, correu, WhatsApp, contacte desat al pas 1, i no diu que no es guarden dades', () => {
  const unfinished = { es: /aunque no llegues a terminarlo/, ca: /encara que no arribis a acabar-lo/, pt: /mesmo que não chegues a terminá-lo/, en: /even if you do not finish it/ };
  for (const l of CONFIG.languages) {
    const text = DICT[l].form.privacyText;
    assert.match(text, /\{responsable\}/, l);
    assert.match(text, /\{email\}/, l);
    assert.match(text, /WhatsApp/, l);
    assert.match(text, unfinished[l], l);
    assert.doesNotMatch(text, /no guarda|no desa|não guarda|not store|does not store/i, l);
  }
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
test('el document es diu «dossier»: cap «ficha» ni «PDF» als literals visibles', () => {
  for (const l of CONFIG.languages) for (const s of leaves(DICT[l].form)) {
    assert.doesNotMatch(s, /PDF/, s);
    assert.doesNotMatch(s, /\bfich?[ae]\b|\bsheet\b/i, s);
  }
});
test('CTA d\'entrada i botó final', () => {
  assert.deepEqual(CONFIG.languages.map((l) => DICT[l].form.entryCta), [
    'Quiero saber más de The Silent Fleet', 'Vull saber més de The Silent Fleet', 'Quero saber mais sobre a The Silent Fleet', 'I want to learn more about The Silent Fleet',
  ]);
  assert.deepEqual(CONFIG.languages.map((l) => DICT[l].form.submit), ['Acceder al dossier', 'Accedir al dossier', 'Aceder ao dossier', 'Get the dossier']);
});
test('la confirmació té una versió amb correu i una sense', () => {
  for (const l of CONFIG.languages) assert.notEqual(DICT[l].form.doneText, DICT[l].form.doneTextMail, l);
});
```

- [ ] **Step 2: Veure'l fallar.** Run: `node --test tests/form-i18n.test.mjs 2>&1 | grep -E "^# (pass|fail)"` → Expected: fallen.

- [ ] **Step 3: Substituir `site/js/i18n-form.js`**

```js
// Literals del flux de 2 passos de l'Extra 1: contacte al pas 1, perfilació al pas 2. Tracte proper.
// El document es diu «dossier» fins que Bruno decideixi. Esborrany pendent de validar per Bruno (docs/textos-contacte.md).
export const FORM = {
  es: {
    entryTitle: 'Hablemos de propulsión eléctrica',
    entrySubtitle: 'Cuéntanos quién eres y te enviamos el dossier de The Silent Fleet.',
    entryProfileLegend: '¿Quién eres? (opcional)',
    entryCta: 'Quiero saber más de The Silent Fleet',
    entryContactLabel: 'O escríbenos directamente',
    entryWhatsapp: 'Escribir por WhatsApp', entryEmail: 'Escribir por correo',
    stepOf: 'Paso {n} de {total}',
    requiredNote: '* Campo obligatorio',
    step1Title: 'Déjanos tus datos',
    step1Subtitle: 'Así podremos enviarte el dossier y ponernos en contacto contigo.',
    next: 'Continuar',
    name: 'Nombre', email: 'Correo electrónico', phone: 'Teléfono',
    consentBefore: 'Acepto la ', consentLink: 'política de privacidad',
    newsletter: 'Quiero recibir novedades (opcional)',
    step2Title: 'Cuéntanos más sobre ti',
    step2Subtitle: 'Personalizamos el dossier según tu perfil. Solo el perfil es obligatorio.',
    profileLegend: '¿Quién eres?',
    profiles: { particular: 'Particular', profesional: 'Profesional' },
    activity: 'Actividad principal', activityPlaceholder: 'Elige una actividad',
    activities: {
      ocio: 'Ocio', charter: 'Chárter / alquiler', vela: 'Deporte: vela', buceo: 'Deporte: buceo',
      skiwake: 'Deporte: Ski / Wake', seguridad: 'Seguridad / salvamento', pasajeros: 'Transporte de pasajeros',
      pesca: 'Pesca', marina: 'Marina / operador portuario', otra: 'Otra',
    },
    activityOther: 'Otra actividad (especifica)',
    hasBoat: '¿Tienes embarcación actualmente?',
    intent: '¿Tienes intención de comprar propulsión eléctrica?',
    productLegend: 'Modelo o potencia de interés', productAdvice: 'No lo sé aún / Busco asesoramiento',
    yes: 'Sí', no: 'No',
    submit: 'Acceder al dossier',
    errors: {
      required: 'Completa este campo', profileRequired: 'Elige una opción',
      email: 'Introduce un correo válido', phone: 'Introduce un teléfono válido, por ejemplo +34 600 00 00 00',
      privacy: 'Acepta la política de privacidad para continuar',
    },
    doneTitle: 'Aquí tienes el dossier de The Silent Fleet',
    doneText: 'Hemos abierto el dossier en tu navegador.',
    doneTextMail: 'Hemos abierto el dossier en tu navegador y te lo hemos enviado por correo para que lo consultes cuando quieras.',
    doneOpen: 'Abrir el dossier',
    doneHelp: '¿Tienes dudas sobre qué motor encaja en tu embarcación? Habla directamente con un especialista por WhatsApp.',
    doneHome: 'Volver al inicio',
    privacyText: 'Si usas el formulario, guardamos tu nombre, correo, teléfono, el idioma y que has aceptado la política de privacidad en cuanto pasas al segundo paso, aunque no llegues a terminarlo. Si lo terminas, guardamos también tu perfil (particular o profesional) y, si lo indicas, tu actividad, si tienes embarcación, si piensas comprar propulsión eléctrica y el producto que te interesa. Los usamos para enviarte el dossier y contactarte sobre tu interés; si marcas la casilla de novedades, también para enviarte novedades. Responsable: {responsable}. Los datos se guardan en Google (Formularios y Hojas de cálculo), que actúa como encargado del tratamiento. Puedes pedirnos acceso, rectificación o supresión escribiendo a {email}. Si nos escribes por WhatsApp o por correo, usaremos tus datos solo para responderte.',
  },
  ca: {
    entryTitle: 'Parlem de propulsió elèctrica',
    entrySubtitle: 'Explica\'ns qui ets i t\'enviem el dossier de The Silent Fleet.',
    entryProfileLegend: 'Qui ets? (opcional)',
    entryCta: 'Vull saber més de The Silent Fleet',
    entryContactLabel: 'O escriu-nos directament',
    entryWhatsapp: 'Escriure per WhatsApp', entryEmail: 'Escriure per correu',
    stepOf: 'Pas {n} de {total}',
    requiredNote: '* Camp obligatori',
    step1Title: 'Deixa\'ns les teves dades',
    step1Subtitle: 'Així podrem enviar-te el dossier i posar-nos en contacte amb tu.',
    next: 'Continuar',
    name: 'Nom', email: 'Correu electrònic', phone: 'Telèfon',
    consentBefore: 'Accepto la ', consentLink: 'política de privacitat',
    newsletter: 'Vull rebre novetats (opcional)',
    step2Title: 'Explica\'ns més sobre tu',
    step2Subtitle: 'Personalitzem el dossier segons el teu perfil. Només el perfil és obligatori.',
    profileLegend: 'Qui ets?',
    profiles: { particular: 'Particular', profesional: 'Professional' },
    activity: 'Activitat principal', activityPlaceholder: 'Tria una activitat',
    activities: {
      ocio: 'Oci', charter: 'Xàrter / lloguer', vela: 'Esport: vela', buceo: 'Esport: busseig',
      skiwake: 'Esport: Ski / Wake', seguridad: 'Seguretat / salvament', pasajeros: 'Transport de passatgers',
      pesca: 'Pesca', marina: 'Marina / operador portuari', otra: 'Altra',
    },
    activityOther: 'Una altra activitat (especifica)',
    hasBoat: 'Tens una embarcació actualment?',
    intent: 'Tens intenció de comprar propulsió elèctrica?',
    productLegend: 'Model o potència d\'interès', productAdvice: 'Encara no ho sé / Busco assessorament',
    yes: 'Sí', no: 'No',
    submit: 'Accedir al dossier',
    errors: {
      required: 'Omple aquest camp', profileRequired: 'Tria una opció',
      email: 'Introdueix un correu vàlid', phone: 'Introdueix un telèfon vàlid, per exemple +34 600 00 00 00',
      privacy: 'Accepta la política de privacitat per continuar',
    },
    doneTitle: 'Aquí tens el dossier de The Silent Fleet',
    doneText: 'Hem obert el dossier al teu navegador.',
    doneTextMail: 'Hem obert el dossier al teu navegador i te l\'hem enviat per correu perquè el consultis quan vulguis.',
    doneOpen: 'Obrir el dossier',
    doneHelp: 'Tens dubtes sobre quin motor encaixa a la teva embarcació? Parla directament amb un especialista per WhatsApp.',
    doneHome: 'Tornar a l\'inici',
    privacyText: 'Si fas servir el formulari, desem el teu nom, correu, telèfon, l\'idioma i que has acceptat la política de privacitat tan bon punt passes al segon pas, encara que no arribis a acabar-lo. Si l\'acabes, desem també el teu perfil (particular o professional) i, si ho indiques, la teva activitat, si tens embarcació, si penses comprar propulsió elèctrica i el producte que t\'interessa. Els fem servir per enviar-te el dossier i contactar-te sobre el teu interès; si marques la casella de novetats, també per enviar-te novetats. Responsable: {responsable}. Les dades es desen a Google (Formularis i Fulls de càlcul), que actua com a encarregat del tractament. Pots demanar-nos accés, rectificació o supressió escrivint a {email}. Si ens escrius per WhatsApp o per correu, farem servir les teves dades només per respondre\'t.',
  },
  pt: {
    entryTitle: 'Falemos de propulsão elétrica',
    entrySubtitle: 'Diz-nos quem és e enviamos-te o dossier da The Silent Fleet.',
    entryProfileLegend: 'Quem és? (opcional)',
    entryCta: 'Quero saber mais sobre a The Silent Fleet',
    entryContactLabel: 'Ou escreve-nos diretamente',
    entryWhatsapp: 'Escrever por WhatsApp', entryEmail: 'Escrever por e-mail',
    stepOf: 'Passo {n} de {total}',
    requiredNote: '* Campo obrigatório',
    step1Title: 'Deixa-nos os teus dados',
    step1Subtitle: 'Assim poderemos enviar-te o dossier e entrar em contacto contigo.',
    next: 'Continuar',
    name: 'Nome', email: 'E-mail', phone: 'Telefone',
    consentBefore: 'Aceito a ', consentLink: 'política de privacidade',
    newsletter: 'Quero receber novidades (opcional)',
    step2Title: 'Conta-nos mais sobre ti',
    step2Subtitle: 'Personalizamos o dossier de acordo com o teu perfil. Só o perfil é obrigatório.',
    profileLegend: 'Quem és?',
    profiles: { particular: 'Particular', profesional: 'Profissional' },
    activity: 'Atividade principal', activityPlaceholder: 'Escolhe uma atividade',
    activities: {
      ocio: 'Lazer', charter: 'Charter / aluguer', vela: 'Desporto: vela', buceo: 'Desporto: mergulho',
      skiwake: 'Desporto: Ski / Wake', seguridad: 'Segurança / salvamento', pasajeros: 'Transporte de passageiros',
      pesca: 'Pesca', marina: 'Marina / operador portuário', otra: 'Outra',
    },
    activityOther: 'Outra atividade (especifica)',
    hasBoat: 'Tens atualmente uma embarcação?',
    intent: 'Tens intenção de comprar propulsão elétrica?',
    productLegend: 'Modelo ou potência de interesse', productAdvice: 'Ainda não sei / Procuro aconselhamento',
    yes: 'Sim', no: 'Não',
    submit: 'Aceder ao dossier',
    errors: {
      required: 'Preenche este campo', profileRequired: 'Escolhe uma opção',
      email: 'Introduz um e-mail válido', phone: 'Introduz um telefone válido, por exemplo +351 912 345 678',
      privacy: 'Aceita a política de privacidade para continuar',
    },
    doneTitle: 'Aqui tens o dossier da The Silent Fleet',
    doneText: 'Abrimos o dossier no teu navegador.',
    doneTextMail: 'Abrimos o dossier no teu navegador e enviámo-lo por e-mail para o consultares quando quiseres.',
    doneOpen: 'Abrir o dossier',
    doneHelp: 'Tens dúvidas sobre que motor se adapta à tua embarcação? Fala diretamente com um especialista por WhatsApp.',
    doneHome: 'Voltar ao início',
    privacyText: 'Se usares o formulário, guardamos o teu nome, e-mail, telefone, o idioma e que aceitaste a política de privacidade assim que passas ao segundo passo, mesmo que não chegues a terminá-lo. Se o terminares, guardamos também o teu perfil (particular ou profissional) e, se o indicares, a tua atividade, se tens embarcação, se pensas comprar propulsão elétrica e o produto que te interessa. Usamos estes dados para te enviar o dossier e contactar-te sobre o teu interesse; se marcares a caixa de novidades, também para te enviar novidades. Responsável: {responsable}. Os dados ficam guardados na Google (Formulários e Folhas de cálculo), que atua como subcontratante. Podes pedir-nos acesso, retificação ou apagamento escrevendo para {email}. Se nos escreveres por WhatsApp ou por e-mail, usaremos os teus dados apenas para te responder.',
  },
  en: {
    entryTitle: 'Let\'s talk about electric propulsion',
    entrySubtitle: 'Tell us who you are and we will send you The Silent Fleet dossier.',
    entryProfileLegend: 'Who are you? (optional)',
    entryCta: 'I want to learn more about The Silent Fleet',
    entryContactLabel: 'Or write to us directly',
    entryWhatsapp: 'Message us on WhatsApp', entryEmail: 'Email us',
    stepOf: 'Step {n} of {total}',
    requiredNote: '* Required field',
    step1Title: 'Leave us your details',
    step1Subtitle: 'So we can send you the dossier and get in touch.',
    next: 'Continue',
    name: 'Name', email: 'Email', phone: 'Phone',
    consentBefore: 'I accept the ', consentLink: 'privacy policy',
    newsletter: 'I\'d like to receive updates (optional)',
    step2Title: 'Tell us more about you',
    step2Subtitle: 'We tailor the dossier to your profile. Only the profile is required.',
    profileLegend: 'Who are you?',
    profiles: { particular: 'Private customer', profesional: 'Professional' },
    activity: 'Main activity', activityPlaceholder: 'Choose an activity',
    activities: {
      ocio: 'Leisure', charter: 'Charter / rental', vela: 'Sport: sailing', buceo: 'Sport: diving',
      skiwake: 'Sport: Ski / Wake', seguridad: 'Safety / rescue', pasajeros: 'Passenger transport',
      pesca: 'Fishing', marina: 'Marina / port operator', otra: 'Other',
    },
    activityOther: 'Other activity (please specify)',
    hasBoat: 'Do you currently own a boat?',
    intent: 'Do you intend to buy electric propulsion?',
    productLegend: 'Model or power of interest', productAdvice: 'Not sure yet / I need advice',
    yes: 'Yes', no: 'No',
    submit: 'Get the dossier',
    errors: {
      required: 'Fill in this field', profileRequired: 'Choose an option',
      email: 'Enter a valid email', phone: 'Enter a valid phone number, for example +34 600 00 00 00',
      privacy: 'Accept the privacy policy to continue',
    },
    doneTitle: 'Here is The Silent Fleet dossier',
    doneText: 'We have opened the dossier in your browser.',
    doneTextMail: 'We have opened the dossier in your browser and emailed it to you to read whenever you like.',
    doneOpen: 'Open the dossier',
    doneHelp: 'Not sure which motor fits your boat? Talk to a specialist directly on WhatsApp.',
    doneHome: 'Back to start',
    privacyText: 'If you use the form, we store your name, email, phone, language and the fact that you accepted the privacy policy as soon as you move to the second step, even if you do not finish it. If you finish it, we also store your profile (private customer or professional) and, if you tell us, your activity, whether you own a boat, whether you intend to buy electric propulsion and the product you are interested in. We use this to send you the dossier and contact you about your interest; if you tick the updates box, also to send you updates. Controller: {responsable}. The data is stored with Google (Forms and Sheets), which acts as data processor. You can ask us for access, correction or deletion by writing to {email}. If you write to us by WhatsApp or email, we will use your details only to reply.',
  },
};
```

- [ ] **Step 4: Passar.** Run: `node --test tests/form-i18n.test.mjs tests/i18n.test.mjs tests/privacy-text.test.mjs 2>&1 | grep -E "^# (pass|fail)|^not ok"` → Expected: `# fail 0`. Si algun regex del tracte (`su/sus` ES, `suas` PT) salta, reescriure la frase amb un article, no tocar el test.

- [ ] **Step 5: Commit**

```bash
git add site/js/i18n-form.js tests/form-i18n.test.mjs
git commit -m "feat: literals del flux reordenat (inici amb perfil, contacte, perfilació, dossier)" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 4: Pantalles (inici amb perfil, pas 1 de contacte, pas 2 de perfilació)

**Files:**
- Modify: `site/js/ui/fields.js`, `site/js/ui/entry-screen.js`, `site/js/ui/step-contact.js` (substituir)
- Create: `site/js/ui/step-profile.js`
- Delete: `site/js/ui/step-product.js`
- Test: `tests/ui-steps.test.mjs` (substituir), `tests/ui.test.mjs` (ajustar)

**Interfaces:**
- Produces:
  - `makeFields(...) -> { text, chips, select }`; `select(field, label, options, extra)`.
  - `createEntryScreen({ h, T, icon })` → `EntryScreen({ t, links, email, profile, profileLegend, profileOptions, onProfile, onClearProfile, legalQuery, onOpenForm })`. **Sempre** pinta el xip de perfil (opcional i desmarcable) amb `profileLegend` i `profileOptions`; amb `onOpenForm` canvia títol, subtítol, CTA i botons.
  - `createStepContact({ h, T })` → `StepContact({ t, values, errors, onChange, onNext, onBack, onKeyDown, privacyHref })`: pas 1, camps `name, email, phone`, casella `privacy`, casella `newsletter`; botó `type=submit` amb `` `${f.next} →` ``.
  - `createStepProfile({ h, T })` → `StepProfile({ t, products, values, errors, onChange, onSubmit, onBack, onKeyDown })`: pas 2; ordre `profile, activity?, activityOther?, hasBoat, intent, product`; botó final `f.submit`.
  - Tots porten `div.page__heading[tabIndex=-1][data-step-heading]` i l'indicador cridat com a funció (`StepIndicator({...})`).

- [ ] **Step 1: Tests (substituir `tests/ui-steps.test.mjs`)**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { h, T, byType, byName, findAll, textOf } from './helpers/fake-react.mjs';
import { DICT } from '../site/js/i18n.js';
import { CONFIG } from '../site/js/config.js';
import { ACTIVITIES, PROFILES, emptyForm } from '../site/js/form/model.js';
import { icon } from '../site/js/icons.js';
import { createStepIndicator } from '../site/js/ui/step-indicator.js';
import { createEntryScreen } from '../site/js/ui/entry-screen.js';
import { createStepContact } from '../site/js/ui/step-contact.js';
import { createStepProfile } from '../site/js/ui/step-profile.js';
import { createDoneScreen } from '../site/js/ui/done-screen.js';

const noop = () => {};
const StepIndicator = createStepIndicator({ h });
const EntryScreen = createEntryScreen({ h, T, icon });
const StepContact = createStepContact({ h, T });
const StepProfile = createStepProfile({ h, T });
const DoneScreen = createDoneScreen({ h, T, icon });
const f = DICT.es.form;
const buttons = (tree) => byType(tree, 'T.Button');
const bar = (tree) => findAll(tree, (n) => n.props?.role === 'progressbar')[0];
const alerts = (tree) => findAll(tree, (n) => n.props?.role === 'alert').map(textOf);
const deselectable = (tree) => findAll(tree, (n) => n.type === 'div' && typeof n.props.onClick === 'function' && typeof n.props.onKeyDown === 'function');
const profileOptions = PROFILES.map((p) => ({ value: p, label: f.profiles[p] }));

const entry = (extra = {}) => EntryScreen({
  t: DICT.es, links: { whatsapp: 'wa', email: 'mail' }, email: CONFIG.email, profile: '', profileLegend: f.entryProfileLegend, profileOptions,
  onProfile: noop, onClearProfile: noop, legalQuery: '?lang=es', ...extra,
});
const contact = (extra = {}) => StepContact({
  t: DICT.es, values: emptyForm(), errors: {}, onChange: noop, onNext: noop, onBack: noop, privacyHref: 'privacy.html?lang=es#privacy', ...extra,
});
const profile = (extra = {}) => StepProfile({
  t: DICT.es, products: CONFIG.products, values: emptyForm(), errors: {}, onChange: noop, onSubmit: noop, onBack: noop, ...extra,
});

test('indicador: text visible, barra accessible i segments plens segons el pas', () => {
  const tree = StepIndicator({ step: 1, total: 2, label: 'Paso 1 de 2' });
  assert.ok(textOf(tree).includes('Paso 1 de 2'));
  assert.deepEqual([bar(tree).props['aria-valuenow'], bar(tree).props['aria-valuetext'], bar(tree).props['aria-label']], [1, 'Paso 1 de 2', 'Paso 1 de 2']);
  const on = (step) => findAll(StepIndicator({ step, total: 2, label: 'x' }), (n) => n.type === 'span' && n.props.className.includes('steps__seg--on')).length;
  assert.deepEqual([on(1), on(2)], [1, 2]);
});

test('inici amb Extra 1: xip de perfil sempre visible, CTA nou únic principal, cap xip fora de la pregunta de perfil', () => {
  const tree = entry({ onOpenForm: noop });
  const [chips] = byType(tree, 'T.ChoiceChips');
  assert.deepEqual([chips.props.legend, chips.props.name, chips.props.options.map((o) => o.value)], [f.entryProfileLegend, 'perfil', ['particular', 'profesional']]);
  const [cta, wa, mail] = buttons(tree);
  assert.deepEqual([textOf(cta), cta.props.variant, cta.props.onClick], [f.entryCta, undefined, noop]);
  assert.deepEqual([textOf(wa), wa.props.variant, textOf(mail), mail.props.variant], [f.entryWhatsapp, 'outline', f.entryEmail, 'outline']);
  assert.equal(byType(tree, 'T.SectionHeading')[0].props.title, f.entryTitle);
  assert.equal(deselectable(tree).length, 1, 'el perfil és desmarcable a l\'inici');
});
test('inici sense Extra 1: l\'MVP amb xips de perfil i WhatsApp principal', () => {
  const t = DICT.es;
  const tree = entry({ profileLegend: t.profileLegend, profileOptions: [{ value: 'profesional', label: t.profileDistribuidor }, { value: 'particular', label: t.profileParticular }] });
  assert.equal(byType(tree, 'T.ChoiceChips')[0].props.legend, t.profileLegend);
  assert.equal(buttons(tree).length, 2);
  assert.equal(buttons(tree)[0].props.variant, undefined);
});

test('pas 1: indicador 1 de 2, camps de contacte obligatoris amb el teclat adequat, sense xips', () => {
  const tree = contact();
  assert.equal(bar(tree).props['aria-valuenow'], 1);
  assert.ok(textOf(tree).includes('Paso 1 de 2') && textOf(tree).includes(f.requiredNote));
  const order = findAll(tree, (n) => ['T.Field', 'T.Checkbox'].includes(n.type)).map((n) => n.props.name);
  assert.deepEqual(order, ['name', 'email', 'phone', 'privacy', 'newsletter']);
  assert.deepEqual([byName(tree, 'email')[0].props.type, byName(tree, 'phone')[0].props.type], ['email', 'tel']);
  for (const n of ['name', 'email', 'phone']) assert.equal(byName(tree, n)[0].props.required, true, n);
  assert.equal(byType(tree, 'T.ChoiceChips').length, 0);
});
test('pas 1: privacitat sense marcar amb enllaç a pestanya nova, text d\'un sol element; novetats opcional', () => {
  const tree = contact();
  const [privacy] = byName(tree, 'privacy');
  assert.deepEqual([privacy.props.checked, privacy.props.required], [false, true]);
  const [link] = byType(privacy, 'a');
  assert.deepEqual([link.props.href, link.props.target, link.props.rel], ['privacy.html?lang=es#privacy', '_blank', 'noopener']);
  assert.equal(privacy.children.length, 1);
  assert.equal(privacy.children[0].type, 'span');
  assert.match(f.consentBefore, / $/);
  assert.equal(byName(tree, 'newsletter')[0].props.required, undefined);
});
test('pas 1: botó «Continuar →» (submit) i «← Volver»; Intro envia el pas; els errors es veuen abans de seguir', () => {
  let called = 0;
  const tree = contact({ onNext: () => called++, onKeyDown: noop, errors: { name: 'required', email: 'email', privacy: 'privacy' } });
  const [next, back] = buttons(tree);
  assert.deepEqual([next.props.type, next.props.full, textOf(next), back.props.variant, textOf(back)], ['submit', true, 'Continuar →', 'link', '← Volver']);
  const [formEl] = byType(tree, 'form');
  const e = { preventDefault() { this.prevented = true; } };
  formEl.props.onSubmit(e);
  assert.deepEqual([e.prevented, called, formEl.props.noValidate, formEl.props.onKeyDown], [true, 1, true, noop]);
  assert.equal(byName(tree, 'email')[0].props.error, f.errors.email);
  assert.equal(byName(tree, 'privacy')[0].props.error, f.errors.privacy);
});
test('pas 1: cada control notifica el seu camp i el contenidor del títol rep el focus', () => {
  const calls = [];
  const tree = contact({ onChange: (field, v) => calls.push([field, v]) });
  byName(tree, 'name')[0].props.onChange({ target: { value: 'Ana' } });
  byName(tree, 'privacy')[0].props.onChange({ target: { checked: true } });
  assert.deepEqual(calls, [['name', 'Ana'], ['privacy', true]]);
  const [head] = findAll(tree, (n) => n.props?.['data-step-heading'] !== undefined);
  assert.deepEqual([head.props.tabIndex, head.props.className], [-1, 'page__heading']);
});

test('pas 2: indicador 2 de 2 i preguntes en l\'ordre del brief; l\'activitat no hi surt per a un Particular', () => {
  const tree = profile({ values: { ...emptyForm(), profile: 'particular' } });
  assert.equal(bar(tree).props['aria-valuenow'], 2);
  const order = findAll(tree, (n) => ['T.ChoiceChips', 'T.Select'].includes(n.type)).map((n) => n.props.name);
  assert.deepEqual(order, ['profile', 'hasBoat', 'intent', 'product']);
});
test('pas 2: Profesional veu l\'activitat; «otra» mostra el camp d\'especificar', () => {
  const pro = profile({ values: { ...emptyForm(), profile: 'profesional' } });
  const order = findAll(pro, (n) => ['T.ChoiceChips', 'T.Select'].includes(n.type)).map((n) => n.props.name);
  assert.deepEqual(order, ['profile', 'activity', 'hasBoat', 'intent', 'product']);
  assert.deepEqual(byName(pro, 'activity')[0].props.options.map((o) => o.value), ACTIVITIES);
  assert.equal(byName(pro, 'activityOther').length, 0);
  const other = profile({ values: { ...emptyForm(), profile: 'profesional', activity: 'otra' } });
  assert.equal(byName(other, 'activityOther')[0].type, 'T.Field');
});
test('pas 2: només el perfil és obligatori i no es pot desmarcar; la resta és opcional i desmarcable', () => {
  const tree = profile({ values: { ...emptyForm(), profile: 'profesional' } });
  assert.equal(byName(tree, 'profile')[0].props.legend, `${f.profileLegend} *`);
  for (const n of ['hasBoat', 'intent']) assert.equal(byName(tree, n)[0].props.legend.endsWith('*'), false, n);
  assert.equal(byName(tree, 'product')[0].props.legend, f.productLegend);
  assert.equal(deselectable(tree).length, 3, 'embarcació, intenció i producte');
});
test('pas 2: embarcació i intenció són Sí/No; el producte afegeix l\'assessorament al final', () => {
  const tree = profile();
  assert.deepEqual(byName(tree, 'hasBoat')[0].props.options.map((o) => o.label), ['Sí', 'No']);
  assert.deepEqual(byName(tree, 'intent')[0].props.options.map((o) => o.label), ['Sí', 'No']);
  assert.deepEqual(byName(tree, 'product')[0].props.options.map((o) => o.label), [...CONFIG.products.map((p) => p.name), f.productAdvice]);
  assert.equal(byName(tree, 'product')[0].props.options.at(-1).value, 'asesoramiento');
});
test('pas 2: error del perfil visible, botó final i «← Volver», enviar no recarrega', () => {
  let sent = 0;
  const tree = profile({ errors: { profile: 'profileRequired' }, onSubmit: () => sent++ });
  assert.deepEqual(alerts(tree), ['! Elige una opción']);
  const [submit, back] = buttons(tree);
  assert.deepEqual([submit.props.type, textOf(submit), back.props.variant, textOf(back)], ['submit', 'Acceder al dossier', 'link', '← Volver']);
  const [formEl] = byType(tree, 'form');
  const e = { preventDefault() { this.prevented = true; } };
  formEl.props.onSubmit(e);
  assert.deepEqual([e.prevented, sent], [true, 1]);
});

test('confirmació: dossier, ajuda per WhatsApp amb l\'enllaç de la sessió i tornada a l\'inici', () => {
  let home = 0;
  let opened = 0;
  const tree = DoneScreen({ t: DICT.es, emailDelivery: false, onOpen: () => { opened++; }, whatsappHref: 'https://wa.me/1', onHome: () => home++ });
  const [open, wa, back] = buttons(tree);
  assert.deepEqual([textOf(open), open.props.variant], [f.doneOpen, undefined]);
  open.props.onClick();
  assert.deepEqual([textOf(wa), wa.props.variant, wa.props.href, back.props.variant, textOf(back)], [f.entryWhatsapp, 'outline', 'https://wa.me/1', 'link', f.doneHome]);
  back.props.onClick();
  assert.deepEqual([opened, home], [1, 1]);
  assert.equal(byType(tree, 'T.SectionHeading')[0].props.title, f.doneTitle);
  assert.ok(textOf(tree).includes(f.doneHelp));
});
test('confirmació: el subtítol parla del correu només si l\'enviament existeix', () => {
  const sub = (emailDelivery) => byType(DoneScreen({ t: DICT.es, emailDelivery, onOpen: noop, whatsappHref: 'w', onHome: noop }), 'T.SectionHeading')[0].props.subtitle;
  assert.equal(sub(false), f.doneText);
  assert.equal(sub(true), f.doneTextMail);
});
```

A `tests/ui.test.mjs` (tests de capçalera i d'entrada de l'MVP): ajustar la constant `entry` perquè passi `profileLegend: DICT.es.profileLegend` i `profileOptions: [{ value: 'profesional', label: DICT.es.profileDistribuidor }, { value: 'particular', label: DICT.es.profileParticular }]`; el test «el perfil és desmarcable» continua igual.

- [ ] **Step 2: Veure'ls fallar.** Run: `node --test tests/ui-steps.test.mjs 2>&1 | grep -E "^# (pass|fail)"` → Expected: fallen.

- [ ] **Step 3: Implementar**

`site/js/ui/fields.js`: afegir el helper i retornar-lo:

```js
  const select = (field, label, options, extra = {}) =>
    h(T.Select, { label, name: field, id: field, value: values[field], error: error(field), onChange: set(field), options, ...extra });

  return { text, chips, select };
```

```js
// site/js/ui/entry-screen.js
import { deselectProps } from '../chips.js';

export function createEntryScreen({ h, T, icon }) {
  return function EntryScreen({ t, links, email, profile, profileLegend, profileOptions, onProfile, onClearProfile, legalQuery, onOpenForm }) {
    const withForm = typeof onOpenForm === 'function';
    const f = t.form;
    return h('div', { className: 'page__screen' },
      h('div', { className: 'page__heading', tabIndex: -1, 'data-step-heading': '' },
        h(T.SectionHeading, {
          layout: 'mobile', align: 'start', level: 1, className: 'page__title',
          title: withForm ? f.entryTitle : t.title, subtitle: withForm ? f.entrySubtitle : t.subtitle,
        })),
      // La pregunta de perfil és sempre visible: el missatge de WhatsApp i correu i el pas 2 la fan servir.
      h('div', deselectProps(profile, onClearProfile),
        h(T.ChoiceChips, { legend: profileLegend, name: 'perfil', value: profile, options: profileOptions, onChange: (e) => onProfile(e.target.value) })),
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

```js
// site/js/ui/step-contact.js — pas 1: dades de contacte i consentiment
import { stepLabel } from '../form/steps.js';
import { makeFields } from './fields.js';
import { createStepIndicator } from './step-indicator.js';

export function createStepContact({ h, T }) {
  const StepIndicator = createStepIndicator({ h });
  return function StepContact({ t, values, errors, onChange, onNext, onBack, onKeyDown, privacyHref }) {
    const f = t.form;
    const { text } = makeFields({ h, T, f, values, errors, onChange });
    const error = (field) => (errors[field] ? f.errors[errors[field]] : undefined);

    return h('div', { className: 'page__screen page__screen--form' },
      StepIndicator({ step: 1, total: 2, label: stepLabel(f.stepOf, 1, 2) }),
      h('div', { className: 'page__heading', tabIndex: -1, 'data-step-heading': '' },
        h(T.SectionHeading, { layout: 'mobile', align: 'start', level: 1, title: f.step1Title, subtitle: f.step1Subtitle, className: 'page__title' })),
      h('p', { className: 'body-sm page__note' }, f.requiredNote),
      h('form', { className: 'form', noValidate: true, onKeyDown, onSubmit: (e) => { e.preventDefault(); onNext(); } },
        h('div', { className: 'form__group' },
          text('name', f.name, { required: true }),
          text('email', f.email, { required: true, type: 'email' }),
          text('phone', f.phone, { required: true, type: 'tel' })),
        h('div', { className: 'form__group' },
          h(T.Checkbox, { name: 'privacy', id: 'privacy', required: true, checked: values.privacy, error: error('privacy'), onChange: (e) => onChange('privacy', e.target.checked) },
            // Un sol element: l'etiqueta del Checkbox és flex i, amb tres fills, es perdria l'espai abans de l'enllaç.
            h('span', null, f.consentBefore, h('a', { href: privacyHref, target: '_blank', rel: 'noopener' }, f.consentLink))),
          h(T.Checkbox, { name: 'newsletter', id: 'newsletter', checked: values.newsletter, onChange: (e) => onChange('newsletter', e.target.checked) }, f.newsletter)),
        h('div', { className: 'form__actions' },
          h(T.Button, { type: 'submit', full: true }, `${f.next} →`),
          h(T.Button, { variant: 'link', onClick: onBack }, `← ${t.back}`))));
  };
}
```

```js
// site/js/ui/step-profile.js — pas 2: perfilació (només el perfil és obligatori)
import { ACTIVITIES, ADVICE, PROFILES, showsActivity, showsActivityOther } from '../form/model.js';
import { stepLabel } from '../form/steps.js';
import { makeFields } from './fields.js';
import { createStepIndicator } from './step-indicator.js';

export function createStepProfile({ h, T }) {
  const StepIndicator = createStepIndicator({ h });
  return function StepProfile({ t, products, values, errors, onChange, onSubmit, onBack, onKeyDown }) {
    const f = t.form;
    const { text, chips, select } = makeFields({ h, T, f, values, errors, onChange });
    const yesNo = [{ value: 'si', label: f.yes }, { value: 'no', label: f.no }];
    const productOptions = [...products.map((p) => ({ value: p.id, label: p.name })), { value: ADVICE, label: f.productAdvice }];

    return h('div', { className: 'page__screen page__screen--form' },
      StepIndicator({ step: 2, total: 2, label: stepLabel(f.stepOf, 2, 2) }),
      h('div', { className: 'page__heading', tabIndex: -1, 'data-step-heading': '' },
        h(T.SectionHeading, { layout: 'mobile', align: 'start', level: 1, title: f.step2Title, subtitle: f.step2Subtitle, className: 'page__title' })),
      h('p', { className: 'body-sm page__note' }, f.requiredNote),
      h('form', { className: 'form', noValidate: true, onKeyDown, onSubmit: (e) => { e.preventDefault(); onSubmit(); } },
        h('div', { className: 'form__group' },
          chips('profile', f.profileLegend, PROFILES.map((p) => ({ value: p, label: f.profiles[p] })), { required: true }),
          showsActivity(values) ? select('activity', f.activity, ACTIVITIES.map((a) => ({ value: a, label: f.activities[a] })), { placeholder: f.activityPlaceholder }) : null,
          showsActivityOther(values) ? text('activityOther', f.activityOther) : null,
          chips('hasBoat', f.hasBoat, yesNo),
          chips('intent', f.intent, yesNo),
          chips('product', f.productLegend, productOptions)),
        h('div', { className: 'form__actions' },
          h(T.Button, { type: 'submit', full: true }, f.submit),
          h(T.Button, { variant: 'link', onClick: onBack }, `← ${t.back}`))));
  };
}
```

`git rm site/js/ui/step-product.js`.

- [ ] **Step 4: Passar.** Run: `node --test tests/ui-steps.test.mjs tests/ui.test.mjs tests/chips.test.mjs 2>&1 | grep -E "^# (pass|fail)|^not ok"` → Expected: `# fail 0`.

- [ ] **Step 5: Commit**

```bash
git rm -q site/js/ui/step-product.js
git add site/js/ui tests/ui-steps.test.mjs tests/ui.test.mjs
git commit -m "feat: pantalles reordenades (perfil a l'inici, pas 1 de contacte, pas 2 de perfilació)" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 5: Flux, tecles i orquestració

**Files:**
- Modify: `site/js/form/flow.js`, `site/js/form/hints.js`, `site/js/app.js`, `site/index.html`
- Test: `tests/form-flow.test.mjs`, `tests/form-hints.test.mjs` (substituir)

**Interfaces:**
- Consumes: Tasks 1–4.
- Produces:
  - `advanceStep1(values, deps) -> boolean`, `deps = { search, lang, leadId, newId, setLeadId, setErrors, bumpAttempt, emitPartial, goTo }` (sense `products`): valida el pas 1, emet el lead parcial (amb consentiment) i va a `'step2'`.
  - `handleSubmit(values, deps) -> boolean`, `deps = { products, search, lang, leadId, newId, dispatch, setErrors, setLeadId, setReceipt, bumpAttempt, openDocument, emitLead, goTo }`: valida tot; l'error del perfil va al pas 2, la resta de camps al pas 1; en èxit obre el document **primer**, emet el lead, guarda `receipt = { product, profile, activity, activityOther, hasBoat, intent, name }`, reinicia i va a `'done'`.
  - `leaveToEntry` (existent, sense canvis).
  - `NEXT_FIELD = { name: 'email', email: 'phone', phone: 'privacy' }`; `FIELD_HINTS.email.enterkeyhint = 'next'`.

- [ ] **Step 1: Tests**

```js
// tests/form-flow.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { advanceStep1, handleSubmit, leaveToEntry } from '../site/js/form/flow.js';
import { emptyForm } from '../site/js/form/model.js';

const PRODUCTS = [{ id: 'model-a', name: 'Modelo A' }];
const contact = { ...emptyForm({ product: 'model-a' }), name: 'Ana', email: 'Ana@Example.com', phone: '+34 600 00 00 00', privacy: true, newsletter: true };
const full = { ...contact, profile: 'profesional', activity: 'vela', hasBoat: 'si', intent: 'no' };

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

test('pas 1 vàlid: desa un id, emet el lead parcial amb consentiment i passa al pas 2', () => {
  const { calls, deps } = harness();
  assert.equal(advanceStep1(contact, deps), true);
  assert.deepEqual(call(calls, 'setLeadId'), ['setLeadId', 'id-1']);
  assert.deepEqual(call(calls, 'emitPartial')[1], {
    id: 'id-1', stage: 'step1', name: 'Ana', email: 'ana@example.com', phone: '+34 600 00 00 00',
    privacy: true, newsletter: true, lang: 'es', origin: 'tauleta',
  });
  assert.deepEqual(call(calls, 'goTo'), ['goTo', 'step2']);
});
test('pas 1: el perfil triat a l\'inici viatja al lead parcial', () => {
  const { calls, deps } = harness();
  advanceStep1({ ...contact, profile: 'particular' }, deps);
  assert.equal(call(calls, 'emitPartial')[1].profile, 'particular');
});
test('pas 1 invàlid (sense privacitat): errors abans de seguir, no emet ni avança', () => {
  const { calls, deps } = harness();
  assert.equal(advanceStep1({ ...contact, privacy: false }, deps), false);
  assert.deepEqual(call(calls, 'setErrors')[1], { privacy: 'privacy' });
  assert.deepEqual(names(calls), ['setErrors', 'bumpAttempt']);
});
test('tornar al pas 1 i continuar de nou reutilitza l\'id i emet el lead parcial actualitzat', () => {
  const { calls, deps } = harness({ leadId: 'id-0', newId: () => { throw new Error('no ha de crear un id nou'); } });
  advanceStep1({ ...contact, phone: '600 11 22 33' }, deps);
  assert.equal(call(calls, 'emitPartial')[1].id, 'id-0');
  assert.equal(call(calls, 'emitPartial')[1].phone, '600 11 22 33');
});
test('enviament final: obre el document PRIMER, després emet el lead i neteja per al següent visitant', () => {
  const { calls, deps } = harness({ leadId: 'id-0' });
  assert.equal(handleSubmit(full, deps), true);
  assert.equal(names(calls)[0], 'openDocument');
  const lead = call(calls, 'emitLead')[1];
  assert.deepEqual([lead.contact.id, lead.profiling.id, lead.contact.profile, lead.profiling.activity, lead.profiling.hasBoat, lead.profiling.intent], ['id-0', 'id-0', 'profesional', 'vela', 'si', 'no']);
  assert.deepEqual(call(calls, 'setReceipt')[1], { product: 'model-a', profile: 'profesional', activity: 'vela', activityOther: '', hasBoat: 'si', intent: 'no', name: 'Ana' });
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
test('enviament final sense perfil: error al pas 2, cap document, cap lead', () => {
  const { calls, deps } = harness();
  assert.equal(handleSubmit({ ...contact, profile: '' }, deps), false);
  assert.deepEqual(call(calls, 'setErrors')[1], { profile: 'profileRequired' });
  assert.deepEqual(call(calls, 'goTo'), ['goTo', 'step2']);
  assert.equal(names(calls).includes('openDocument') || names(calls).includes('emitLead'), false);
});
test('enviament final amb un error de contacte torna al pas 1', () => {
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

const leaveHarness = (search) => {
  const calls = [];
  const rec = (name) => (...args) => calls.push([name, ...args]);
  return { calls, deps: { products: PRODUCTS, search, dispatch: rec('dispatch'), setErrors: rec('setErrors'), setLeadId: rec('setLeadId'), goTo: rec('goTo') } };
};
test('tauleta: en tornar a l\'inici es descarta el que ha escrit el visitant (dades, perfil, errors i id de lead)', () => {
  const { calls, deps } = leaveHarness('?o=tauleta&producto=model-a');
  leaveToEntry(deps);
  assert.deepEqual(call(calls, 'dispatch')[1], { type: 'reset', initial: { product: 'model-a' } });
  assert.deepEqual(call(calls, 'setLeadId'), ['setLeadId', '']);
  assert.deepEqual(call(calls, 'goTo'), ['goTo', 'entry']);
});
test('mòbil: en tornar a l\'inici es conserva la sessió (només es netegen els errors)', () => {
  const { calls, deps } = leaveHarness('');
  leaveToEntry(deps);
  assert.deepEqual(names(calls), ['setErrors', 'goTo']);
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
  assert.deepEqual(FIELD_HINTS.email, { autocomplete: 'email', inputmode: 'email', autocapitalize: 'none', spellcheck: 'false', enterkeyhint: 'next' });
  assert.deepEqual(FIELD_HINTS.name, { autocomplete: 'name', autocapitalize: 'words', enterkeyhint: 'next' });
  assert.deepEqual(FIELD_HINTS.phone, { autocomplete: 'tel', inputmode: 'tel', enterkeyhint: 'next' });
  assert.deepEqual(Object.keys(FIELD_HINTS).sort(), ['email', 'name', 'phone']);
});
test('applyFieldHints aplica els atributs als camps presents i compta els aplicats', () => {
  const doc = fakeDoc(['email']);
  assert.equal(applyFieldHints(doc), 1);
  assert.equal(doc.els.email.attrs.inputmode, 'email');
});
test('Intro avança: nom → correu → telèfon → privacitat', () => {
  assert.deepEqual(NEXT_FIELD, { name: 'email', email: 'phone', phone: 'privacy' });
  const doc = fakeDoc(['email', 'phone', 'privacy']);
  const a = enter('name');
  assert.equal(advanceOnEnter(a, doc), true);
  assert.deepEqual([a.prevented, doc.els.email.focused], [true, true]);
  assert.equal(advanceOnEnter(enter('email'), doc), true);
  assert.equal(doc.els.phone.focused, true);
  assert.equal(advanceOnEnter(enter('phone'), doc), true);
  assert.equal(doc.els.privacy.focused, true);
});
test('altres tecles, altres elements o un destí que no existeix no fan res', () => {
  const doc = fakeDoc(['email']);
  assert.equal(advanceOnEnter(enter('name', { key: 'a' }), doc), false);
  assert.equal(advanceOnEnter({ ...enter('name'), target: { name: 'name', tagName: 'SELECT' } }, doc), false);
  assert.equal(advanceOnEnter(enter('phone'), doc), false);
  assert.equal(advanceOnEnter(enter('altre'), doc), false);
});
```

- [ ] **Step 2: Veure'ls fallar.** Run: `node --test tests/form-flow.test.mjs tests/form-hints.test.mjs 2>&1 | grep -E "^# (pass|fail)"` → Expected: fallen.

- [ ] **Step 3: Implementar**

A `site/js/form/hints.js`: `email: { …, enterkeyhint: 'next' }` i `export const NEXT_FIELD = { name: 'email', email: 'phone', phone: 'privacy' };` (actualitzar el comentari: «Intro avança al camp següent en lloc d'enviar el pas; a l'últim camp de text passa a la casella de privacitat»).

A `site/js/form/flow.js`:
- `advanceStep1(values, { search, lang, leadId, newId, setLeadId, setErrors, bumpAttempt, emitPartial, goTo })`: igual que ara però `validateStep1(values)` (sense `products`).
- `handleSubmit`: igual que ara, amb `receipt = { product: values.product, profile: values.profile, activity: values.activity, activityOther: values.activityOther, hasBoat: values.hasBoat, intent: values.intent, name: values.name }` i `submitForm(values, { id: leadId || newId(), lang, origin: resolveOrigin(search) })` (ja no passa `products` a `submitForm`; `products` només serveix per a `resolveProduct`).
- `leaveToEntry`: sense canvis.

`site/js/app.js`: substituir pel fitxer següent.

```js
import { CONFIG } from './config.js';
import { DICT, resolveLang } from './i18n.js';
import { contactLinks } from './messages.js';
import { icon } from './icons.js';
import { isExtra1Enabled, legalQuery, resolveProduct } from './form/context.js';
import { PROFILES, emptyForm, formReducer } from './form/model.js';
import { clearError } from './form/validate.js';
import { newLeadId } from './form/lead.js';
import { advanceStep1, handleSubmit, leaveToEntry } from './form/flow.js';
import { toSession } from './form/session.js';
import { focusFirstError, focusStepHeading } from './form/focus.js';
import { advanceOnEnter, applyFieldHints } from './form/hints.js';
import { createChrome } from './ui/chrome.js';
import { createEntryScreen } from './ui/entry-screen.js';
import { createStepContact } from './ui/step-contact.js';
import { createStepProfile } from './ui/step-profile.js';
import { createDoneScreen } from './ui/done-screen.js';

const R = window.React;
const T = window.TSF;
const h = R.createElement;
const search = window.location.search;
const extra1 = isExtra1Enabled(CONFIG, search);

const Header = createChrome({ h, T, brand: CONFIG.brand, languages: CONFIG.languages });
const EntryScreen = createEntryScreen({ h, T, icon });
const StepContact = createStepContact({ h, T });
const StepProfile = createStepProfile({ h, T });
const DoneScreen = createDoneScreen({ h, T, icon });

const emit = (name) => (detail) => window.dispatchEvent(new CustomEvent(name, { detail }));
const openDocument = () => { if (CONFIG.dossierUrl) window.open(CONFIG.dossierUrl, '_blank', 'noopener'); };

function App() {
  const [lang, setLang] = R.useState(() => resolveLang(search, CONFIG));
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
    if (view === 'step1') applyFieldHints(document);
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

  // El mateix xip de perfil a l'inici, al pas 2 i als missatges: una sola dada (values.profile).
  const profileOptions = extra1
    ? PROFILES.map((p) => ({ value: p, label: t.form.profiles[p] }))
    : [{ value: 'profesional', label: t.profileDistribuidor }, { value: 'particular', label: t.profileParticular }];

  const screens = {
    entry: () => h(EntryScreen, {
      t, links: contactLinks(CONFIG, t, sessionOf(values)), email: CONFIG.email, legalQuery: query,
      profile: values.profile, profileLegend: extra1 ? t.form.entryProfileLegend : t.profileLegend, profileOptions,
      onProfile: (v) => change('profile', v), onClearProfile: () => change('profile', ''),
      onOpenForm: extra1 ? () => setView('step1') : undefined,
    }),
    step1: () => h(StepContact, {
      t, values, errors, onChange: change, onNext: next, onKeyDown: (e) => advanceOnEnter(e, document),
      onBack: () => leaveToEntry({ ...common, dispatch }), privacyHref: `privacy.html${query}#privacy`,
    }),
    step2: () => h(StepProfile, {
      t, products: CONFIG.products, values, errors, onChange: change, onSubmit: submit, onBack: goBack('step1'),
    }),
    done: () => h(DoneScreen, {
      t, emailDelivery: CONFIG.emailDelivery, onOpen: openDocument, onHome: goHome,
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

`site/index.html`: afegir `<link rel="modulepreload" href="js/ui/step-profile.js">` i treure `js/ui/step-product.js`.

- [ ] **Step 4: Passar la suite sencera.** Run: `npm run texts && npm test 2>&1 | grep -E "^# (pass|fail)|^not ok"` → Expected: `# fail 0`. Si falla `html` per un `modulepreload`, corregir `index.html`.

- [ ] **Step 5: Commit**

```bash
git add -A site scripts tests docs/textos-contacte.md
git commit -m "feat: orquestració del flux reordenat amb una sola dada de perfil" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 6: Documentació i comprovació en navegador

**Files:**
- Modify: `README.md`, `DESIGN.md`, `docs/textos-contacte.md` (generat)

- [ ] **Step 1: README.** A la secció «Extra 1» actualitzar:
  - **Recorregut:** inici (pregunta de perfil visible + CTA «Quiero saber más de The Silent Fleet») → pas 1 (nom, correu, telèfon, privacitat, novetats) → pas 2 (perfil, activitat si és Profesional, embarcació, intenció de compra, model; només el perfil és obligatori) → confirmació (s'obre el dossier general).
  - **Esdeveniments:** `tsf:lead-partial` en continuar el pas 1 amb `{ id, stage:'step1', name, email, phone, privacy:true, newsletter, lang, origin, profile? }` (ja amb consentiment); `tsf:lead` en acabar amb `{ contact, profiling, hasProfiling }`; comparteixen `id`. Cap lead amb `privacy:false`.
  - **Missatges:** porten nom, producte, activitat, embarcació i intenció quan existeixen.
  - **Dades a substituir:** `dossierUrl` és el document **general de l'empresa** (ara un PDF de prova); el nom «dossier» i la llista de productes els valida Bruno.
  - **Pendent de Bruno:** treure la línia sobre desar el correu abans del consentiment (ja no aplica).

- [ ] **Step 2: DESIGN.md.** A «Indicador de pas», on diu «L'entrada de l'Extra 1 no porta indicador ni xips de perfil: la primera decisió és un sol clic», canviar-ho per «L'entrada porta la pregunta de perfil (opcional, xips) i un únic botó principal; el pas 1 és de contacte i el pas 2 de perfilació, i només el perfil és obligatori a la perfilació.»

- [ ] **Step 3: Comprovació al navegador, una sola passada.** Amb el servidor de `.claude/launch.json` (`site`, port 8080), a 360×740 i `?lang=es&extra1=1` (forçar la recàrrega dels mòduls amb `fetch(url,{cache:'reload'})`):
  1. Inici: xips «Particular/Profesional» visibles; triar-ne un canvia el WhatsApp (conté el text del perfil); CTA «Quiero saber més…».
  2. Pas 1: indicador 1 de 2, camps de contacte, casella obligatòria; enviar buit mostra errors i no avança; continuar emet `tsf:lead-partial` amb `privacy:true` i el perfil de l'inici.
  3. Pas 2: indicador 2 de 2, el perfil ja marcat; Profesional mostra «Actividad principal» (i «Otra actividad» amb «Otra»); Particular no; canviar de Profesional a Particular esborra l'activitat; enviar sense perfil mostra l'error.
  4. Enviar bé: s'obre el PDF de prova, confirmació, WhatsApp amb nom, activitat, embarcació i intenció; «Volver al inicio» deixa tot net.
  5. `?lang=pt|ca|en`: cap desbordament horitzontal (`scrollWidth <= innerWidth`); fosc (`data-theme=dark`): xips i indicador visibles.
  Arreglar el que surti en **un sol lot**, comprovar-ho una vegada i parar.

- [ ] **Step 4: Commit**

```bash
git add README.md DESIGN.md docs/textos-contacte.md
git commit -m "docs: flux reordenat (contacte primer, perfilació després) i dossier general" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

## Dades a substituir abans d'activar `extra1`

| On | Valor de prova | Qui el dona |
|---|---|---|
| `products` (`config.js`) | Modelo A / B / C, més l'opció fixa d'assessorament | Bruno |
| `dossierUrl` (`config.js`) | `dossier-prova.pdf` | Bruno: el document general de l'empresa |
| `legalName` (`config.js`) | PENDIENTE… | Bruno |
| `privacyText` (`i18n-form.js`) | Esborrany | Bruno (no és assessorament legal) |
| Nom del document | «dossier» | Bruno |

## Self-review

- **Cobertura:** perfil sempre visible a l'inici (T4, T5) · CTA nou (T3) · pas 1 de contacte amb consentiment (T1, T4, T5) · pas 2 amb perfil (recordat), activitat només Profesional, embarcació, intenció, model, només el perfil obligatori (T1, T4) · document general «dossier» (T3) · lead parcial amb consentiment (T2, T5) · missatges amb totes les dades (T2) · demostració retirada (T3).
- **Placeholders:** cap.
- **Coherència de noms:** `intent`, `hasBoat`, `activity`, `activityOther`, `messageContext.{name,product,activity,boat,intent}`, `StepContact` (pas 1), `StepProfile` (pas 2), `advanceStep1`, `handleSubmit`, `leaveToEntry`, `values.profile` coincideixen entre tasques i tests.
- **Fora d'abast:** enviament real del correu, validació legal, mòbil real.
