// Prepara el pas de la tipografia del sistema de disseny de px a rem.
// No toca the-silent-fleet-ds/ ni site/: només genera docs/typeset-rem/.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ROOT_PX = 16;
const round = (n) => Number(n.toFixed(8));
const num = (v) => Number.parseFloat(v);

// Mida: px -> rem. Interlineat: px -> proporció sense unitat (creix amb el text).
const remSize = (fontSize) => `${round(num(fontSize) / ROOT_PX)}rem`;
const ratio = (fontSize, lineHeight) => round(num(lineHeight) / num(fontSize));

export function toRem(tokens) {
  const out = structuredClone(tokens);
  for (const group of out.type.groups)
    for (const s of group.styles) {
      const { fontSize, lineHeight } = s;
      s.fontSize = remSize(fontSize);
      s.lineHeight = ratio(fontSize, lineHeight);
    }
  return out;
}

export function toRemCss(css) {
  return css.replace(/font-size: ([\d.]+)px; line-height: ([\d.]+)px;/g,
    (_, fs, lh) => `font-size: ${remSize(fs)}; line-height: ${ratio(fs, lh)};`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const DS = 'the-silent-fleet-ds';
  const tokens = JSON.parse(readFileSync(`${DS}/tokens.json`, 'utf8'));
  const css = readFileSync(`${DS}/tokens.css`, 'utf8');
  mkdirSync('docs/typeset-rem', { recursive: true });
  writeFileSync('docs/typeset-rem/tokens.rem.json', JSON.stringify(toRem(tokens), null, 2) + '\n');
  writeFileSync('docs/typeset-rem/tokens.rem.css', toRemCss(css));
  console.log('Generat docs/typeset-rem/tokens.rem.{json,css}');
}
