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
test('el botó d\'entrada és «Saber más» i les seves traduccions', () => {
  assert.deepEqual(
    CONFIG.languages.map((l) => DICT[l].form.entryCta),
    ['Saber más', 'Saber-ne més', 'Saber mais', 'Learn more'],
  );
});
test('el text de privacitat de l\'Extra 1 també explica què passa si t\'escriuen per WhatsApp o correu', () => {
  for (const l of CONFIG.languages) assert.match(DICT[l].form.privacyText, /WhatsApp/, l);
});
test('el formulari no promet un PDF: el document és sempre «ficha» (cap «PDF» als literals visibles)', () => {
  for (const l of CONFIG.languages) for (const s of leaves(DICT[l].form)) assert.doesNotMatch(s, /PDF/, s);
});
test('el text de privacitat no diu «correio» (en portuguès és correu postal)', () => {
  assert.doesNotMatch(DICT.pt.form.privacyText, /correio/);
  assert.doesNotMatch(DICT.pt.privacyText, /correio/);
});
test('el literal de l\'asterisc existeix en els 4 idiomes i comença per «*»', () => {
  for (const l of CONFIG.languages) assert.match(DICT[l].form.requiredNote, /^\* \S/, l);
});
