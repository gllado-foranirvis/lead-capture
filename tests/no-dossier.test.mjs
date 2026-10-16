import test from 'node:test';
import assert from 'node:assert/strict';
import { h, T, byName, findAll, textOf } from './helpers/fake-react.mjs';
import { CONFIG } from '../site/js/config.js';
import { DICT, dictFor } from '../site/js/i18n.js';
import { isDossierEnabled, isDossierPreview, legalQuery } from '../site/js/form/context.js';
import { emptyForm } from '../site/js/form/model.js';
import { icon } from '../site/js/icons.js';
import { createStepProfile } from '../site/js/ui/step-profile.js';
import { createDoneScreen } from '../site/js/ui/done-screen.js';

const noop = () => {};
const StepProfile = createStepProfile({ h, T });
const DoneScreen = createDoneScreen({ h, T, icon });
const DOSSIER_WORD = /dossier|pdf|descarg|descàrr|download/i;
const all = (tree) => textOf(tree);

test('versió sense dossier: interruptor per config i per ?dossier=0', () => {
  assert.equal(isDossierEnabled({}, ''), true);
  assert.equal(isDossierEnabled({ dossier: false }, ''), false);
  assert.equal(isDossierEnabled({ dossier: true }, '?dossier=0'), false);
  assert.match(legalQuery('es', true, false), /&dossier=0$/);
  // Previsualitzar el dossier amb config.dossier:false: ?dossier=1 el torna a activar i els enllaços legals ho conserven.
  assert.equal(isDossierEnabled({ dossier: false }, '?dossier=1'), true);
  assert.equal(isDossierEnabled({}, '?dossier=1'), true);
  assert.equal(isDossierPreview({ dossier: false }, '?dossier=1'), true);
  assert.equal(isDossierPreview({ dossier: true }, '?dossier=1'), false);
  assert.equal(isDossierPreview({ dossier: false }, ''), false);
  assert.equal(legalQuery('es', true, true, true), '?lang=es&extra1=1&dossier=1');
  assert.equal(legalQuery('es', true), '?lang=es&extra1=1');
});
test('versió sense dossier: cap literal de l\'usuari parla de dossier ni de descàrrega, en tots els idiomes', () => {
  for (const l of CONFIG.languages) {
    const f = dictFor(l, false).form;
    for (const key of ['entrySubtitle', 'step1Subtitle', 'submit', 'doneTitle', 'doneText', 'privacyText'])
      assert.doesNotMatch(f[key], DOSSIER_WORD, `${l}.${key}`);
    assert.notEqual(f.privacyText, DICT[l].form.privacyText, l);
    assert.equal(dictFor(l, true), DICT[l], l);
  }
});
test('pas 2 sense dossier: no es pregunta el producte', () => {
  const props = { t: DICT.es, products: CONFIG.products, values: emptyForm(), errors: {}, onChange: noop, onToggle: noop, onSubmit: noop, onBack: noop };
  assert.equal(byName(StepProfile(props), 'products').length, 1);
  assert.equal(byName(StepProfile({ ...props, askProduct: false }), 'products').length, 0);
});
test('confirmació sense dossier: cap targeta ni botó de descàrrega', () => {
  const t = dictFor('es', false);
  const tree = DoneScreen({ t, emailDelivery: false, docs: [], onDownloadAll: noop, whatsappHref: 'wa', emailHref: 'mail', onHome: noop });
  assert.doesNotMatch(all(tree), DOSSIER_WORD);
  assert.equal(findAll(tree, (n) => n.type === 'a' && n.props.download !== undefined).length, 0);
});
