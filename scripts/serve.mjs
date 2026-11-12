// Servidor estàtic local per a `npm run serve`: serveix site/ sense memòria cau. (`python -m http.server` envia només
// Last-Modified i el navegador n'amaga mòduls JS antics, de manera que l'app barreja fitxers vells i nous i no es carrega.)
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json',
  '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.pdf': 'application/pdf',
};

export function createStaticServer(root) {
  const base = resolve(root);
  return createServer(async (req, res) => {
    const reply = (status, body = '', type = 'text/plain; charset=utf-8') => {
      res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' });
      res.end(body);
    };
    try {
      let path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      if (path.endsWith('/')) path += 'index.html';
      const file = normalize(join(base, path));
      if (file !== base && !file.startsWith(base + sep)) return reply(404, 'No trobat');
      reply(200, await readFile(file), TYPES[extname(file)] ?? 'application/octet-stream');
    } catch {
      reply(404, 'No trobat');
    }
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT) || 8080;
  createStaticServer('site').listen(port, () => console.log(`http://localhost:${port}  (sense memòria cau; Ctrl+C per aturar-lo)`));
}
