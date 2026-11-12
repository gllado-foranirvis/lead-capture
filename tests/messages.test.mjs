import test from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../site/js/config.js';
import { DICT } from '../site/js/i18n.js';
import { contactLinks, emailBody, mailtoUrl, normalizeNumber, whatsappText, whatsappUrl } from '../site/js/messages.js';

const wa = (url) => decodeURIComponent(url.split('text=')[1]);
const mail = (url) => new URLSearchParams(url.split('?')[1]);

test('normalizeNumber deixa només dígits', () => {
  assert.equal(normalizeNumber('+34 600-00 00.00'), '34600000000');
  assert.equal(normalizeNumber('0034600000000'), '34600000000');
});
test('whatsappUrl i mailtoUrl codifiquen accents, ç, ñ i salts de línia', () => {
  const url = whatsappUrl('34600000000', 'Hola,\n\nGràcies, señor ã ·');
  assert.doesNotMatch(url, /[\s\n]/);
  assert.equal(wa(url), 'Hola,\n\nGràcies, señor ã ·');
  const m = mailtoUrl('info@thesilentfleet.com', 'Distribució · Saló', 'Línia 1\n\nLínia 2');
  assert.equal(mail(m).get('subject'), 'Distribució · Saló');
  assert.equal(mail(m).get('body'), 'Línia 1\n\nLínia 2');
});
test('sense dades de sessió: el missatge genèric de cada idioma amb el nom de la fira, sense cap resta de Barcelona', () => {
  for (const lang of CONFIG.languages) {
    const d = DICT[lang];
    const { whatsapp, email } = contactLinks(CONFIG, d, {});
    const text = d.message.text.replace('{fair}', 'Enertech 2026');
    assert.equal(wa(whatsapp), `${d.greeting}\n\n${text}`, lang);
    assert.equal(mail(email).get('subject'), d.message.subject.replace('{fair}', 'Enertech 2026'), lang);
    assert.equal(mail(email).get('body'), `${d.greeting}\n\n${text}\n\n${d.closing}`, lang);
    assert.match(wa(whatsapp) + mail(email).get('subject'), /Enertech 2026/, lang);
    assert.doesNotMatch(wa(whatsapp) + mail(email).get('subject'), /Barcelona|Náutico|Nàutic|Boat Show|\{fair\}/, lang);
  }
});
test('sense cap argument de sessió ni de fira, no peta', () => {
  assert.equal(whatsappText(DICT.es), `${DICT.es.greeting}\n\n${DICT.es.message.text.replace('{fair}', '')}`);
});
test('un nom amb símbols arriba intacte als dos canals', () => {
  const name = 'Ana & "Joe" ñ 😀 $& {value}';
  const { whatsapp, email } = contactLinks(CONFIG, DICT.es, { name });
  assert.ok(wa(whatsapp).includes(`Me llamo ${name}.`));
  assert.ok(mail(email).get('body').includes(`Me llamo ${name}.`));
});
test('el número de config es normalitza a l\'enllaç', () => {
  const { whatsapp } = contactLinks({ ...CONFIG, whatsappNumber: '+34 600-00 00 00' }, DICT.es, {});
  assert.match(whatsapp, /^https:\/\/wa\.me\/34600000000\?/);
});

test('amb dades de sessió: les línies van entre el text i el comiat, en ordre', () => {
  const session = { name: 'Ana', product: 'Sifly', city: 'Lisboa' };
  const d = DICT.es;
  const lines = 'Me llamo Ana.\nProducto de interés: Sifly\nCiudad: Lisboa';
  assert.equal(whatsappText(d, session, 'Enertech 2026'), `${d.greeting}\n\n${d.message.text.replace('{fair}', 'Enertech 2026')}\n\n${lines}`);
  assert.equal(emailBody(d, session, 'Enertech 2026'), `${d.greeting}\n\n${d.message.text.replace('{fair}', 'Enertech 2026')}\n\n${lines}\n\n${d.closing}`);
});
test('les línies que no tenen valor no apareixen', () => {
  assert.equal(whatsappText(DICT.ca, { city: 'Lisboa' }, 'Enertech 2026'), `${DICT.ca.greeting}\n\n${DICT.ca.message.text.replace('{fair}', 'Enertech 2026')}\n\nCiutat: Lisboa`);
});
test('cada idioma té les tres línies de dades amb {value}', () => {
  for (const lang of CONFIG.languages) for (const key of ['name', 'product', 'city'])
    assert.match(DICT[lang].messageContext[key], /\{value\}/, `${lang}.${key}`);
});
