import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { posix } from 'node:path';
const html = readFileSync('site/index.html', 'utf8');

test('viewport, tema fix i idioma per defecte', () => {
  assert.match(html, /<meta name="viewport" content="width=device-width, initial-scale=1"/);
  assert.match(html, /<html[^>]*lang="es"[^>]*data-theme="light"|<html[^>]*data-theme="light"[^>]*lang="es"/);
});
test('ordre de càrrega: React, ReactDOM, bundle del DS i, després, l\'app', () => {
  const order = ['vendor/react.production.min.js', 'vendor/react-dom.production.min.js', 'ds/bundle.js', 'js/app.js']
    .map((s) => html.indexOf(s));
  assert.ok(order.every((i) => i > 0), 'falta algun script');
  assert.deepEqual([...order].sort((a, b) => a - b), order);
});
test('cap recurs extern de càrrega', () => {
  assert.doesNotMatch(html, /(src|href)="https?:\/\/(?!wa\.me)/);
  assert.doesNotMatch(html, /googleapis|cdn\./);
});
test('fallback: #root ja conté WhatsApp i correu sense JavaScript', () => {
  const root = html.match(/<div id="root">([\s\S]*?)<\/div>\s*<script/)[1];
  assert.match(root, /href="https:\/\/wa\.me\/\d+/);
  assert.match(root, /href="mailto:info@thesilentfleet\.com/);
});

test('fallback: els enllaços coincideixen amb config.js (no hi ha dades duplicades desfasades)', async () => {
  const { CONFIG } = await import('../site/js/config.js');
  const { normalizeNumber } = await import('../site/js/messages.js');
  const root = html.match(/<div id="root">([\s\S]*?)<\/div>\s*<script/)[1];
  assert.ok(root.includes(`https://wa.me/${normalizeNumber(CONFIG.whatsappNumber)}`), 'número de WhatsApp desfasat');
  assert.ok(root.includes(`mailto:${CONFIG.email}`), 'correu desfasat');
});
test('fallback: els textos coincideixen amb el diccionari en castellà i mostra l\'adreça', async () => {
  const { DICT } = await import('../site/js/i18n.js');
  const { CONFIG } = await import('../site/js/config.js');
  const root = html.match(/<div id="root">([\s\S]*?)<\/div>\s*<script/)[1];
  for (const k of ['whatsapp', 'emailLabel', 'contactFallback']) assert.ok(root.includes(DICT.es[k]), `${k} desfasat`);
  assert.ok(root.includes(`>${CONFIG.email}<`), 'adreça visible en text');
});

test('càrrega: els pesos 400, 500 i 600 tenen preload amb crossorigin; el 700, no (Chrome avisa que no s\'usa)', () => {
  const css = readFileSync('site/css/fonts.css', 'utf8');
  const files = [...css.matchAll(/url\("\.\.\/(fonts\/[^"]+\.woff2)"\)/g)].map((m) => m[1]);
  assert.equal(files.length, 4);
  for (const f of files.filter((x) => !x.includes('-700'))) {
    assert.match(html, new RegExp(`<link rel="preload" href="${f}" as="font" type="font/woff2" crossorigin>`), f);
  }
  assert.doesNotMatch(html, /rel="preload" href="fonts\/montserrat-700\.woff2"/);
});
const importsOf = (file) => [...readFileSync(`site/${file}`, 'utf8').matchAll(/from '(\.[^']+)'/g)]
  .map((m) => posix.normalize(posix.join(posix.dirname(file), m[1])));
const closure = (entry, seen = new Set()) => {
  for (const f of importsOf(entry)) if (!seen.has(f)) { seen.add(f); closure(f, seen); }
  return [...seen];
};

test('càrrega: tots els mòduls que arrosseguen app.js (transitius) tenen modulepreload', () => {
  const modules = closure('js/app.js');
  assert.ok(modules.length >= 10, modules.join(', '));
  for (const f of modules) assert.match(html, new RegExp(`<link rel="modulepreload" href="${f}">`), f);
});

test('metadades: descripció a la portada i icona buida a les dues pàgines (cap 404 de favicon)', () => {
  assert.match(html, /<meta name="description" content="[^"]{20,}">/);
  for (const f of ['site/index.html', 'site/privacy.html'])
    assert.match(readFileSync(f, 'utf8'), /<link rel="icon" href="data:,">/, f);
});

const priv = readFileSync('site/privacy.html', 'utf8');
test('privacy.html: seccions, DS local i sense externs', () => {
  assert.match(priv, /id="privacy"/);
  assert.match(priv, /id="cookies"/);
  assert.match(priv, /href="css\/page\.css"/);
  assert.match(priv, /<html[^>]*data-theme="light"/);
  assert.doesNotMatch(priv, /(src|href)="https?:/);
});
test('privacy.html: tots els textos venen del diccionari', () => {
  for (const key of ['privacyTitle', 'privacyText', 'cookiesTitle', 'cookiesText', 'back'])
    assert.match(priv, new RegExp(`data-key="${key}"`), key);
});
