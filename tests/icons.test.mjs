import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ICONS, icon } from '../site/js/icons.js';

// h mínim: retorna l'arbre tal qual, sense React
const h = (type, props, ...children) => ({ type, props: props ?? {}, children });
const html = readFileSync('site/index.html', 'utf8');
const root = html.match(/<div id="root">([\s\S]*?)<\/div>\s*<script/)[1];

test('hi ha les icones de WhatsApp i correu', () => {
  assert.deepEqual(Object.keys(ICONS).sort(), ['mail', 'whatsapp']);
});
test('les icones són decoratives, de 20px i hereten el color del botó', () => {
  for (const name of Object.keys(ICONS)) {
    const svg = icon(h, name);
    assert.equal(svg.type, 'svg');
    assert.equal(svg.props['aria-hidden'], 'true', name);
    assert.equal(svg.props.focusable, 'false', name);
    assert.equal(svg.props.width, 20);
    assert.equal(svg.props.height, 20);
    const painted = [svg.props.fill, svg.props.stroke].filter((v) => v && v !== 'none');
    assert.deepEqual([...new Set(painted)], ['currentColor'], `${name}: només currentColor`);
    assert.doesNotMatch(JSON.stringify(svg), /#[0-9a-fA-F]{3,8}|rgb\(/, `${name}: cap color fix`);
  }
});
test('el correu usa el traç fi d\'1,5px del sistema', () => {
  assert.equal(icon(h, 'mail').props.strokeWidth, 1.5);
});
test('fallback: els enllaços de #root porten les mateixes icones (aria-hidden)', () => {
  assert.equal((root.match(/<svg[^>]*aria-hidden="true"/g) || []).length, 2);
  for (const name of Object.keys(ICONS)) assert.ok(root.includes(ICONS[name].d), `${name}: traç desfasat`);
});
