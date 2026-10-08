// Genera docs/textos-contacte.md amb tots els textos de la pàgina i dels missatges, per validar-los.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { whatsappText, emailBody } from '../site/js/messages.js';

const PROFILES = [['none', 'Cap'], ['distribuidor', 'Distribuïdor'], ['particular', 'Particular']];
const LANGS = { es: 'Castellà (ES)', ca: 'Català (CA)', pt: 'Portuguès (PT)', en: 'Anglès (EN)' };
const UI = [
  ['Titular', 'title'], ['Subtítol', 'subtitle'], ['Pregunta del perfil', 'profileLegend'],
  ['Xip de perfil 1', 'profileDistribuidor'], ['Xip de perfil 2', 'profileParticular'],
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
    '- **WhatsApp:** salutació, salt de línia en blanc i text del perfil. Sense assumpte ni comiat.',
    `- **Correu** (cap a \`${config.email}\`): assumpte del perfil; cos amb salutació, text del perfil i comiat.`,
    '- **Perfil «Cap»:** és el missatge genèric, quan el visitant no ha triat perfil.',
    '- **Dades de la sessió:** si el visitant ja ha donat el nom, el producte o si té embarcació, es nota en una línia entre el text i el comiat; les que no té no hi surten.',
    '',
  ];
  for (const lang of config.languages) {
    const d = dict[lang];
    out.push(`### ${LANGS[lang]}`, '', '| Perfil | Via | Assumpte | Missatge |', '|---|---|---|---|');
    for (const [key, label] of PROFILES) {
      out.push(`| ${label} | WhatsApp | — | ${cell(whatsappText(d, { profile: key }))} |`);
      out.push(`| ${label} | Correu | ${cell(d.messages[key].subject)} | ${cell(emailBody(d, { profile: key }))} |`);
    }
    const example = { profile: 'particular', name: 'Ana', product: 'Modelo A', hasBoat: d.form.yes, intent: d.form.no };
    out.push(`| Particular amb dades de sessió (exemple) | WhatsApp | — | ${cell(whatsappText(d, example))} |`);
    out.push(`| Particular amb dades de sessió (exemple) | Correu | ${cell(d.messages.particular.subject)} | ${cell(emailBody(d, example))} |`);
    out.push('');
  }
  out.push(
    '## Per revisar',
    '',
    '- **Tractament:** castellà i català de tu; portuguès de «você» formal («Escreva-nos»). Cal confirmar-ho amb Bruno.',
    '- **«Distribuïdor o professional»** agrupa dos perfils en un xip. Confirmar que no calen dos xips separats. A més, el xip ho diu així però el missatge només diu «distribuïdor».',
    '- **Portuguès:** revisar-lo amb un parlant natiu de la variant europea (per exemple «e-mail»). El comiat dels correus, «Obrigado», és masculí; «Obrigado(a)» o «Cumprimentos» seria neutre.',
    '- **Anglès, distribuïdor:** «I am a distributor and I am interested in…» repeteix «I am».',
    '- **Perfil «Cap»:** «He visto vuestro stand…» suposa que el visitant ha estat a l\'estand; no encaixa si arriba pel QR sense passar-hi.',
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
