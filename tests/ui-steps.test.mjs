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
