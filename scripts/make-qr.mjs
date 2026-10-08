import QRCode from 'qrcode';
import { mkdirSync } from 'node:fs';
import { CONFIG } from '../site/js/config.js';

mkdirSync('out', { recursive: true });
const opts = { errorCorrectionLevel: 'M', margin: 2 };
await QRCode.toFile('out/qr.png', CONFIG.siteUrl, { ...opts, width: 1024 });
await QRCode.toFile('out/qr.svg', CONFIG.siteUrl, { ...opts, type: 'svg' });
console.log(`QR per a ${CONFIG.siteUrl}`);
