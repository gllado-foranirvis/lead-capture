// Prova de fum: node scripts/smoke-sheet.mjs <url /exec> [token]
const [url, token = ''] = process.argv.slice(2);
if (!url) { console.error('Ús: node scripts/smoke-sheet.mjs <url /exec> [token]'); process.exit(1); }

const id = `smoke-${Date.now()}`;
const contact = { name: '=HYPERLINK("http://example.com","prova")', email: 'prova@example.com', phone: '+34 600 00 00 00', privacy: true, newsletter: false, lang: 'es', origin: 'mobil', profile: 'profesional' };
const send = async (label, payload) => {
  const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(token ? { ...payload, token } : payload) });
  console.log(label, response.status, await response.text());
};

console.log('GET', (await (await fetch(url)).text()));
await send('parcial ', { id, stage: 'step1', contact });
await send('reintent', { id, stage: 'step1', contact });
await send('final   ', { id, stage: 'complete', contact, profiling: { hasBoat: 'si', enthusiasm: ['noise', 'other'], enthusiasmOther: '+34 prova' } });
await send('tardà   ', { id, stage: 'step1', contact });
await send('invàlid ', { id, stage: 'step1', contact: { ...contact, privacy: false } });
console.log(`Mira el full: ha d'haver-hi UNA fila amb id ${id}, stage complete, i el nom ha de ser text («=HYPERLINK…»), no un enllaç.`);
