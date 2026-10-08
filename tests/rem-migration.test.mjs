import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { toRem, toRemCss } from '../scripts/rem-migration.mjs';

const DS = 'the-silent-fleet-ds';
const src = JSON.parse(readFileSync(`${DS}/tokens.json`, 'utf8'));
const srcCss = readFileSync(`${DS}/tokens.css`, 'utf8');
const px = (v) => Number.parseFloat(v);
const styles = (t) => t.type.groups.flatMap((g) => g.styles);

test('el tokens.rem.json preparat és fresc respecte al sistema actual', () => {
  const prepared = JSON.parse(readFileSync('docs/typeset-rem/tokens.rem.json', 'utf8'));
  assert.deepEqual(prepared, toRem(src), 'el sistema ha canviat: torna a executar scripts/rem-migration.mjs');
});
test('el tokens.rem.css preparat és fresc', () => {
  assert.equal(readFileSync('docs/typeset-rem/tokens.rem.css', 'utf8'), toRemCss(srcCss));
});
test('a 16px d\'arrel cada estil fa exactament el mateix que abans', () => {
  const out = styles(toRem(src));
  for (const [i, s] of styles(src).entries()) {
    const o = out[i];
    assert.match(o.fontSize, /^[\d.]+rem$/, s.name);
    assert.equal(px(o.fontSize) * 16, px(s.fontSize), `${s.name}: mida`);
    assert.equal(typeof o.lineHeight, 'number', `${s.name}: interlineat sense unitat`);
    assert.ok(Math.abs(o.lineHeight * px(s.fontSize) - px(s.lineHeight)) < 0.01, `${s.name}: interlineat`);
  }
});
test('només canvien fontSize i lineHeight; la resta és idèntic', () => {
  const strip = (t) => structuredClone({
    ...t,
    type: { ...t.type, groups: t.type.groups.map((g) => ({ ...g, styles: g.styles.map(({ fontSize, lineHeight, ...rest }) => rest) })) },
  });
  assert.deepEqual(strip(toRem(src)), strip(src));
});
test('el CSS en rem no deixa cap font-size ni line-height en px i conserva la resta de línies', () => {
  const out = toRemCss(srcCss);
  assert.doesNotMatch(out, /(font-size|line-height):\s*[\d.]+px/);
  assert.equal(out.split('\n').length, srcCss.split('\n').length);
  assert.match(out, /\.body \{[^}]*font-size: 1rem; line-height: 1\.625;/);
  assert.match(out, /\.display-lg \{[^}]*font-size: 4rem;/);
});
