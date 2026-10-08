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
