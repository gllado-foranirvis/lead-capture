// Vigila la inactivitat: cada gest reinicia el comptador i, si no n'hi ha cap durant «ms», crida onIdle una vegada.
export const IDLE_MS = 90000;
export const ACTIVITY_EVENTS = ['pointerdown', 'keydown', 'input', 'scroll'];

export function watchIdle({ target, events, ms, onIdle, timers = { set: (f, t) => setTimeout(f, t), clear: (id) => clearTimeout(id) } }) {
  let id;
  const arm = () => {
    timers.clear(id);
    id = timers.set(onIdle, ms);
  };
  for (const event of events) target.addEventListener(event, arm, { passive: true, capture: true });
  arm();
  return () => {
    timers.clear(id);
    for (const event of events) target.removeEventListener(event, arm, { capture: true });
  };
}
