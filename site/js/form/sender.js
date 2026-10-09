import { finalPayload, partialPayload } from './payload.js';

// Espera entre reintents (ms); després de l'últim valor es manté.
export const RETRY_MS = [2000, 5000, 15000, 30000, 60000];

const defaultTimers = { set: (fn, ms) => setTimeout(fn, ms), clear: (id) => clearTimeout(id) };

// Cua d'enviament només en memòria (tauleta compartida: res de personal al navegador). De cada id només es guarda
// l'última càrrega; el servidor fa un upsert per id, així un reintent mai duplica una fila.
export function createSender({
  endpoint, token = '', fetchFn = (...args) => fetch(...args), timers = defaultTimers,
  beacon = (url, body) => navigator.sendBeacon(url, body),
}) {
  const pending = new Map();
  let failures = 0;
  let timer = null;
  let flushing = false;

  const body = (payload) => JSON.stringify(token ? { ...payload, token } : payload);

  async function post(payload) {
    try {
      const response = await fetchFn(endpoint, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: body(payload) });
      const result = await response.json();
      if (response.ok && result.ok === true) return 'sent';
      return result?.error === 'invalid' ? 'drop' : 'retry';
    } catch {
      return 'retry';
    }
  }

  async function flush() {
    if (!endpoint || flushing) return;
    timers.clear(timer);
    timer = null;
    flushing = true;
    let retry = false;
    for (const [id, entry] of [...pending]) {
      const outcome = await post(entry.payload);
      if (outcome === 'retry') retry = true;
      else if (pending.get(id) === entry) pending.delete(id);
    }
    flushing = false;
    if (!pending.size) {
      failures = 0;
    } else if (retry) {
      timer = timers.set(flush, RETRY_MS[Math.min(failures++, RETRY_MS.length - 1)]);
    } else {
      await flush();
    }
  }

  function send(payload) {
    if (!endpoint) return Promise.resolve();
    const previous = pending.get(payload.id);
    // Un parcial que arriba tard no substitueix el final pendent.
    if (previous && previous.payload.stage === 'complete' && payload.stage === 'step1') return Promise.resolve();
    pending.set(payload.id, { payload });
    return flush();
  }

  // Darrer intent en tancar la pàgina: sendBeacon no espera resposta.
  function beaconAll() {
    if (!endpoint) return;
    for (const { payload } of pending.values()) beacon(endpoint, new Blob([body(payload)], { type: 'text/plain;charset=UTF-8' }));
  }

  return { send, flush, beaconAll, size: () => pending.size };
}

// Connecta el sender amb els esdeveniments públics del flux i amb l'estat de la xarxa i de la pàgina.
export function connectSender(target, sender) {
  target.addEventListener('tsf:lead-partial', (e) => sender.send(partialPayload(e.detail)));
  target.addEventListener('tsf:lead', (e) => sender.send(finalPayload(e.detail)));
  target.addEventListener('online', () => sender.flush());
  target.addEventListener('pagehide', () => sender.beaconAll());
}
