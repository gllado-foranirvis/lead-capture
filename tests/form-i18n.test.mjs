import test from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../site/js/config.js';
import { DICT } from '../site/js/i18n.js';

const ERROR_CODES = ['required', 'email', 'phone', 'prefix', 'privacy'];
const leaves = (o) => Object.values(o).flatMap((v) => (typeof v === 'object' ? leaves(v) : [v]));

test('cada idioma té un missatge per a cada codi d\'error', () => {
  for (const l of CONFIG.languages) {
    assert.deepEqual(Object.keys(DICT[l].form.errors).sort(), [...ERROR_CODES].sort(), l);
  }
});
test('l\'inici té etiqueta i exemple de la ciutat; ja no queden claus de versions anteriors', () => {
  for (const l of CONFIG.languages) for (const key of ['cityLabel', 'cityPlaceholder', 'productLegend']) assert.ok(DICT[l].form[key].trim(), `${l}.${key}`);
  for (const l of CONFIG.languages) for (const key of ['investing', 'profilingTitle', 'pendingTitle', 'entryHint', 'entryProfileLegend', 'demo', 'demoPlaceholder'])
    assert.equal(Object.hasOwn(DICT[l].form, key), false, `${l}.${key}`);
});
test('l\'indicador de pas té {n} i {total}', () => {
  for (const l of CONFIG.languages) assert.match(DICT[l].form.stepOf, /\{n\}.*\{total\}/, l);
});
test('el text de privacitat: responsable, correu, WhatsApp, i no diu que no es guarden dades', () => {
  for (const l of CONFIG.languages) {
    const text = DICT[l].form.privacyText;
    assert.match(text, /\{responsable\}/, l);
    assert.match(text, /\{email\}/, l);
    assert.match(text, /WhatsApp/, l);
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
  const cta = { es: 'Quiero saber más de The Silent Fleet', ca: 'Vull saber més de The Silent Fleet', pt: 'Quero saber mais sobre a The Silent Fleet', en: 'I want to learn more about The Silent Fleet' };
  const submit = { es: 'Acceder al dossier', ca: 'Accedir al dossier', pt: 'Aceder ao dossier', en: 'Get the dossier' };
  for (const l of CONFIG.languages) assert.deepEqual([DICT[l].form.entryCta, DICT[l].form.submit], [cta[l], submit[l]], l);
});
test('la confirmació té una versió amb correu i una sense', () => {
  for (const l of CONFIG.languages) assert.notEqual(DICT[l].form.doneText, DICT[l].form.doneTextMail, l);
});

test('el text de privacitat diu que les dades es desen a Google Sheets (no a Forms)', () => {
  const expect = { es: /Google \(Hojas de cálculo\)/, ca: /Google \(Fulls de càlcul\)/, pt: /Google \(Folhas de cálculo\)/, en: /Google \(Sheets\)/ };
  for (const l of CONFIG.languages) {
    assert.match(DICT[l].form.privacyText, expect[l], l);
    assert.doesNotMatch(DICT[l].form.privacyText, /Formularios|Formularis|Formulários|Forms/, l);
  }
});
test('la pantalla de gràcies té els literals de descàrrega en tots els idiomes i cap resta de l\'obertura automàtica', () => {
  for (const l of CONFIG.languages) {
    for (const k of ['doneDownload', 'doneDownloadAll', 'doneCardTitle', 'doneCardGeneral']) assert.ok(DICT[l].form[k], `${l}.${k}`);
    for (const k of ['doneOpen', 'doneHelp']) assert.equal(DICT[l].form[k], undefined, `${l}.${k} ja no existeix`);
    assert.doesNotMatch(DICT[l].form.doneText, /abiert|obert|abrimos|opened/i, l);
  }
});

test('cada idioma té un exemple per a nom, correu i telèfon; el correu i el telèfon tenen forma d\'exemple', () => {
  for (const l of CONFIG.languages) {
    const form = DICT[l].form;
    for (const key of ['namePlaceholder', 'emailPlaceholder', 'phonePlaceholder', 'cityLabel', 'cityPlaceholder']) assert.ok(form[key]?.trim(), `${l}.${key}`);
    assert.match(form.emailPlaceholder, /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i, l);
    assert.match(form.phonePlaceholder, /^\d[\d ]+$/, l);
    assert.ok(form.phonePrefix?.trim(), `${l}.phonePrefix`);
    assert.ok(form.errors.prefix.length <= 24, `${l}: el missatge del prefix cap en una columna estreta`);
  }
});
test('el text de privacitat cita la ciutat, el producte i el recompte anònim de clics, i no la perfilació antiga', () => {
  const parts = {
    es: [/la ciudad/, /el producto que te interesa/, /anónima/], ca: [/la ciutat/, /el producte que t'interessa/, /anònima/],
    pt: [/a cidade/, /o produto que te interessa/, /anónima/], en: [/city/, /the product you are interested in/, /anonymously/],
  };
  for (const l of CONFIG.languages) {
    for (const re of parts[l]) assert.match(DICT[l].form.privacyText, re, `${l} ${re}`);
    assert.doesNotMatch(DICT[l].form.privacyText, /embarcaci|embarca[cç]|boat|comentari|comments|perfil|profile/i, l);
  }
});
