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
