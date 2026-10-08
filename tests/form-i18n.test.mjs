import test from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../site/js/config.js';
import { DICT } from '../site/js/i18n.js';
import { ACTIVITIES, PROFILES } from '../site/js/form/model.js';

const ERROR_CODES = ['required', 'profileRequired', 'email', 'phone', 'prefix', 'privacy'];
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

test('el text de privacitat diu què desa el lead parcial: origen, perfil si ja s\'ha indicat i la casella de novetats', () => {
  const parts = {
    es: [/origen/, /si ya lo has indicado/, /casilla de novedades, tu perfil/],
    ca: [/origen/, /si ja l'has indicat/, /casella de novetats, el teu perfil/],
    pt: [/origem/, /se já o indicaste/, /caixa de novidades, o teu perfil/],
    en: [/origin/, /if you have already told us/, /updates box, your profile/],
  };
  for (const l of CONFIG.languages) for (const re of parts[l]) assert.match(DICT[l].form.privacyText, re, `${l} ${re}`);
});
test('el subtítol del pas 2 no promet un dossier personalitzat (el document és un de sol)', () => {
  for (const l of CONFIG.languages) assert.doesNotMatch(DICT[l].form.step2Subtitle, /personali[sz]|tailor/i, l);
});

test('el botó del pas 1 diu que s\'aconsegueix informació', () => {
  assert.deepEqual(CONFIG.languages.map((l) => DICT[l].form.next), ['Conseguir información', 'Aconseguir informació', 'Obter informação', 'Get information']);
});

test('el subtítol del pas 2 no repeteix el títol', () => {
  for (const l of CONFIG.languages) {
    const { step2Title, step2Subtitle } = DICT[l].form;
    const lead = step2Title.split(' ').slice(0, 2).join(' ').toLowerCase();
    assert.equal(step2Subtitle.toLowerCase().includes(lead), false, `${l}: «${lead}»`);
  }
});

test('cada idioma té un exemple per a nom, correu, telèfon i activitat «altra»; el correu i el telèfon tenen forma d\'exemple', () => {
  for (const l of CONFIG.languages) {
    const form = DICT[l].form;
    for (const key of ['namePlaceholder', 'emailPlaceholder', 'phonePlaceholder', 'activityOtherPlaceholder', 'activityNone']) assert.ok(form[key]?.trim(), `${l}.${key}`);
    assert.match(form.emailPlaceholder, /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i, l);
    assert.match(form.phonePlaceholder, /^\d[\d ]+$/, l);
    assert.ok(form.phonePrefix?.trim(), `${l}.phonePrefix`);
    assert.ok(form.errors.prefix.length <= 24, `${l}: el missatge del prefix cap en una columna estreta`);
  }
});
