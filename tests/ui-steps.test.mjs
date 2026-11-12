import test from 'node:test';
import assert from 'node:assert/strict';
import { h, T, byType, byName, findAll, textOf } from './helpers/fake-react.mjs';
import { DICT } from '../site/js/i18n.js';
import { CONFIG } from '../site/js/config.js';
import { emptyForm } from '../site/js/form/model.js';
import { icon } from '../site/js/icons.js';
import { FIELD_HINTS } from '../site/js/form/hints.js';
import { createStepIndicator } from '../site/js/ui/step-indicator.js';
import { createEntryScreen } from '../site/js/ui/entry-screen.js';
import { createStepContact } from '../site/js/ui/step-contact.js';
import { createDoneScreen } from '../site/js/ui/done-screen.js';

const noop = () => {};
const StepIndicator = createStepIndicator({ h });
const EntryScreen = createEntryScreen({ h, T, icon });
const StepContact = createStepContact({ h, T });
const DoneScreen = createDoneScreen({ h, T, icon });
const f = DICT.es.form;
const buttons = (tree) => byType(tree, 'T.Button');
const bar = (tree) => findAll(tree, (n) => n.props?.role === 'progressbar')[0];

const entry = (extra = {}) => EntryScreen({
  t: DICT.es, fair: CONFIG.fair, links: { whatsapp: 'wa', email: 'mail' }, email: CONFIG.email, products: CONFIG.products, askProduct: true,
  values: emptyForm(), onChange: noop, onToggle: noop, onContactClick: noop, legalQuery: '?lang=es', ...extra,
});
const contact = (extra = {}) => StepContact({
  t: DICT.es, products: CONFIG.products, askProduct: true, values: emptyForm(), errors: {}, onChange: noop, onToggle: noop, onSubmit: noop, onBack: noop,
  privacyHref: 'privacy.html?lang=es#privacy', ...extra,
});

test('indicador: text visible, barra accessible i segments plens segons el pas', () => {
  const tree = StepIndicator({ step: 1, total: 2, label: 'Paso 1 de 2' });
  assert.ok(textOf(tree).includes('Paso 1 de 2'));
  assert.deepEqual([bar(tree).props['aria-valuenow'], bar(tree).props['aria-valuetext'], bar(tree).props['aria-label']], [1, 'Paso 1 de 2', 'Paso 1 de 2']);
  const on = (step) => findAll(StepIndicator({ step, total: 2, label: 'x' }), (n) => n.type === 'span' && n.props.className.includes('steps__seg--on')).length;
  assert.deepEqual([on(1), on(2)], [1, 2]);
});

test('inici amb Extra 1: el nom de la fira dins de l\'escena, sense cap pregunta de perfil', () => {
  const tree = entry({ onOpenForm: noop });
  const [stage] = tree.children;
  assert.ok(textOf(stage).includes('Enertech 2026'));
  assert.equal(byType(tree, 'T.ChoiceChips').length, 0);
  assert.equal(textOf(findAll(tree, (n) => n.type === 'h1')[0]), f.entryTitle);
});
test('inici: els productes són caselles de marcatge múltiple (com al pas de dades), marcades segons values.products', () => {
  const calls = [];
  const tree = entry({ onOpenForm: noop, values: { ...emptyForm(), products: ['sifly', 'tko'] }, onToggle: (...a) => calls.push(a) });
  const [group] = byType(tree, 'T.CheckboxGroup');
  assert.deepEqual([group.props.legend, group.props.name], [f.productLegend, 'products']);
  assert.deepEqual(group.props.options.map((o) => o.value), [...CONFIG.products.map((p) => p.id), 'asesoramiento']);
  assert.deepEqual(group.props.values, ['sifly', 'tko']);
  group.props.onChange({ target: { value: 'boatee' } });
  assert.deepEqual(calls, [['products', 'boatee']]);
});
test('inici: la ciutat és un camp de text (city) que avisa del canvi', () => {
  const calls = [];
  const tree = entry({ onOpenForm: noop, onChange: (...a) => calls.push(a) });
  const [city] = byName(tree, 'city');
  assert.deepEqual([city.props.label, city.props.placeholder], [f.cityLabel, f.cityPlaceholder]);
  city.props.onChange({ target: { value: 'Lisboa' } });
  assert.deepEqual(calls, [['city', 'Lisboa']]);
});
test('inici: ordre productes → ciutat → contacte → CTA → línia de recuperació → enllaços legals', () => {
  const body = findAll(entry({ onOpenForm: noop }), (n) => n.props?.className === 'page__body')[0];
  const kinds = body.children.map((n) => n?.props?.name ?? n?.props?.className ?? n?.type ?? null);
  assert.deepEqual(kinds.filter(Boolean), ['form__products', 'city', 'page__group', 'page__cta', 'body-sm page__note', 'T.LegalLinks']);
  const group = body.children.find((n) => n.props?.className === 'page__group');
  assert.deepEqual(group.children.map((n) => n.type ?? null), ['T.SectionLabel', 'div'], 'etiqueta i botons de contacte formen un grup');
  assert.equal(textOf(body.children.at(-2)), `${DICT.es.contactFallback} ${CONFIG.email}`);
});
test('inici: WhatsApp i correu són enllaços i el clic ho notifica sense canviar l\'href', () => {
  const calls = [];
  const [wa, mail, cta] = buttons(entry({ onOpenForm: noop, onContactClick: (b) => calls.push(b) }));
  assert.deepEqual([textOf(wa), wa.props.variant, wa.props.href, textOf(mail), mail.props.variant, mail.props.href], [f.entryWhatsapp, 'outline', 'wa', f.entryEmail, 'outline', 'mail']);
  assert.deepEqual([textOf(cta), cta.props.variant], [f.entryCta, undefined]);
  wa.props.onClick(); mail.props.onClick();
  assert.deepEqual(calls, ['whatsapp', 'email']);
});
test('inici sense dossier: no es pregunta el producte, però sí la ciutat i el nom de la fira', () => {
  const tree = entry({ onOpenForm: noop, askProduct: false });
  assert.equal(byName(tree, 'products').length, 0);
  assert.equal(byName(tree, 'city').length, 1);
  assert.ok(textOf(tree).includes('Enertech 2026'));
});
test('inici sense Extra 1 (MVP): només títol, contacte i WhatsApp principal; cap pregunta', () => {
  const tree = entry();
  assert.equal(byName(tree, 'products').length + byName(tree, 'city').length + byType(tree, 'T.ChoiceChips').length, 0);
  assert.equal(buttons(tree).length, 2);
  assert.equal(buttons(tree)[0].props.variant, undefined);
});

test('pas 1: indicador 1 de 2, camps de contacte obligatoris amb el teclat adequat, sense xips', () => {
  const tree = contact();
  assert.equal(bar(tree).props['aria-valuenow'], 1);
  assert.ok(textOf(tree).includes('Paso 1 de 2') && textOf(tree).includes(f.requiredNote));
  const order = findAll(tree, (n) => ['T.Field', 'T.Checkbox'].includes(n.type)).map((n) => n.props.name);
  assert.deepEqual(order, ['name', 'email', 'phonePrefix', 'phone', 'privacy', 'newsletter']);
  assert.equal(byName(tree, 'city').length, 0, 'la ciutat ja s\'ha demanat a l\'inici');
  assert.deepEqual([byName(tree, 'email')[0].props.type, byName(tree, 'phone')[0].props.type], ['email', 'tel']);
  for (const n of ['name', 'email', 'phonePrefix', 'phone']) assert.equal(byName(tree, n)[0].props.required, true, n);
  assert.equal(byName(tree, 'phonePrefix')[0].props.value, '+34', 'el prefix surt omplert amb +34');
  assert.equal(byName(tree, 'phonePrefix')[0].props.label, f.phonePrefix);
  assert.equal(byName(tree, 'phonePrefix')[0].props.type, 'tel');
  assert.equal(byType(tree, 'T.ChoiceChips').length, 0);
});
test('pas 1: els productes són les mateixes caselles multi-tria, marcades segons values.products, entre el telèfon i el consentiment', () => {
  const calls = [];
  const tree = contact({ values: emptyForm({ products: ['tko'] }), onToggle: (...a) => calls.push(a) });
  const [group] = byName(tree, 'products');
  assert.deepEqual([group.type, group.props.legend, group.props.values], ['T.CheckboxGroup', f.productLegend, ['tko']]);
  assert.deepEqual(group.props.options.map((o) => o.label), [...CONFIG.products.map((p) => p.name), f.productAdvice]);
  group.props.onChange({ target: { value: 'sifly' } });
  assert.deepEqual(calls, [['products', 'sifly']]);
  const names = findAll(tree, (n) => ['T.Field', 'T.CheckboxGroup', 'T.Checkbox'].includes(n.type)).map((n) => n.props.name);
  assert.deepEqual(names, ['name', 'email', 'phonePrefix', 'phone', 'products', 'privacy', 'newsletter']);
  assert.equal(byName(contact({ askProduct: false }), 'products').length, 0);
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
test('pas 1: botó d\'enviar (submit) i «← Volver»; Intro envia el formulari; els errors es veuen abans de seguir', () => {
  let called = 0;
  const tree = contact({ onSubmit: () => called++, onKeyDown: noop, errors: { name: 'required', email: 'email', privacy: 'privacy' } });
  const [next, back] = buttons(tree);
  assert.deepEqual([next.props.type, next.props.full, textOf(next), back.props.variant, textOf(back)], ['submit', true, f.submit, 'link', '← Volver']);
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

test('pas 1: el telèfon s\'agrupa mentre s\'escriu segons el prefix, i en canviar de prefix es reagrupa el número', () => {
  const calls = [];
  const onChange = (field, v) => calls.push([field, v]);
  byName(contact({ onChange }), 'phone')[0].props.onChange({ target: { value: '666666666', selectionStart: 9 } });
  byName(contact({ onChange, values: { ...emptyForm(), phonePrefix: '+351' } }), 'phone')[0].props.onChange({ target: { value: '912345678', selectionStart: 9 } });
  byName(contact({ onChange, values: { ...emptyForm(), phone: '912 34 56 78' } }), 'phonePrefix')[0].props.onChange({ target: { value: '+351' } });
  byName(contact({ onChange, values: { ...emptyForm(), phone: '123456789' } }), 'phonePrefix')[0].props.onChange({ target: { value: '+1' } });
  assert.deepEqual(calls, [['phone', '666 66 66 66'], ['phone', '912 345 678'], ['phonePrefix', '+351'], ['phone', '912 345 678'], ['phonePrefix', '+1']]);
});

test('pas 1: un número internacional escrit al camp del número en separa el prefix', () => {
  const calls = [];
  const onChange = (field, v) => calls.push([field, v]);
  const phone = (value, selectionStart = value.length) => byName(contact({ onChange }), 'phone')[0].props.onChange({ target: { value, selectionStart } });
  phone('+351912345678');
  phone('+34 666666666');
  phone('+34');
  assert.deepEqual(calls, [['phonePrefix', '+351'], ['phone', '912 345 678'], ['phonePrefix', '+34'], ['phone', '666 66 66 66'], ['phone', '+34']]);
});
test('pas 1: teclejar de més al telèfon queda tallat a les xifres permeses', () => {
  const calls = [];
  const tree = contact({ onChange: (field, v) => calls.push([field, v]) });
  byName(tree, 'phone')[0].props.onChange({ target: { value: '111 11 11 1111111111111111', selectionStart: 26 } });
  assert.deepEqual(calls, [['phone', '111 11 11 111111']]);
});
test('pas 1: el marcador del número segueix el prefix i el prefix porta suggeriments', () => {
  const placeholder = (values, t = DICT.es) => byName(contact({ t, values: { ...emptyForm(), ...values } }), 'phone')[0].props.placeholder;
  assert.equal(placeholder({}), '600 00 00 00');
  assert.equal(placeholder({}, DICT.pt), '600 00 00 00', 'amb +34 el marcador no depèn de l\'idioma');
  assert.equal(placeholder({ phonePrefix: '+351' }, DICT.en), '912 345 678');
  assert.equal(placeholder({ phonePrefix: '+44' }, DICT.pt), DICT.pt.form.phonePlaceholder);
  const [list] = byType(contact(), 'datalist');
  assert.equal(list.props.id, 'phone-prefixes');
  assert.deepEqual([list.children[0].props.value, list.children[0].props.label, list.children.length], ['+34', 'España (+34)', 16]);
  assert.equal(FIELD_HINTS.phonePrefix.list, 'phone-prefixes');
});

const DOC_A = { href: 'dossiers/sifly.en.pdf', meta: 'Sifly' };
const DOC_B = { href: 'dossiers/tko.en.pdf', meta: 'TKO' };
const done = (extra = {}) => DoneScreen({
  t: DICT.es, emailDelivery: false, docs: [DOC_A], onDownloadAll: noop, onContactClick: noop,
  whatsappHref: 'https://wa.me/1', emailHref: 'mailto:x@y.z', onHome: noop, ...extra,
});
const cardOf = (tree) => findAll(tree, (n) => typeof n.props?.className === 'string' && n.props.className.split(' ').includes('tsf-pdf'))[0];
const link = (tree, text) => findAll(tree, (n) => n.type === 'a' && textOf(n) === text)[0];

test('confirmació: marca d\'èxit, títol, targeta del dossier i descàrrega real', () => {
  const tree = done();
  assert.equal(byType(tree, 'T.SectionHeading')[0].props.title, f.doneTitle);
  const card = cardOf(tree);
  assert.deepEqual([textOf(card), card.props.className], [`${f.doneCardTitle}Sifly`, 'tsf-pdf tsf-pdf--link']);
  assert.ok(findAll(card, (n) => n.type === 'svg' && n.props['aria-hidden'] === 'true').length === 1, 'icona de document decorativa en lloc de la insígnia «PDF»');
  const dl = link(tree, f.doneDownload);
  const cardLink = findAll(tree, (n) => n.type === 'a' && n.props.className === 'page__doc')[0];
  assert.deepEqual([cardLink.props.href, cardLink.props.download, cardLink.props.tabIndex], ['dossiers/sifly.en.pdf', '', -1], 'la targeta descarrega el mateix fitxer, amb el nom del fitxer, i no és parada de tabulador');
  assert.deepEqual([dl.props.href, dl.props.download], ['dossiers/sifly.en.pdf', '']);
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
  const order = findAll(tree, (n) => (n.type === 'a' && n.props.className !== 'page__doc') || n.type === 'T.Button' || n.props?.className === 'page__doc').map((n) => n.props?.className === 'page__doc' ? 'card' : textOf(n));
  assert.deepEqual(order, ['card', f.doneDownload, f.entryWhatsapp, f.entryEmail, f.doneHome]);
  assert.equal(textOf(tree).includes('PDF'), false, 'cap text visible diu PDF');
});
test('confirmació: WhatsApp i correu notifiquen el clic sense canviar l\'href', () => {
  const calls = [];
  const [wa, mail] = buttons(done({ onContactClick: (b) => calls.push(b) }));
  wa.props.onClick(); mail.props.onClick();
  assert.deepEqual(calls, ['whatsapp', 'email']);
});
test('confirmació: sense dossier configurat no hi ha targeta ni botó de descàrrega', () => {
  const tree = done({ docs: [] });
  assert.equal(cardOf(tree), undefined);
  assert.equal(link(tree, f.doneDownloadAll), undefined);
  assert.equal(link(tree, f.doneDownload), undefined);
  assert.equal(buttons(tree).length, 3);
});
test('confirmació amb un sol PDF: cap botó «descargar todos»', () => {
  assert.equal(link(done(), f.doneDownloadAll), undefined);
  assert.equal(buttons(done()).some((b) => textOf(b) === f.doneDownloadAll), false);
});
test('confirmació amb diversos PDF: una targeta per fitxer (parada de tabulador) i el botó «descargar todos»', () => {
  let all = 0;
  const tree = done({ docs: [DOC_A, DOC_B], onDownloadAll: () => all++ });
  const cards = findAll(tree, (n) => n.type === 'a' && n.props.className === 'page__doc');
  assert.deepEqual(cards.map((c) => [c.props.href, c.props.download, c.props.tabIndex]), [[DOC_A.href, '', undefined], [DOC_B.href, '', undefined]]);
  assert.deepEqual(findAll(tree, (n) => typeof n.props?.className === 'string' && n.props.className.split(' ').includes('tsf-pdf')).map(textOf), [`${f.doneCardTitle}Sifly`, `${f.doneCardTitle}TKO`]);
  assert.equal(link(tree, f.doneDownload), undefined, 'amb diversos fitxers no hi ha el botó d\'un de sol');
  const [all1] = findAll(tree, (n) => n.type === 'T.Button' && textOf(n) === f.doneDownloadAll);
  assert.ok(all1, 'botó «descargar todos»');
  assert.equal(all1.props.variant === undefined || all1.props.variant === 'solid', true);
  all1.props.onClick();
  assert.equal(all, 1);
});
test('confirmació: el subtítol parla del correu només si l\'enviament existeix', () => {
  const sub = (emailDelivery) => byType(done({ emailDelivery }), 'T.SectionHeading')[0].props.subtitle;
  assert.equal(sub(false), f.doneText);
  assert.equal(sub(true), f.doneTextMail);
});

test('inici: el CTA principal té separació pròpia dels contactes (page__cta)', () => {
  const cta = buttons(entry({ onOpenForm: noop })).at(-1);
  assert.equal(textOf(cta), f.entryCta);
  assert.equal(cta.props.className, 'page__cta');
});
test('els camps d\'escriptura porten un exemple com a placeholder (no substitueix l\'etiqueta)', () => {
  const c = contact();
  for (const [name, key] of [['name', 'namePlaceholder'], ['email', 'emailPlaceholder'], ['phone', 'phonePlaceholder']]) {
    const field = byName(c, name)[0];
    assert.equal(field.props.placeholder, f[key], name);
    assert.notEqual(field.props.placeholder, field.props.label, name);
  }
});

const fakeGroup = () => { const attrs = {}; return { attrs, el: { querySelector: () => ({ setAttribute: (k, v) => { attrs[k] = v; }, removeAttribute: (k) => { delete attrs[k]; } }) } }; };

