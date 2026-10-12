import test from 'node:test';
import assert from 'node:assert/strict';
import { h, T, byType, byName, findAll, textOf } from './helpers/fake-react.mjs';
import { DICT } from '../site/js/i18n.js';
import { CONFIG } from '../site/js/config.js';
import { ACTIVITIES, CONCERNS, ENTHUSIASM, FACTORS, PROFILES, emptyForm } from '../site/js/form/model.js';
import { icon } from '../site/js/icons.js';
import { FIELD_HINTS } from '../site/js/form/hints.js';
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
  t: DICT.es, products: CONFIG.products, values: emptyForm(), errors: {}, onChange: noop, onToggle: noop, onSubmit: noop, onBack: noop, ...extra,
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
  const [wa, mail, cta] = buttons(tree);
  assert.deepEqual([textOf(cta), cta.props.variant, cta.props.onClick], [f.entryCta, undefined, noop]);
  assert.deepEqual([textOf(wa), wa.props.variant, textOf(mail), mail.props.variant], [f.entryWhatsapp, 'outline', f.entryEmail, 'outline']);
  assert.equal(textOf(findAll(tree, (n) => n.type === 'h1')[0]), f.entryTitle);
  assert.equal(deselectable(tree).length, 1, 'el perfil és desmarcable a l\'inici');
});
test('inici amb Extra 1: el CTA principal va després dels contactes, la línia «¿No se abre?» després del CTA i els enllaços legals al final', () => {
  const body = findAll(entry({ onOpenForm: noop }), (n) => n.props?.className === 'page__body')[0];
  const kinds = body.children.map((n) => (typeof n === 'object' && n ? n.type : null));
  assert.ok(kinds.indexOf('T.SectionLabel') < kinds.indexOf('T.Button'), 'els contactes abans del CTA');
  assert.deepEqual(kinds.slice(-3), ['T.Button', 'p', 'T.LegalLinks']);
  assert.equal(textOf(body.children.at(-3)), f.entryCta);
  assert.equal(textOf(body.children.at(-2)), `${DICT.es.contactFallback} ${CONFIG.email}`);
  const stack = body.children.find((n) => n.props?.className === 'page__stack');
  assert.equal(textOf(stack).includes(DICT.es.contactFallback), false, 'ja no és dins del bloc dels contactes');
  assert.ok(textOf(stack).includes(DICT.es.contactHint), 'la línia explicativa es queda amb els botons');
});
test('inici amb Extra 1: escena fotogràfica compacta amb el títol (h1) i el subtítol, i el cos del contacte a sota', () => {
  const tree = entry({ onOpenForm: noop });
  const [stage, body] = tree.children;
  assert.deepEqual([stage.type, stage.props.className, body.props.className], ['section', 'stage tsf-on-dark', 'page__body']);
  const [h1] = findAll(stage, (n) => n.type === 'h1');
  assert.equal(findAll(stage, (n) => n.type === 'h1').length, 1);
  assert.match(h1.props.className, /\bh2\b/, 'títol compacte (28px) per no ocupar tota l\'alçada de la pantalla');
  assert.equal(textOf(stage), `${f.entryTitle}${f.entrySubtitle}`);
  assert.equal(findAll(tree, (n) => n.props?.['data-step-heading'] !== undefined).length, 1, 'el focus del canvi de pantalla va al títol');
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
  assert.deepEqual(order, ['name', 'email', 'phonePrefix', 'phone', 'privacy', 'newsletter']);
  assert.deepEqual([byName(tree, 'email')[0].props.type, byName(tree, 'phone')[0].props.type], ['email', 'tel']);
  for (const n of ['name', 'email', 'phonePrefix', 'phone']) assert.equal(byName(tree, n)[0].props.required, true, n);
  assert.equal(byName(tree, 'phonePrefix')[0].props.value, '+34', 'el prefix surt omplert amb +34');
  assert.equal(byName(tree, 'phonePrefix')[0].props.label, f.phonePrefix);
  assert.equal(byName(tree, 'phonePrefix')[0].props.type, 'tel');
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
test('pas 1: botó «Conseguir información →» (submit) i «← Volver»; Intro envia el pas; els errors es veuen abans de seguir', () => {
  let called = 0;
  const tree = contact({ onNext: () => called++, onKeyDown: noop, errors: { name: 'required', email: 'email', privacy: 'privacy' } });
  const [next, back] = buttons(tree);
  assert.deepEqual([next.props.type, next.props.full, textOf(next), back.props.variant, textOf(back)], ['submit', true, 'Conseguir información →', 'link', '← Volver']);
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

test('pas 2: indicador 2 de 2 i preguntes en l\'ordre del brief; l\'activitat no hi surt per a un Particular', () => {
  const tree = profile({ values: { ...emptyForm(), profile: 'particular' } });
  assert.equal(bar(tree).props['aria-valuenow'], 2);
  const order = findAll(tree, (n) => ['T.ChoiceChips', 'T.Select', 'T.Field', 'T.CheckboxGroup'].includes(n.type)).map((n) => n.props.name);
  assert.deepEqual(order, ['profile', 'hasBoat', 'hasElectric', 'enthusiasm', 'concerns', 'intent', 'factors', 'product', 'demo', 'comments']);
});
test('pas 2: Profesional veu l\'activitat; «otra» mostra el camp d\'especificar', () => {
  const pro = profile({ values: { ...emptyForm(), profile: 'profesional' } });
  const order = findAll(pro, (n) => ['T.ChoiceChips', 'T.Select', 'T.Field', 'T.CheckboxGroup'].includes(n.type)).map((n) => n.props.name);
  assert.deepEqual(order, ['profile', 'activity', 'hasBoat', 'hasElectric', 'enthusiasm', 'concerns', 'intent', 'factors', 'product', 'demo', 'comments']);
  assert.deepEqual(byName(pro, 'activity')[0].props.options.map((o) => o.value), ['', ...ACTIVITIES]);
  assert.equal(byName(pro, 'activity')[0].props.options[0].label, f.activityNone, 'es pot tornar a «sense especificar»');
  assert.equal(byName(pro, 'activityOther').length, 0);
  const other = profile({ values: { ...emptyForm(), profile: 'profesional', activity: 'otra' } });
  assert.equal(byName(other, 'activityOther')[0].type, 'T.Field');
});
test('pas 2: només el perfil és obligatori i no es pot desmarcar; la resta és opcional i desmarcable', () => {
  const tree = profile({ values: { ...emptyForm(), profile: 'profesional' } });
  assert.equal(byName(tree, 'profile')[0].props.legend, `${f.profileLegend} *`);
  for (const n of ['hasBoat', 'hasElectric', 'intent']) assert.equal(byName(tree, n)[0].props.legend.endsWith('*'), false, n);
  assert.equal(byName(tree, 'product')[0].props.legend, f.productLegend);
  assert.equal(deselectable(tree).length, 4, 'embarcació, embarcació elèctrica, intenció i producte');
  const demo = byName(tree, 'demo')[0];
  assert.deepEqual([demo.props.label, demo.props.placeholder, demo.props.required], [f.demo, f.demoPlaceholder, undefined]);
});
test('pas 2: embarcació i intenció són Sí/No; el producte afegeix l\'assessorament al final', () => {
  const tree = profile();
  assert.deepEqual(byName(tree, 'hasBoat')[0].props.options.map((o) => o.label), ['Sí', 'No']);
  assert.deepEqual(byName(tree, 'intent')[0].props.options.map((o) => o.label), ['Sí', 'No']);
  assert.deepEqual(byName(tree, 'hasElectric')[0].props.options.map((o) => o.label), ['Sí', 'No']);
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

const done = (extra = {}) => DoneScreen({
  t: DICT.es, emailDelivery: false, dossierHref: 'dossiers/model-a.pdf', dossierFile: 'tsf-model-a.pdf', docMeta: 'Modelo A',
  whatsappHref: 'https://wa.me/1', emailHref: 'mailto:x@y.z', onHome: noop, ...extra,
});
const cardOf = (tree) => findAll(tree, (n) => typeof n.props?.className === 'string' && n.props.className.split(' ').includes('tsf-pdf'))[0];
const link = (tree, text) => findAll(tree, (n) => n.type === 'a' && textOf(n) === text)[0];

test('confirmació: marca d\'èxit, títol, targeta del dossier i descàrrega real', () => {
  const tree = done();
  assert.equal(byType(tree, 'T.SectionHeading')[0].props.title, f.doneTitle);
  const card = cardOf(tree);
  assert.deepEqual([textOf(card), card.props.className], [`${f.doneCardTitle}Modelo A`, 'tsf-pdf tsf-pdf--link']);
  assert.ok(findAll(card, (n) => n.type === 'svg' && n.props['aria-hidden'] === 'true').length === 1, 'icona de document decorativa en lloc de la insígnia «PDF»');
  const dl = link(tree, f.doneDownload);
  const cardLink = findAll(tree, (n) => n.type === 'a' && n.props.className === 'page__doc')[0];
  assert.deepEqual([cardLink.props.href, cardLink.props.download, cardLink.props.tabIndex], ['dossiers/model-a.pdf', 'tsf-model-a.pdf', -1], 'la targeta descarrega el mateix fitxer amb el mateix nom i no és parada de tabulador');
  assert.deepEqual([dl.props.href, dl.props.download], ['dossiers/model-a.pdf', 'tsf-model-a.pdf']);
  assert.equal(link(done({ dossierFile: '' }), f.doneDownload).props.download, '', 'sense nom configurat, el navegador tria el nom');
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
test('confirmació: sense dossier configurat no hi ha targeta ni botó de descàrrega', () => {
  const tree = done({ dossierHref: '' });
  assert.equal(cardOf(tree), undefined);
  assert.equal(link(tree, f.doneDownload), undefined);
  assert.equal(buttons(tree).length, 3);
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
test('pas 2: el xip llarg d\'assessorament de producte té fila pròpia (form__chips--wide); els altres grups no', () => {
  const tree = profile({ values: { ...emptyForm(), profile: 'profesional' } });
  const wrappers = findAll(tree, (n) => n.type === 'div' && String(n.props.className ?? '').includes('form__chips--wide'));
  assert.equal(wrappers.length, 1);
  assert.equal(findAll(wrappers[0], (n) => n.props?.name === 'product').length, 1);
});

test('els camps d\'escriptura porten un exemple com a placeholder (no substitueix l\'etiqueta)', () => {
  const c = contact();
  for (const [name, key] of [['name', 'namePlaceholder'], ['email', 'emailPlaceholder'], ['phone', 'phonePlaceholder']]) {
    const field = byName(c, name)[0];
    assert.equal(field.props.placeholder, f[key], name);
    assert.notEqual(field.props.placeholder, field.props.label, name);
  }
  const other = profile({ values: { ...emptyForm(), profile: 'profesional', activity: 'otra' } });
  assert.equal(byName(other, 'activityOther')[0].props.placeholder, f.activityOtherPlaceholder);
});

const chipsWrapper = (tree, name) => findAll(tree, (n) => n.type === 'div' && typeof n.props.ref === 'function' && findAll(n, (m) => m.props?.name === name).length > 0)[0];
const fakeGroup = () => { const attrs = {}; return { attrs, el: { querySelector: () => ({ setAttribute: (k, v) => { attrs[k] = v; }, removeAttribute: (k) => { delete attrs[k]; } }) } }; };

test('error dels xips: el «!» és decoratiu (aria-hidden) i l\'error té un id perquè el grup hi apunti', () => {
  const tree = profile({ errors: { profile: 'profileRequired' } });
  const [alert] = findAll(tree, (n) => n.props?.role === 'alert');
  assert.equal(alert.props.id, 'profile-err');
  assert.equal(textOf(alert), '! Elige una opción');
  const [bang] = findAll(alert, (n) => n.type === 'span');
  assert.deepEqual([bang.props['aria-hidden'], textOf(bang)], ['true', '! ']);
});
test('error dels xips: el grup (fieldset) queda enllaçat amb aria-describedby i aria-invalid; sense error es desenllaça', () => {
  const withError = fakeGroup();
  chipsWrapper(profile({ errors: { profile: 'profileRequired' } }), 'profile').props.ref(withError.el);
  assert.deepEqual(withError.attrs, { 'aria-describedby': 'profile-err', 'aria-invalid': 'true' });
  const clean = fakeGroup();
  clean.attrs['aria-describedby'] = 'x';
  chipsWrapper(profile(), 'profile').props.ref(clean.el);
  assert.deepEqual(clean.attrs, {});
  chipsWrapper(profile(), 'profile').props.ref(null);
});

test('pas 2: les tres preguntes d\'opinió són llistes de caselles opcionals amb les opcions del formulari original', () => {
  const tree = profile();
  for (const [name, expected] of [['enthusiasm', ENTHUSIASM], ['concerns', CONCERNS], ['factors', FACTORS]]) {
    const group = byName(tree, name)[0];
    assert.equal(group.type, 'T.CheckboxGroup', name);
    assert.deepEqual(group.props.options.map((o) => o.value), expected, name);
    assert.equal(group.props.required, undefined, name);
    assert.equal(group.props.legend, f[`${name}Legend`], name);
  }
});
test('pas 2: marcar una casella crida onToggle amb el camp i el valor; les marcades surten com a values', () => {
  const calls = [];
  const tree = profile({ onToggle: (field, value) => calls.push([field, value]), values: { ...emptyForm(), concerns: ['range'] } });
  const group = byName(tree, 'concerns')[0];
  assert.deepEqual(group.props.values, ['range']);
  group.props.onChange({ target: { value: 'price' } });
  assert.deepEqual(calls, [['concerns', 'price']]);
});
test('pas 2: «Otro» d\'una pregunta d\'opinió mostra el seu camp d\'especificar, i només aquell', () => {
  const tree = profile({ values: { ...emptyForm(), enthusiasm: ['other'], factors: ['price'] } });
  assert.equal(byName(tree, 'enthusiasmOther')[0].props.label, f.otherLabel);
  assert.equal(byName(tree, 'enthusiasmOther')[0].props.placeholder, f.otherPlaceholder);
  assert.equal(byName(tree, 'concernsOther').length, 0);
  assert.equal(byName(tree, 'factorsOther').length, 0);
});
test('pas 2: els comentaris són un camp de text llarg (multiline) opcional', () => {
  const comments = byName(profile(), 'comments')[0];
  assert.deepEqual([comments.props.multiline, comments.props.required, comments.props.label, comments.props.placeholder], [true, undefined, f.comments, f.commentsPlaceholder]);
});
