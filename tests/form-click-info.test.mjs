import test from 'node:test';
import assert from 'node:assert/strict';
import { clickInfo } from '../site/js/form/click-info.js';

const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1';
const IPAD = 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Safari/604.1';
const ANDROID = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/120.0 Mobile Safari/537.36';
const ANDROID_TABLET = 'Mozilla/5.0 (Linux; Android 14; SM-X700) AppleWebKit/537.36 Chrome/120.0 Safari/537.36';
const WINDOWS = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36';

const env = (over = {}) => ({
  nav: { language: 'pt-PT', userAgent: WINDOWS }, win: { innerWidth: 360, innerHeight: 740, Intl: { DateTimeFormat: () => ({ resolvedOptions: () => ({ timeZone: 'Europe/Lisbon' }) }) } },
  doc: { referrer: '' }, startedAt: 1000, now: 13400, ...over,
});

test('dispositiu i sistema a partir del user-agent', () => {
  const of = (userAgent) => { const i = clickInfo(env({ nav: { language: 'pt', userAgent } })); return [i.device, i.os]; };
  assert.deepEqual(of(IPHONE), ['mobile', 'ios']);
  assert.deepEqual(of(IPAD), ['tablet', 'ios']);
  assert.deepEqual(of(ANDROID), ['mobile', 'android']);
  assert.deepEqual(of(ANDROID_TABLET), ['tablet', 'android']);
  assert.deepEqual(of(WINDOWS), ['desktop', 'other']);
});
test('idioma del navegador, zona horària, mida de pantalla i segons a la pàgina', () => {
  assert.deepEqual(clickInfo(env()), { browserLang: 'pt-PT', device: 'desktop', os: 'other', tz: 'Europe/Lisbon', screen: '360x740', seconds: 12, referrer: '' });
});
test('referrer: només el domini, mai ruta ni paràmetres; buit o invàlid → buit', () => {
  const ref = (referrer) => clickInfo(env({ doc: { referrer } })).referrer;
  assert.equal(ref('https://www.google.com/search?q=secret&x=1'), 'www.google.com');
  assert.equal(ref(''), '');
  assert.equal(ref('no és una url'), '');
});
test('un navegador sense res (sense Intl, sense idioma, sense document) no peta i deixa els camps buits', () => {
  const info = clickInfo({ nav: {}, win: {}, doc: undefined, startedAt: 0, now: 5000 });
  assert.deepEqual(info, { browserLang: '', device: 'desktop', os: 'other', tz: '', screen: '', seconds: 5, referrer: '' });
  assert.doesNotThrow(() => clickInfo({}));
});
