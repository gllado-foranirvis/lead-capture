import test from 'node:test';
import assert from 'node:assert/strict';
import { ACTIVITY_EVENTS, IDLE_MS, watchIdle } from '../site/js/form/idle.js';

const harness = () => {
  const listeners = {};
  let next = 0;
  const pending = new Map();
  const target = {
    addEventListener: (e, f) => { (listeners[e] ??= new Set()).add(f); },
    removeEventListener: (e, f) => { listeners[e]?.delete(f); },
    fire: (e) => listeners[e]?.forEach((f) => f()),
  };
  const timers = { set: (f, ms) => { pending.set(++next, { f, ms }); return next; }, clear: (id) => pending.delete(id) };
  return { target, timers, pending, listeners };
};

test('el temps d\'inactivitat a la tauleta és 90 s i vigila clics, tecles, escriptura i desplaçament', () => {
  assert.equal(IDLE_MS, 90000);
  assert.deepEqual(ACTIVITY_EVENTS, ['pointerdown', 'keydown', 'input', 'scroll']);
});
test('sense activitat s\'activa un sol cop un cop passat el temps', () => {
  const { target, timers, pending } = harness();
  let idle = 0;
  watchIdle({ target, events: ['keydown'], ms: 50, onIdle: () => idle++, timers });
  assert.equal(pending.size, 1);
  [...pending.values()][0].f();
  assert.equal(idle, 1);
});
test('cada activitat reinicia el comptador (només hi ha un temporitzador viu)', () => {
  const { target, timers, pending } = harness();
  watchIdle({ target, events: ['keydown', 'pointerdown'], ms: 50, onIdle: () => {}, timers });
  target.fire('keydown'); target.fire('pointerdown'); target.fire('keydown');
  assert.equal(pending.size, 1);
});
test('el que torna watchIdle atura el temporitzador i treu els escoltadors', () => {
  const { target, timers, pending, listeners } = harness();
  const stop = watchIdle({ target, events: ['keydown'], ms: 50, onIdle: () => {}, timers });
  stop();
  assert.equal(pending.size, 0);
  assert.equal(listeners.keydown.size, 0);
});
