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
test('sense dades de sessió: els 12 missatges de sempre (4 idiomes × perfil buit, distribuidor, particular)', () => {
  for (const lang of CONFIG.languages) for (const profile of ['', 'distribuidor', 'particular']) {
    const d = DICT[lang];
    const m = d.messages[profile || 'none'];
    const { whatsapp, email } = contactLinks(CONFIG, d, { profile });
    assert.equal(wa(whatsapp), `${d.greeting}\n\n${m.text}`, `${lang}/${profile}`);
    assert.equal(mail(email).get('subject'), m.subject);
    assert.equal(mail(email).get('body'), `${d.greeting}\n\n${m.text}\n\n${d.closing}`);
  }
});
test('sense cap argument de sessió, o amb perfil desconegut, cau al missatge genèric', () => {
  assert.equal(whatsappText(DICT.es), `${DICT.es.greeting}\n\n${DICT.es.messages.none.text}`);
  assert.equal(whatsappText(DICT.es, { profile: 'inventat' }), whatsappText(DICT.es));
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
  const session = { profile: 'particular', name: 'Ana', product: 'Modelo A', activity: 'Deporte: vela', hasBoat: 'Sí', hasElectric: 'No', intent: 'No', demo: 'Girona', enthusiasm: 'Reducción de ruido', concerns: 'Autonomía limitada', factors: 'Precio', comments: 'Todo bien' };
  const d = DICT.es;
  const lines = 'Me llamo Ana.\nProducto de interés: Modelo A\nActividad: Deporte: vela\nTengo embarcación: Sí\nEmbarcación eléctrica: No\nMe entusiasma: Reducción de ruido\nMe preocupa: Autonomía limitada\nIntención de compra: No\nFactores decisivos: Precio\nMe interesa una demostración en Girona.\nComentarios: Todo bien';
  assert.equal(whatsappText(d, session), `${d.greeting}\n\n${d.messages.particular.text}\n\n${lines}`);
  assert.equal(emailBody(d, session), `${d.greeting}\n\n${d.messages.particular.text}\n\n${lines}\n\n${d.closing}`);
});
test('les línies que no tenen valor no apareixen', () => {
  assert.equal(whatsappText(DICT.ca, { intent: 'Sí' }), `${DICT.ca.greeting}\n\n${DICT.ca.messages.none.text}\n\nIntenció de compra: Sí`);
});
test('cada idioma té les onze línies de dades amb {value}', () => {
  for (const lang of CONFIG.languages) for (const key of ['name', 'product', 'activity', 'boat', 'electric', 'enthusiasm', 'concerns', 'intent', 'factors', 'demo', 'comments'])
    assert.match(DICT[lang].messageContext[key], /\{value\}/, `${lang}.${key}`);
});
