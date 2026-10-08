import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('el workflow de Pages usa Node ≥ 22 (el patró de `npm test` no funciona amb Node 20)', () => {
  const yml = readFileSync('.github/workflows/pages.yml', 'utf8');
  const v = Number(yml.match(/node-version:\s*(\d+)/)[1]);
  assert.ok(v >= 22, `node-version és ${v}`);
});
test('package.json declara el Node mínim', () => {
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  assert.match(pkg.engines.node, /22/);
});
