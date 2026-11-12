// Prova de fum: node scripts/smoke-sheet.mjs <url /exec> [token]
const [url, token = ''] = process.argv.slice(2);
if (!url) { console.error('Ús: node scripts/smoke-sheet.mjs <url /exec> [token]'); process.exit(1); }

const id = `smoke-${Date.now()}`;
const contact = { name: '=HYPERLINK("http://example.com","prova")', email: 'prova@example.com', phone: '+34 666 33 66 00', privacy: true, newsletter: false, lang: 'pt', origin: 'mobil', product: 'sifly,tko', city: '=1+1' };
const send = async (label, payload) => {
  const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(token ? { ...payload, token } : payload) });
  console.log(label, response.status, await response.text());
};

console.log('GET', (await (await fetch(url)).text()));
// Recorregut real: el lead es desa al pas 1 (només telèfon, sense correu) i es completa al pas 2 (amb perfilació i un text com a fórmula).
const { email: _email, ...phoneOnly } = contact;
await send('pas 1   ', { id, stage: 'step1', contact: { ...phoneOnly, email: '' } });
await send('pas 2   ', { id, stage: 'complete', contact: { ...phoneOnly, email: '' }, profiling: { profile: 'profesional', activity: 'vela', hasBoat: 'si', enthusiasm: ['noise', 'other'], enthusiasmOther: 'silenci', comments: '=1+1' } });
await send('reintent', { id, stage: 'complete', contact: { ...phoneOnly, email: '' } });
await send('saltat  ', { id: `${id}-skip`, stage: 'complete', contact });
await send('invàlid ', { id, stage: 'complete', contact: { ...contact, privacy: false } });
await send('sense contacte', { id: `${id}-x`, stage: 'complete', contact: { ...contact, email: '', phone: '' } });
const click = { visit: `visit-${Date.now()}`, button: 'whatsapp', from: 'entry', lang: 'pt', origin: 'mobil', products: 'sifly', city: 'Lisboa', device: 'mobile', os: 'ios', browserLang: 'pt-PT', tz: 'Europe/Lisbon', screen: '360x740', seconds: 12, referrer: 'www.google.com' };
const clickId = `click-${Date.now()}`;
await send('clic    ', { id: clickId, stage: 'click', click });
await send('clic rep', { id: clickId, stage: 'click', click });
await send('clic dol', { id: clickId, stage: 'click', click: { ...click, button: 'sms' } });
const downloadId = `click-dl-${Date.now()}`;
await send('descàrr.', { id: downloadId, stage: 'click', click: { ...click, button: 'download', from: 'done', products: 'sifly' } });
console.log(`Mira el full: a «Leads» ha d'haver-hi UNA fila amb id ${id} (stage complete, sense correu, perfil «profesional» i comentaris «=1+1» com a text) i una altra amb id ${id}-skip (perfil buit); cap fila amb ${id}-x.`);
console.log(`A «Clics» ha d'haver-hi UNA fila amb id ${clickId} (dia i hora de la zona del full i les 18 columnes) i UNA amb ${downloadId} (button download).`);
