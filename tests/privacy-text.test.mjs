import test from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../site/js/config.js';
import { DICT } from '../site/js/i18n.js';
import { resolvePrivacyText } from '../site/js/privacy-text.js';

test('sense Extra 1 el text és el de l\'MVP', () => {
  for (const l of CONFIG.languages) assert.equal(resolvePrivacyText(DICT[l], CONFIG, false), DICT[l].privacyText);
});
test('amb Extra 1 el text diu qui és el responsable i el correu, sense marcadors per substituir', () => {
  for (const l of CONFIG.languages) {
    const text = resolvePrivacyText(DICT[l], CONFIG, true);
    assert.ok(text.includes(CONFIG.legalName), l);
    assert.ok(text.includes(CONFIG.email), l);
    assert.doesNotMatch(text, /\{[a-z]+\}/, l);
  }
});

import { paragraphs } from '../site/js/privacy-text.js';

const words = (s) => s.split(/\s+/).filter(Boolean).length;
test('paragraphs separa el text en blocs; un text sense salts és un sol bloc', () => {
  assert.deepEqual(paragraphs('a.\n\nb.\n\nc.'), ['a.', 'b.', 'c.']);
  assert.deepEqual(paragraphs('només un'), ['només un']);
  assert.deepEqual(paragraphs('a.\n\n\n\n b.\n\n'), ['a.', 'b.']);
});
test('privacitat de l\'Extra 1: 6 paràgrafs curts i complets en cada idioma', () => {
  for (const l of CONFIG.languages) {
    const ps = paragraphs(resolvePrivacyText(DICT[l], CONFIG, true));
    assert.equal(ps.length, 6, l);
    for (const p of ps) {
      assert.ok(words(p) <= 65, `${l}: «${p.slice(0, 30)}…» té ${words(p)} paraules`);
      assert.match(p, /[.]$/, `${l}: «${p.slice(0, 30)}…» no acaba en punt`);
    }
  }
});
test('el responsable, el correu de drets i l\'avís de WhatsApp van cadascun al seu paràgraf', () => {
  for (const l of CONFIG.languages) {
    const ps = paragraphs(resolvePrivacyText(DICT[l], CONFIG, true));
    assert.ok(ps[3].includes(CONFIG.legalName), `${l}: responsable`);
    assert.ok(ps[4].includes(CONFIG.email), `${l}: drets`);
    assert.match(ps[5], /WhatsApp/, `${l}: WhatsApp`);
  }
});
test('privacitat de l\'MVP: un sol paràgraf', () => {
  for (const l of CONFIG.languages) assert.equal(paragraphs(DICT[l].privacyText).length, 1, l);
});
