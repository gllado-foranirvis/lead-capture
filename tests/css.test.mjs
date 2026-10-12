import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const page = readFileSync('site/css/page.css', 'utf8');
const tokens = readFileSync('site/ds/tokens.css', 'utf8');
const defined = new Set([...tokens.matchAll(/(--[a-z0-9-]+):/g)].map((m) => m[1]));

test('page.css: sense colors literals ni xarxa', () => {
  assert.doesNotMatch(page, /#[0-9a-fA-F]{3,8}\b/);
  assert.doesNotMatch(page, /@import|https?:/);
});
test('page.css: només variables que existeixen als tokens', () => {
  const used = [...page.matchAll(/var\((--[a-z0-9-]+)/g)].map((m) => m[1]);
  assert.deepEqual([...new Set(used.filter((v) => !defined.has(v)))], []);
});
test('page.css: el select (idioma) té l\'anell de focus del sistema', () => {
  assert.match(page, /select:focus-visible\s*\{[^}]*outline:\s*2px solid var\(--focus\)/);
});
test('page.css: controls natius segons el tema i selecció de text amb la paleta', () => {
  assert.match(page, /\[data-theme="light"\]\s*\{[^}]*color-scheme:\s*light/);
  assert.match(page, /\[data-theme="dark"\]\s*\{[^}]*color-scheme:\s*dark/);
  assert.match(page, /::selection\s*\{[^}]*background:\s*var\(--/);
});
test('page.css: els xips de dues línies tenen aire vertical i tots dos xips fan la mateixa alçada', () => {
  assert.match(page, /\.tsf-chip__label\s*\{[^}]*padding-block:\s*var\(--space-2\)/);
  assert.match(page, /\.tsf-chip\s*\{[^}]*display:\s*flex/);
  assert.match(page, /\.tsf-chip__label\s*\{[^}]*flex:\s*1/);
});
test('page.css: mobile first, sense alçades fixes ni nowrap', () => {
  assert.doesNotMatch(page, /@media[^{]*max-width/);
  assert.doesNotMatch(page, /white-space:\s*nowrap/);
  assert.doesNotMatch(page, /(^|[^-])height:\s*\d+px/m);
});
test('page.css: la pantalla del formulari ocupa l\'alçada i el botó s\'ancora a la base sense posició fixa', () => {
  assert.match(page, /\.site\s*\{[^}]*min-height:\s*100dvh/);
  assert.match(page, /\.page__done-actions\s*\{[^}]*margin-top:\s*auto/);
  assert.match(page, /\.page__done-mark\s*\{[^}]*var\(--success-bg\)/);
  assert.match(page, /\.page__screen\s*\{[^}]*display:\s*flex/);
  assert.match(page, /\.form__actions\s*\{[^}]*margin-top:\s*auto/);
  assert.doesNotMatch(page, /position:\s*fixed/);
});
test('page.css: el moviment de l\'indicador i de les pantalles té guarda de reduced-motion', () => {
  const motion = [...page.matchAll(/@media \(prefers-reduced-motion: no-preference\) \{([\s\S]*?)\n\}/g)].map((m) => m[1]).join('\n');
  assert.match(motion, /\.steps__seg[^{]*\{[^}]*transition/);
  assert.match(motion, /animation:\s*screen-in/);
  assert.doesNotMatch(page.replace(/@media \(prefers-reduced-motion: no-preference\) \{[\s\S]*?\n\}/g, ''), /(^|\s)(transition|animation):/);
});
test('page.css: els xips del formulari fan salt de línia perquè cap opció quedi tallada', () => {
  assert.match(page, /\.form \.tsf-chips__row\s*\{[^}]*flex-wrap:\s*wrap/);
  assert.match(page, /\.form \.tsf-chip\s*\{[^}]*flex:\s*1 1 40%/);
});

test('page.css: separació del CTA de l\'inici i xip llarg a fila pròpia', () => {
  assert.match(page, /\.page__cta\s*\{[^}]*margin-top:\s*var\(--space-4\)/);
  assert.match(page, /\.form__chips--wide \.tsf-chip:last-child\s*\{[^}]*flex-basis:\s*100%/);
});

test('page.css: els enllaços legals compacts fan 44px d\'alt (el sistema compacte els deixa a 40px) i el contingut va dins de <main>', () => {
  assert.match(page, /\.tsf-compact \.tsf-legal__link\s*\{[^}]*min-height:\s*44px/);
  assert.match(page, /\.page__main\s*\{[^}]*flex:\s*1/);
});

test('page.css: la privacitat és una columna de paràgrafs amb ritme (més aire sobre cada secció que sota el títol)', () => {
  assert.match(page, /\.privacy__text\s*\{[^}]*flex-direction:\s*column[^}]*gap:\s*var\(--space-4\)/);
  assert.match(page, /\.privacy h1, \.privacy h2, \.privacy p\s*\{[^}]*margin:\s*0/);
  assert.match(page, /\.privacy section \+ section\s*\{[^}]*margin-top:\s*var\(--space-5\)/);
});

test('page.css: les files de les caselles múltiples fan 44px (el sistema compacte les deixa a 40px)', () => {
  assert.match(page, /\.tsf-compact\s*\{[^}]*--option-h:\s*var\(--tap-min\)/);
});

test('page.css (mòbil compacte): caselles múltiples en dues columnes i ritme vertical més curt', () => {
  assert.match(page, /\.form \.tsf-group__list\s*\{[^}]*display:\s*grid[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(page, /\.form\s*\{[^}]*gap:\s*var\(--space-4\)/);
  assert.match(page, /\.form__group\s*\{[^}]*gap:\s*var\(--space-3\)/);
  assert.match(page, /\.page__top\s*\{[^}]*min-height:\s*var\(--tap-min-compact\)/);
  assert.match(page, /\.tsf-chips__legend\s*\{[^}]*margin-bottom:\s*var\(--space-1\)/);
  assert.match(page, /\.form__chips--wide \.tsf-chip\s*\{[^}]*flex-basis:\s*30%/);
});
test('page.css: a pantalles amples (≥768px) el ritme torna a ser generós', () => {
  const wide = page.slice(page.indexOf('@media (min-width: 768px)'));
  assert.match(wide, /\.form\s*\{[^}]*gap:\s*var\(--space-5\)/);
});

test('page.css (mòbil): sense hover enganxat en un tàctil, amb feedback de toc i sense inflat de text d\'iOS', () => {
  assert.match(page, /html\s*\{[^}]*text-size-adjust:\s*100%/);
  assert.match(page, /html\s*\{[^}]*-webkit-tap-highlight-color:\s*transparent/);
  const touch = page.match(/@media \(hover: none\)\s*\{([^}]*\{[^}]*\}\s*)+\}/)?.[0] ?? '';
  for (const sel of ['.tsf-btn--solid:hover', '.tsf-btn--outline:hover', '.tsf-btn--link:hover', '.tsf-pdf--link:hover']) assert.ok(touch.includes(sel), `${sel} neutralitzat en tàctil`);
  for (const sel of ['.tsf-btn--solid:active', '.tsf-btn--outline:active', '.tsf-pdf--link:active']) assert.match(page, new RegExp(`${sel.replace(/[.:]/g, '\\$&')}\\s*\\{`), `${sel}: feedback del toc`);
});

test('page.css (mòbil): l\'escena de l\'inici és compacta, la seva alçada la dona el contingut i no una alçada mínima', () => {
  const mobileStage = page.match(/\n\.stage\s*\{([^}]*)\}/)?.[1] ?? '';
  assert.ok(mobileStage.length > 0, 'regla .stage de mòbil');
  assert.doesNotMatch(mobileStage, /min-height/);
  assert.match(page, /@media \(min-width: 768px\)\s*\{[\s\S]*\.stage\s*\{[^}]*min-height/, 'la tauleta sí que té una escena més alta');
});

test('page.css: la marca de la capçalera és un enllaç sense subratllat i amb zona tàctil de 44px', () => {
  assert.match(page, /\.page__top \.wordmark\s*\{[^}]*text-decoration:\s*none/);
  assert.match(page, /\.page__top \.wordmark\s*\{[^}]*min-height:\s*var\(--tap-min-compact\)/);
});

test('page.css (mòbil): l\'escena de l\'inici deixa a dalt un espai sense text perquè hi llueixi el vaixell', () => {
  const mobileStage = page.match(/\n\.stage\s*\{([^}]*)\}/)?.[1] ?? '';
  assert.match(mobileStage, /padding:\s*7\.5rem var\(--gutter\)/);
  assert.match(mobileStage, /hero-m\.webp/);
});
