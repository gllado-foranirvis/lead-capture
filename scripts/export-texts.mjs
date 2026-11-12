// Genera docs/textos-contacte.md amb tots els textos de la pàgina i dels missatges, per validar-los.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { whatsappText, emailBody } from '../site/js/messages.js';

const LANGS = { es: 'Castellà (ES)', ca: 'Català (CA)', pt: 'Portuguès (PT)', en: 'Anglès (EN)' };
const UI = [
  ['Titular', 'title'], ['Subtítol', 'subtitle'],
  ['Etiqueta de contacte', 'contactLabel'], ['Botó de WhatsApp', 'whatsapp'], ['Botó de correu', 'emailLabel'],
  ['Línia explicativa', 'contactHint'], ['Línia de recuperació (seguida de l\'adreça)', 'contactFallback'],
  ['Enllaç legal 1', 'privacy'], ['Enllaç legal 2', 'cookies'],
  ['Pàgina de privacitat', 'privacyText'], ['Pàgina de cookies', 'cookiesText'],
];
const flat = (o, prefix = '') => Object.entries(o).flatMap(([k, v]) => (typeof v === 'object' ? flat(v, `${prefix}${k}.`) : [[`${prefix}${k}`, v]]));
const at = (o, path) => path.split('.').reduce((acc, k) => acc[k], o);
const cell = (s) => s.replace(/\n\n/g, ' ⏎ ').replace(/\n/g, ' / ').replace(/\|/g, '\\|');

export function renderTexts(dict, config) {
  const out = [
    '# Textos de la pàgina i dels missatges de contacte',
    '',
    '> Generat de `site/js/i18n.js` amb `npm run texts`. No s\'edita a mà: per canviar un text, edita `i18n.js` i torna a generar-lo (`npm test` falla si no coincideixen).',
    '',
    'Són textos pendents de validar per Bruno; l\'Olga revisa les traduccions. «⏎» és un salt de línia en blanc i « / » un salt de línia simple.',
    '',
    '## Textos de la pàgina',
    '',
    '| Element | ' + config.languages.map((l) => l.toUpperCase()).join(' | ') + ' |',
    '|---|' + config.languages.map(() => '---|').join(''),
    ...UI.map(([label, key]) => `| ${label} | ${config.languages.map((l) => cell(dict[l][key])).join(' | ')} |`),
    '',
    `L'adreça de la línia de recuperació és \`${config.email}\`, en text seleccionable.`,
    '',
    "## Formulari de l'Extra 1 (esborrany)",
    '',
    '| Clau | ' + config.languages.map((l) => l.toUpperCase()).join(' | ') + ' |',
    '|---|' + config.languages.map(() => '---|').join(''),
    ...flat(dict.es.form).map(([key]) => `| \`${key}\` | ${config.languages.map((l) => cell(at(dict[l].form, key))).join(' | ')} |`),
    '',
    '## Missatges',
    '',
    '- **WhatsApp:** salutació, salt de línia en blanc i text del missatge. Sense assumpte ni comiat. `{fair}` es substitueix pel nom de la fira (`config.fair`).',
    `- **Correu** (cap a \`${config.email}\`): assumpte; cos amb salutació, text del missatge i comiat.`,
    '- **Dades de la sessió:** si el visitant ja ha donat el nom, el producte o la ciutat, es nota en una línia entre el text i el comiat; les que no té no hi surten.',
    '',
  ];
  for (const lang of config.languages) {
    const d = dict[lang];
    out.push(`### ${LANGS[lang]}`, '', '| Cas | Via | Assumpte | Missatge |', '|---|---|---|---|');
    const example = { name: 'Ana', product: 'Sifly', city: 'Lisboa' };
    for (const [label, session] of [['Sense dades', {}], ['Amb dades de sessió (exemple)', example]]) {
      out.push(`| ${label} | WhatsApp | — | ${cell(whatsappText(d, session, config.fair))} |`);
      out.push(`| ${label} | Correu | ${cell(d.message.subject.replaceAll('{fair}', config.fair))} | ${cell(emailBody(d, session, config.fair))} |`);
    }
    out.push('');
  }
  out.push(
    '## Per revisar',
    '',
    '- **Tractament:** castellà i català de tu; portuguès de «você» formal («Escreva-nos»). Cal confirmar-ho amb Bruno.',
    '- **Portuguès:** revisar-lo amb un parlant natiu de la variant europea (per exemple «e-mail»). El comiat dels correus, «Obrigado», és masculí; «Obrigado(a)» o «Cumprimentos» seria neutre.',
    '- **Privacitat:** el text no identifica el responsable del tractament; Bruno l\'ha de validar abans de la fira.',
    '',
  );
  return out.join('\n');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { DICT } = await import('../site/js/i18n.js');
  const { CONFIG } = await import('../site/js/config.js');
  writeFileSync('docs/textos-contacte.md', renderTexts(DICT, CONFIG));
  console.log('Generat docs/textos-contacte.md');
}
