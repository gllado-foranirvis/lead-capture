import test from 'node:test';
import assert from 'node:assert/strict';
import { deselectProps } from '../site/js/chips.js';

const input = (value) => ({ target: { tagName: 'INPUT', value } });
const key = (value, k) => ({ key: k, target: { tagName: 'INPUT', value }, preventDefault() { this.prevented = true; } });

test('tocar el xip seleccionat el desmarca', () => {
  let cleared = 0;
  deselectProps('si', () => cleared++).onClick(input('si'));
  assert.equal(cleared, 1);
});
test('tocar un altre xip, una etiqueta o quan no hi ha cap valor no desmarca', () => {
  let cleared = 0;
  const p = deselectProps('si', () => cleared++);
  p.onClick(input('no'));
  p.onClick({ target: { tagName: 'LABEL', value: 'si' } });
  deselectProps('', () => cleared++).onClick(input(''));
  assert.equal(cleared, 0);
});
test('l\'espai sobre el xip seleccionat el desmarca i no fa scroll', () => {
  let cleared = 0;
  const e = key('si', ' ');
  deselectProps('si', () => cleared++).onKeyDown(e);
  assert.equal(cleared, 1);
  assert.equal(e.prevented, true);
});
test('altres tecles no fan res', () => {
  let cleared = 0;
  const e = key('si', 'ArrowRight');
  deselectProps('si', () => cleared++).onKeyDown(e);
  assert.equal(cleared, 0);
  assert.equal(e.prevented, undefined);
});
