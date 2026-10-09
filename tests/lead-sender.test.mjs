import test from 'node:test';
import assert from 'node:assert/strict';
import { FETCH_TIMEOUT_MS, RETRY_MS, connectSender, createSender } from '../site/js/form/sender.js';

const partial = { id: 'id-0001', stage: 'step1', contact: { name: 'Ana' } };
const complete = { id: 'id-0001', stage: 'complete', contact: { name: 'Ana' }, profiling: { hasBoat: 'si' } };

const reply = (body, ok = true) => ({ ok, json: async () => body });
const harness = (responses) => {
  const calls = [];
  const queue = [...responses];
  const timers = { scheduled: [], set(fn, ms) { this.scheduled.push({ fn, ms }); return this.scheduled.length; }, clear() {} };
  const beacons = [];
  return {
    calls, timers, beacons,
    fetchFn: async (url, options) => {
      calls.push({ url, options, body: JSON.parse(options.body) });
      const next = queue.length > 1 ? queue.shift() : queue[0];
      if (next instanceof Error) throw next;
      return next;
    },
    beacon: (url, blob) => { beacons.push({ url, blob }); return true; },
  };
};
const make = (h, extra = {}) => createSender({ endpoint: 'https://script.example/exec', fetchFn: h.fetchFn, timers: h.timers, beacon: h.beacon, ...extra });
const OK = reply({ ok: true, result: 'created' });

test('amb èxit envia un POST de text pla (sense preflight) i buida la cua', async () => {
  const h = harness([OK]);
  const sender = make(h);
  await sender.send(partial);
  assert.equal(h.calls.length, 1);
  assert.equal(h.calls[0].url, 'https://script.example/exec');
  assert.deepEqual([h.calls[0].options.method, h.calls[0].options.headers['Content-Type']], ['POST', 'text/plain;charset=utf-8']);
  assert.deepEqual(h.calls[0].body, partial);
  assert.equal(sender.size(), 0);
});
test('sense endpoint no es fa cap petició ni es guarda res', async () => {
  const h = harness([OK]);
  const sender = createSender({ endpoint: '', fetchFn: h.fetchFn, timers: h.timers, beacon: h.beacon });
  await sender.send(partial);
  assert.deepEqual([h.calls.length, sender.size()], [0, 0]);
});
test('el token, si n\'hi ha, viatja dins del cos', async () => {
  const h = harness([OK]);
  await make(h, { token: 's3cret' }).send(partial);
  assert.equal(h.calls[0].body.token, 's3cret');
});
test('error de xarxa: es conserva a la cua i es reintenta amb l\'espera creixent', async () => {
  const h = harness([new TypeError('offline')]);
  const sender = make(h);
  await sender.send(partial);
  assert.equal(sender.size(), 1);
  assert.equal(h.timers.scheduled.at(-1).ms, RETRY_MS[0]);
  await h.timers.scheduled.at(-1).fn();
  assert.equal(h.timers.scheduled.at(-1).ms, RETRY_MS[1]);
  for (let i = 0; i < 10; i++) await h.timers.scheduled.at(-1).fn();
  assert.equal(h.timers.scheduled.at(-1).ms, RETRY_MS.at(-1), 'l\'espera no passa de l\'últim valor');
});
test('en recuperar-se la xarxa s\'envia i es buida; el comptador d\'espera es reinicia', async () => {
  const h = harness([new TypeError('offline'), OK]);
  const sender = make(h);
  await sender.send(partial);
  await h.timers.scheduled.at(-1).fn();
  assert.equal(sender.size(), 0);
  await sender.send({ ...partial, id: 'id-0002' });
  assert.equal(h.calls.length, 3);
});
test('una resposta «error» del servidor (transitori) es reintenta; «invalid» es descarta per no insistir', async () => {
  const retry = harness([reply({ ok: false, error: 'error' })]);
  const a = make(retry);
  await a.send(partial);
  assert.equal(a.size(), 1);
  const drop = harness([reply({ ok: false, error: 'invalid' })]);
  const b = make(drop);
  await b.send(partial);
  assert.equal(b.size(), 0);
  const http = harness([reply({}, false)]);
  const c = make(http);
  await c.send(partial);
  assert.equal(c.size(), 1, 'una resposta HTTP no correcta es reintenta');
});
test('de cada id només es conserva l\'última càrrega: el final substitueix el parcial pendent', async () => {
  const h = harness([new TypeError('offline')]);
  const sender = make(h);
  await sender.send(partial);
  await sender.send(complete);
  assert.equal(sender.size(), 1);
  await sender.flush();
  assert.equal(h.calls.at(-1).body.stage, 'complete');
});
test('un parcial mai no substitueix un final pendent', async () => {
  const h = harness([new TypeError('offline')]);
  const sender = make(h);
  await sender.send(complete);
  const before = h.calls.length;
  await sender.send(partial);
  assert.equal(h.calls.length, before, 'ni tan sols s\'intenta');
  assert.equal(sender.size(), 1);
  await sender.flush();
  assert.equal(h.calls.at(-1).body.stage, 'complete');
});
test('beaconAll fa un darrer intent amb sendBeacon de tot el que queda, com a text pla', async () => {
  const h = harness([new TypeError('offline')]);
  const sender = make(h, { token: 't' });
  await sender.send(complete);
  sender.beaconAll();
  assert.equal(h.beacons.length, 1);
  assert.equal(h.beacons[0].url, 'https://script.example/exec');
  assert.match(h.beacons[0].blob.type, /^text\/plain/);
  assert.deepEqual(JSON.parse(await h.beacons[0].blob.text()), { ...complete, token: 't' });
});
test('connectSender: els esdeveniments del flux s\'envien amb la forma correcta; online reintenta; pagehide fa beacon', async () => {
  const listeners = {};
  const target = { addEventListener: (name, fn) => { listeners[name] = fn; } };
  const sent = [];
  const sender = { send: (p) => sent.push(p), flush: () => sent.push('flush'), beaconAll: () => sent.push('beacon') };
  connectSender(target, sender);
  listeners['tsf:lead-partial']({ detail: { id: 'id-0001', stage: 'step1', name: 'Ana' } });
  listeners['tsf:lead']({ detail: { contact: { id: 'id-0001', name: 'Ana' }, profiling: { id: 'id-0001', hasBoat: 'si' }, hasProfiling: true } });
  listeners.online();
  listeners.pagehide();
  assert.deepEqual(sent, [
    { id: 'id-0001', stage: 'step1', contact: { name: 'Ana' } },
    { id: 'id-0001', stage: 'complete', contact: { name: 'Ana' }, profiling: { hasBoat: 'si' } },
    'flush', 'beacon',
  ]);
});
test('cada petició porta un temps límit perquè un fetch penjat no bloquegi la cua', async () => {
  const h = harness([OK]);
  await make(h).send(partial);
  assert.ok(h.calls[0].options.signal instanceof AbortSignal);
  assert.equal(typeof FETCH_TIMEOUT_MS, 'number');
});
test('una resposta «token» (token mal configurat) es reintenta i no es descarta', async () => {
  const h = harness([reply({ ok: false, error: 'token' })]);
  const sender = make(h);
  await sender.send(partial);
  assert.equal(sender.size(), 1);
});
test('connectSender: quan la pestanya passa a segon pla es fa el darrer intent (pagehide no és fiable al mòbil)', () => {
  const listeners = {};
  const doc = { visibilityState: 'visible', addEventListener: (name, fn) => { listeners[name] = fn; } };
  const sent = [];
  connectSender({ addEventListener() {} }, { send() {}, flush() {}, beaconAll: () => sent.push('beacon') }, doc);
  listeners.visibilitychange();
  assert.deepEqual(sent, []);
  doc.visibilityState = 'hidden';
  listeners.visibilitychange();
  assert.deepEqual(sent, ['beacon']);
});
