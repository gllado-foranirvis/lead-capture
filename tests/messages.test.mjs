import test from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../site/js/config.js';
import { DICT } from '../site/js/i18n.js';
import { normalizeNumber, whatsappUrl, mailtoUrl, contactLinks, toggleProfile } from '../site/js/messages.js';

test('toggleProfile: triar, canviar i desmarcar el perfil (és opcional)', () => {
  assert.equal(toggleProfile('', 'particular'), 'particular');
  assert.equal(toggleProfile('particular', 'distribuidor'), 'distribuidor');
  assert.equal(toggleProfile('particular', 'particular'), '');
});

test('normalizeNumber deixa només dígits', () => {
  assert.equal(normalizeNumber('+34 600-00 00.00'), '34600000000');
  assert.equal(normalizeNumber('0034600000000'), '34600000000');
});
test('whatsappUrl codifica accents, ç, ñ i salts de línia', () => {
  const url = whatsappUrl('34600000000', 'Hola,\n\nGràcies, señor ã ·');
  assert.match(url, /^https:\/\/wa\.me\/34600000000\?text=/);
  assert.doesNotMatch(url, /[\s\n]/);
  assert.equal(decodeURIComponent(url.split('text=')[1]), 'Hola,\n\nGràcies, señor ã ·');
});
test('mailtoUrl codifica assumpte i cos', () => {
  const url = mailtoUrl('info@thesilentfleet.com', 'Distribució · Saló', 'Línia 1\n\nLínia 2');
  const q = new URLSearchParams(url.split('?')[1]);
  assert.match(url, /^mailto:info@thesilentfleet\.com\?/);
  assert.equal(q.get('subject'), 'Distribució · Saló');
  assert.equal(q.get('body'), 'Línia 1\n\nLínia 2');
});
test('12 combinacions idioma × perfil generen el missatge correcte', () => {
  for (const lang of CONFIG.languages) for (const profile of ['', 'distribuidor', 'particular']) {
    const d = DICT[lang];
    const m = d.messages[profile || 'none'];
    const { whatsapp, email } = contactLinks(CONFIG, d, profile);
    const wa = decodeURIComponent(whatsapp.split('text=')[1]);
    assert.equal(wa, `${d.greeting}\n\n${m.text}`, `${lang}/${profile}`);
    const q = new URLSearchParams(email.split('?')[1]);
    assert.equal(q.get('subject'), m.subject);
    assert.equal(q.get('body'), `${d.greeting}\n\n${m.text}\n\n${d.closing}`);
  }
});
test('un perfil desconegut o absent cau al missatge genèric, sense petar', () => {
  const base = contactLinks(CONFIG, DICT.es, '');
  for (const bad of ['xx', undefined, null, '__proto__'])
    assert.deepEqual(contactLinks(CONFIG, DICT.es, bad), base, String(bad));
});
test('el número de config es normalitza a l\'enllaç', () => {
  const { whatsapp } = contactLinks({ ...CONFIG, whatsappNumber: '+34 600-00 00 00' }, DICT.es, '');
  assert.match(whatsapp, /^https:\/\/wa\.me\/34600000000\?/);
});
