import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { CONFIG } from '../site/js/config.js';

function pdfFor(label) {
  const stream = `BT /F1 18 Tf 72 760 Td (${label}) Tj ET`;
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = objects.map((body, i) => {
    const at = pdf.length;
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
    return at;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('')}`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return pdf;
}

// Documents de prova: el general i un per cada model amb dossier propi (el títol diu quin és, per veure quin s'ha obert).
writeFileSync(`site/${CONFIG.dossierUrl}`, pdfFor('The Silent Fleet - documento de prueba'), 'latin1');
for (const product of CONFIG.products.filter((p) => p.dossierUrl)) {
  mkdirSync(dirname(`site/${product.dossierUrl}`), { recursive: true });
  writeFileSync(`site/${product.dossierUrl}`, pdfFor(`The Silent Fleet - documento de prueba - ${product.name}`), 'latin1');
}
