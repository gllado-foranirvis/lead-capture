import test from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../site/js/config.js';
import { DICT } from '../site/js/i18n.js';

const ERROR_CODES = ['required', 'either', 'email', 'phone', 'prefix', 'privacy', 'profileRequired'];
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
  const cta = { es: 'Descargar dossier →', ca: 'Descarregar dossier →', pt: 'Descarregar dossier →', en: 'Download dossier →' };
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
test('el text de privacitat cita la ciutat, el producte, les respostes opcionals del pas 2 i el registre de clics i descàrregues', () => {
  const parts = {
    es: [/la ciudad/, /el producto que te interesa/, /registro del clic/], ca: [/la ciutat/, /el producte que t'interessa/, /registre del clic/],
    pt: [/a cidade/, /o produto que te interessa/, /registo do clique/], en: [/city/, /the product you are interested in/, /record of the click/],
  };
  for (const l of CONFIG.languages) {
    for (const re of parts[l]) assert.match(DICT[l].form.privacyText, re, `${l} ${re}`);
    assert.match(DICT[l].form.privacyText, /embarcaci|embarca[cç]|boat/i, `${l} respostes opcionals`);
    assert.match(DICT[l].form.privacyText, /descarg|descarreg|download/i, `${l} descàrregues`);
  }
});
test('el text de cookies enumera tot el que es desa a cada clic i avisa que es pot relacionar amb les dades deixades', () => {
  const parts = {
    es: [/sistema/, /pantalla/, /zona horaria/, /ciudad/, /dominio/, /idioma de la página y del navegador/, /relacionar/],
    ca: [/sistema/, /pantalla/, /zona horària/, /ciutat/, /domini/, /idioma de la pàgina i del navegador/, /relacionar/],
    pt: [/sistema/, /ecrã/, /fuso horário/, /cidade/, /domínio/, /idioma da página e do navegador/, /relacionados/],
    en: [/system/, /screen size/, /time zone/, /city/, /domain/, /page and browser language/, /linked/],
  };
  for (const l of CONFIG.languages) {
    const text = DICT[l].cookiesText;
    for (const re of parts[l]) assert.match(text, re, `${l} ${re}`);
    assert.match(text, /descarga un dossier|descarrega un dossier|descarrega um dossier|dossier is downloaded/, `${l} descàrrega`);
    assert.match(text, /WhatsApp/, l);
    assert.match(text, /cookies/i, l);
    assert.doesNotMatch(text, /anónim|anònim|anonym|herramientas de medici|ferramentas de medi|eines de mesura|measurement tools/i, l);
  }
});
test('la promesa de descàrrega: l\'inici i la pàgina de dades la diuen, i la línia viva té llista i buit', () => {
  const promise = { es: /descarga/i, ca: /descarrega/i, pt: /descarrega/i, en: /download/i };
  for (const l of CONFIG.languages) {
    const f = DICT[l].form;
    assert.match(f.entrySubtitle, promise[l], `${l}.entrySubtitle`);
    assert.match(f.step1Subtitle, promise[l], `${l}.step1Subtitle`);
    assert.match(f.downloadList, /\{list\}/, l);
    assert.ok(f.downloadNone.trim(), l);
    assert.doesNotMatch(f.downloadList + f.downloadNone + f.entrySubtitle + f.step1Subtitle, /PDF|\bfich?[ae]\b/i, l);
  }
});
test('el pas 2 té els literals de perfilació i els de saltar, sense la localitat de la demostració', () => {
  for (const l of CONFIG.languages) {
    for (const key of ['step2Title', 'step2Subtitle', 'profileLegend', 'skipLabel', 'moreGroup', 'hasBoat', 'hasElectric', 'intent', 'comments', 'yes', 'no']) assert.ok(typeof DICT[l].form[key] === 'string' && DICT[l].form[key].trim(), `${l}.${key}`);
    assert.deepEqual(Object.keys(DICT[l].form.profiles), ['particular', 'profesional'], l);
    assert.equal(Object.keys(DICT[l].form.enthusiasmOptions).length, 6, l);
  }
});
test('el pas 1 té ajuda, etiqueta «un dels dos», botó de continuar i 4 noms de pas sense la paraula PDF', () => {
  for (const l of CONFIG.languages) {
    const f = DICT[l].form;
    for (const key of ['step1Hint', 'eitherTag', 'next', 'saved']) assert.ok(typeof f[key] === 'string' && f[key].trim(), `${l}.${key}`);
    assert.equal(f.stepNames.length, 4, l);
    assert.doesNotMatch(f.stepNames.join(' '), /PDF/i, l);
  }
});
test('inici amb recompensa: títol, botó, nota de l\'idioma i dreçera, sense «PDF» ni «barco» als textos', () => {
  for (const l of CONFIG.languages) {
    const f = DICT[l].form;
    for (const key of ['entryTitle', 'entrySubtitle', 'entryCta', 'entryPdfNote', 'entryContactLabel', 'shortWhatsapp', 'shortEmail']) assert.ok(typeof f[key] === 'string' && f[key].trim(), `${l}.${key}`);
    assert.doesNotMatch(f.entryTitle + f.entrySubtitle + f.entryCta + f.entryPdfNote, /PDF|barco|barc[oa]|boat/i, l);
    assert.doesNotMatch(f.entryCta, /Silent Fleet/, l);
  }
});
