import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const DS = 'the-silent-fleet-ds';
const copy = (from, to) => { mkdirSync(to.replace(/\/[^/]+$/, ''), { recursive: true }); copyFileSync(from, to); };

copy(`${DS}/tokens.css`, 'site/ds/tokens.css');
copy(`${DS}/components/bundle.js`, 'site/ds/bundle.js');
const css = readFileSync(`${DS}/components/bundle.css`, 'utf8').replace(/^@import[^\n]*\n/m, '');
mkdirSync('site/ds', { recursive: true });
writeFileSync('site/ds/bundle.css', css);

copy('node_modules/react/umd/react.production.min.js', 'site/vendor/react.production.min.js');
copy('node_modules/react-dom/umd/react-dom.production.min.js', 'site/vendor/react-dom.production.min.js');
for (const w of [400, 500, 600, 700])
  copy(`node_modules/@fontsource/montserrat/files/montserrat-latin-${w}-normal.woff2`, `site/fonts/montserrat-${w}.woff2`);
