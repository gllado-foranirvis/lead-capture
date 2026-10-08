import test from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../site/js/config.js';
import { DICT, resolveLang } from '../site/js/i18n.js';

const keys = (o, p = '') => Object.entries(o).flatMap(([k, v]) =>
  typeof v === 'object' ? keys(v, `${p}${k}.`) : [`${p}${k}`]);
const leaves = (o) => Object.values(o).flatMap((v) => (typeof v === 'object' ? leaves(v) : [v]));

test('els 4 idiomes tenen exactament les mateixes claus', () => {
  const ref = keys(DICT.es).sort();
  for (const l of CONFIG.languages) assert.deepEqual(keys(DICT[l]).sort(), ref, l);
});
test('cap literal buit ni amb signes d\'exclamació o emojis', () => {
  for (const l of CONFIG.languages) for (const s of leaves(DICT[l])) {
    assert.ok(s.trim().length > 0, `${l}: buit`);
    assert.doesNotMatch(s, /[!¡]/u, `${l}: "${s}"`);
    assert.doesNotMatch(s, /\p{Extended_Pictographic}/u, `${l}: "${s}"`);
  }
});
test('cada missatge té només assumpte i text (cap camp a omplir ni altres peces)', () => {
  for (const l of CONFIG.languages) for (const [k, m] of Object.entries(DICT[l].messages))
    assert.deepEqual(Object.keys(m).sort(), ['subject', 'text'], `${l}/${k}`);
});
test('registre consistent a la interfície: ES i CA de tu, sense «usted» ni «vós»', () => {
  const ui = (d) => Object.entries(d).filter(([k]) => k !== 'messages').map(([, v]) => v).join(' ');
  assert.doesNotMatch(ui(DICT.es), /\b(su|sus|usted|ustedes)\b/i);
  assert.doesNotMatch(ui(DICT.ca), /\b(vostre|vostra|vostres|escriviu|contacteu)\b/i);
});
test('els botons de contacte són accions amb verb (no només un nom)', () => {
  assert.match(DICT.es.whatsapp, /^Escribir /);
  assert.match(DICT.ca.whatsapp, /^Escriure /);
  assert.match(DICT.pt.whatsapp, /^Escrever /);
  assert.match(DICT.en.whatsapp, /^Message /);
});
test('resolveLang', () => {
  assert.equal(resolveLang('?lang=ca', CONFIG), 'ca');
  assert.equal(resolveLang('?lang=PT', CONFIG), 'pt');
  assert.equal(resolveLang('?lang=xx', CONFIG), 'es');
  assert.equal(resolveLang('?lang=', CONFIG), 'es');
  assert.equal(resolveLang('', CONFIG), 'es');
  assert.equal(resolveLang('?a=1&lang=en', CONFIG), 'en');
});
