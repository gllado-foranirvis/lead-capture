import test from 'node:test';
import assert from 'node:assert/strict';
import { h, T, byType, byName, findAll, textOf } from './helpers/fake-react.mjs';
import { createStepIndicator } from '../site/js/ui/step-indicator.js';
import { DICT } from '../site/js/i18n.js';
import { CONFIG } from '../site/js/config.js';
import { emptyForm } from '../site/js/form/model.js';
import { icon } from '../site/js/icons.js';
import { createEntryScreen } from '../site/js/ui/entry-screen.js';
import { createStepProduct } from '../site/js/ui/step-product.js';
import { createStepContact } from '../site/js/ui/step-contact.js';
import { createDoneScreen } from '../site/js/ui/done-screen.js';

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
  let opened = 0;
  const tree = DoneScreen({ t: DICT.es, emailDelivery: false, onOpen: () => { opened++; }, whatsappHref: 'https://wa.me/1', onHome: () => home++ });
  const [open, wa, back] = buttons(tree);
  assert.equal(textOf(open), DICT.es.form.doneOpen);
  assert.equal(open.props.variant, undefined);
  open.props.onClick();
  assert.equal(opened, 1);
  assert.deepEqual([textOf(wa), wa.props.variant, wa.props.href], [DICT.es.form.entryWhatsapp, 'outline', 'https://wa.me/1']);
  assert.deepEqual([back.props.variant, textOf(back)], ['link', DICT.es.form.doneHome]);
  back.props.onClick();
  assert.equal(home, 1);
  assert.ok(textOf(tree).includes(DICT.es.form.doneTitle) || byType(tree, 'T.SectionHeading')[0].props.title === DICT.es.form.doneTitle);
  assert.ok(textOf(tree).includes(DICT.es.form.doneHelp));
});
test('confirmació: el subtítol parla del correu només si l\'enviament existeix', () => {
  const sub = (emailDelivery) => byType(DoneScreen({ t: DICT.es, emailDelivery, onOpen: noop, whatsappHref: 'w', onHome: noop }), 'T.SectionHeading')[0].props.subtitle;
  assert.equal(sub(false), DICT.es.form.doneText);
  assert.equal(sub(true), DICT.es.form.doneTextMail);
});

test('pas 2: cada control notifica el seu camp amb el valor correcte', () => {
  const calls = [];
  const tree = contact({ onChange: (f, v) => calls.push([f, v]) });
  byName(tree, 'name')[0].props.onChange({ target: { value: 'Ana' } });
  byName(tree, 'privacy')[0].props.onChange({ target: { checked: true } });
  assert.deepEqual(calls, [['name', 'Ana'], ['privacy', true]]);
});
test('pas 2: el text de la casella de privacitat és un sol element (l\'etiqueta és flex i perdria l\'espai abans de l\'enllaç)', () => {
  const [privacy] = byName(contact(), 'privacy');
  assert.equal(privacy.children.length, 1);
  assert.equal(privacy.children[0].type, 'span');
  assert.equal(textOf(privacy.children[0]), `${DICT.es.form.consentBefore}${DICT.es.form.consentLink}`);
  assert.match(DICT.es.form.consentBefore, / $/, 'el text anterior acaba en espai');
});
test('pas 2: el formulari reenvia onKeyDown', () => {
  const [formEl] = byType(contact({ onKeyDown: noop }), 'form');
  assert.equal(formEl.props.onKeyDown, noop);
});
