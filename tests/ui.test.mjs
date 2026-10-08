import test from 'node:test';
import assert from 'node:assert/strict';
import { h, T, byType, byName, findAll, textOf } from './helpers/fake-react.mjs';
import { DICT } from '../site/js/i18n.js';
import { CONFIG } from '../site/js/config.js';
import { emptyForm } from '../site/js/form/model.js';
import { icon } from '../site/js/icons.js';
import { createChrome } from '../site/js/ui/chrome.js';
import { createEntryScreen } from '../site/js/ui/entry-screen.js';
import { createFormScreen } from '../site/js/ui/form-screen.js';

const noop = () => {};
const Header = createChrome({ h, T, brand: CONFIG.brand, languages: CONFIG.languages });
const EntryScreen = createEntryScreen({ h, T, icon });
const FormScreen = createFormScreen({ h, T });

const entry = (extra = {}) => EntryScreen({
  t: DICT.es, links: { whatsapp: 'wa', email: 'mail' }, email: CONFIG.email, profile: '', onProfile: noop, onClearProfile: noop, legalQuery: '?lang=es', ...extra,
});
const form = (extra = {}) => FormScreen({
  t: DICT.es, products: CONFIG.products, values: emptyForm(), errors: {}, onChange: noop, onSubmit: noop, onBack: noop, privacyHref: 'privacy.html?lang=es#privacy', ...extra,
});
const buttons = (tree) => byType(tree, 'T.Button');

test('capçalera: marca i selector d\'idioma amb codis en majúscules', () => {
  const tree = Header({ t: DICT.ca, lang: 'ca', onLang: noop });
  assert.equal(textOf(tree).includes(CONFIG.brand), true);
  const [lang] = byType(tree, 'T.LangSwitch');
  assert.equal(lang.props.value, 'CA');
  assert.deepEqual(lang.props.languages.map((l) => l.code), ['ES', 'CA', 'PT', 'EN']);
});

test('entrada sense Extra 1: com l\'MVP (WhatsApp principal, cap botó nou)', () => {
  const [wa, mail] = buttons(entry());
  assert.equal(wa.props.variant, undefined);
  assert.equal(mail.props.variant, 'outline');
  assert.equal(buttons(entry()).length, 2);
  assert.equal(byType(entry(), 'T.SectionHeading')[0].props.level, 1);
});
test('entrada amb Extra 1: el botó nou és l\'únic principal i WhatsApp passa a secundari', () => {
  const onOpenForm = noop;
  const [cta, wa, mail] = buttons(entry({ onOpenForm }));
  assert.equal(textOf(cta), DICT.es.form.entryCta);
  assert.equal(cta.props.variant, undefined);
  assert.equal(cta.props.onClick, onOpenForm);
  assert.equal(wa.props.variant, 'outline');
  assert.equal(mail.props.variant, 'outline');
  assert.equal(textOf(byType(entry({ onOpenForm }), 'T.SectionLabel')[0]), DICT.es.form.entryContactLabel);
});
test('entrada: línia explicativa, adreça visible i enllaços legals amb la query', () => {
  const tree = entry({ legalQuery: '?lang=es&extra1=1' });
  assert.ok(textOf(tree).includes(DICT.es.contactHint));
  assert.ok(textOf(tree).includes(`${DICT.es.contactFallback} ${CONFIG.email}`));
  const [legal] = byType(tree, 'T.LegalLinks');
  assert.equal(legal.props.links[0].href, 'privacy.html?lang=es&extra1=1');
});
test('entrada: el perfil és desmarcable', () => {
  const wrapper = findAll(entry({ profile: 'particular' }), (n) => n.type === 'div' && typeof n.props.onClick === 'function' && typeof n.props.onKeyDown === 'function');
  assert.equal(wrapper.length, 1);
});

test('formulari: camps de contacte obligatoris amb el tipus de teclat adequat', () => {
  const tree = form();
  assert.equal(byName(tree, 'product')[0].props.required, true);
  assert.deepEqual(byName(tree, 'product')[0].props.options.map((o) => o.value), CONFIG.products.map((p) => p.id));
  for (const [name, type] of [['name', undefined], ['email', 'email'], ['phone', 'tel']]) {
    const [field] = byName(tree, name);
    assert.equal(field.props.required, true, name);
    assert.equal(field.props.type, type, name);
  }
});
test('formulari: el perfil és obligatori (porta «*») i no és desmarcable', () => {
  const [profile] = byName(form(), 'profile');
  assert.ok(profile.props.legend.endsWith(' *'));
  assert.deepEqual(profile.props.options.map((o) => o.label), ['Particular', 'Profesional']);
  const wrappers = findAll(form(), (n) => n.type === 'div' && n.props.onClick && findAll(n, (c) => c.props?.name === 'profile').length);
  assert.equal(wrappers.length, 0);
});
test('formulari: l\'activitat només surt per a Profesional, i «Otra» mostra el camp d\'especificar', () => {
  assert.equal(byName(form({ values: emptyForm({ profile: 'particular' }) }), 'activity').length, 0);
  const pro = form({ values: emptyForm({ profile: 'profesional' }) });
  const [activity] = byName(pro, 'activity');
  assert.equal(activity.props.options.length, 10);
  assert.equal(byName(pro, 'activityOther').length, 0);
  const other = form({ values: { ...emptyForm({ profile: 'profesional' }), activity: 'otra' } });
  assert.equal(byName(other, 'activityOther').length, 1);
});
test('formulari: la perfilació és opcional i les preguntes de sí/no es poden desmarcar', () => {
  const tree = form({ values: { ...emptyForm(), hasElectric: 'si' } });
  assert.ok(textOf(byType(tree, 'T.SectionLabel')[0]).includes('(opcional)'));
  for (const name of ['hasElectric', 'investing', 'demo']) {
    const [c] = byName(tree, name);
    assert.ok(!c.props.required && !String(c.props.legend ?? '').endsWith('*'), name);
  }
  const wrappers = findAll(tree, (n) => n.type === 'div' && n.props.onClick && n.props.onKeyDown);
  assert.equal(wrappers.length, 2);
});
test('formulari: els errors surten en l\'idioma actiu i es tradueixen en canviar-lo', () => {
  const errors = { email: 'email', privacy: 'privacy' };
  const es = form({ errors });
  assert.equal(byName(es, 'email')[0].props.error, DICT.es.form.errors.email);
  const ca = form({ errors, t: DICT.ca });
  assert.equal(byName(ca, 'email')[0].props.error, DICT.ca.form.errors.email);
  assert.equal(byName(ca, 'privacy')[0].props.error, DICT.ca.form.errors.privacy);
  assert.equal(byName(es, 'name')[0].props.error, undefined);
});
test('formulari: privacitat sense marcar, enllaç a pestanya nova, novetats opcional', () => {
  const tree = form();
  const [privacy] = byName(tree, 'privacy');
  assert.equal(privacy.props.checked, false);
  assert.equal(privacy.props.required, true);
  const [link] = byType(privacy, 'a');
  assert.deepEqual([link.props.href, link.props.target, link.props.rel], ['privacy.html?lang=es#privacy', '_blank', 'noopener']);
  assert.equal(byName(tree, 'newsletter')[0].props.required, undefined);
  assert.ok(textOf(byName(tree, 'newsletter')[0]).includes('(opcional)'));
});
test('formulari: botó d\'enviar principal i «← Volver» com a enllaç', () => {
  const [submit, back] = buttons(form());
  assert.deepEqual([submit.props.type, submit.props.full, textOf(submit)], ['submit', true, 'Enviar y descargar el PDF']);
  assert.deepEqual([back.props.variant, textOf(back)], ['link', '← Volver']);
});
test('formulari: enviar no recarrega la pàgina i crida onSubmit', () => {
  let sent = 0;
  const [formEl] = byType(form({ onSubmit: () => sent++ }), 'form');
  const e = { preventDefault() { this.prevented = true; } };
  formEl.props.onSubmit(e);
  assert.equal(e.prevented, true);
  assert.equal(sent, 1);
  assert.equal(formEl.props.noValidate, true);
});
test('formulari: cada control notifica el seu camp amb el valor correcte', () => {
  const calls = [];
  const tree = form({ onChange: (f, v) => calls.push([f, v]) });
  byName(tree, 'name')[0].props.onChange({ target: { value: 'Ana' } });
  byName(tree, 'privacy')[0].props.onChange({ target: { checked: true } });
  assert.deepEqual(calls, [['name', 'Ana'], ['privacy', true]]);
});
