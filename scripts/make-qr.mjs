import QRCode from 'qrcode';
import { mkdirSync } from 'node:fs';
import { CONFIG } from '../site/js/config.js';

const url = new URL(CONFIG.siteUrl);

// 1. Paràmetres base definits a config.js (opcional)
for (const [key, value] of Object.entries(CONFIG.qrParams ?? {})) {
  if (value !== undefined && value !== null && value !== '') {
    url.searchParams.set(key, String(value));
  }
}

// 2. Paràmetres passats per terminal (p. ex. npm run qr lang=es)
const cliValues = [];
for (const arg of process.argv.slice(2)) {
  const eqIndex = arg.indexOf('=');
  if (eqIndex === -1) continue;

  const key = arg.slice(0, eqIndex).replace(/^--?/, '');
  const value = arg.slice(eqIndex + 1);
  if (key && value !== '') {
    url.searchParams.set(key, value);
    cliValues.push(value);
  }
}

const targetUrl = url.toString();

// Nom del fitxer segons el valor passat (o 'qr' si no n'hi ha cap)
const fileName = (cliValues.length ? cliValues.join('-') : 'qr')
  .replace(/[^a-zA-Z0-9_-]/g, '_');

mkdirSync('out', { recursive: true });
const opts = { errorCorrectionLevel: 'M', margin: 2 };
await QRCode.toFile(`out/${fileName}.png`, targetUrl, { ...opts, width: 1024 });
await QRCode.toFile(`out/${fileName}.svg`, targetUrl, { ...opts, type: 'svg' });
console.log(`QR generat a out/${fileName}.{png,svg} per a ${targetUrl}`);