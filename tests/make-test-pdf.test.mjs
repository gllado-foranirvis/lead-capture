import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { CONFIG } from '../site/js/config.js';

const SCRIPT = resolve('scripts/make-test-pdf.mjs');
const REAL = '%PDF-1.4\n% document real de Bruno\n%%EOF\n';
const run = (cwd) => execFileSync('node', [SCRIPT], { cwd });

test('el generador de PDF de prova no trepitja mai un document real', () => {
  const cwd = mkdtempSync(join(tmpdir(), 'tsf-pdf-'));
  mkdirSync(join(cwd, 'site/dossiers'), { recursive: true });
  const [own] = CONFIG.products.filter((p) => p.dossierUrl);
  writeFileSync(join(cwd, 'site', CONFIG.dossierUrl), REAL);
  writeFileSync(join(cwd, 'site', own.dossierUrl), REAL);
  run(cwd);
  assert.equal(readFileSync(join(cwd, 'site', CONFIG.dossierUrl), 'utf8'), REAL);
  assert.equal(readFileSync(join(cwd, 'site', own.dossierUrl), 'utf8'), REAL);
});
test('crea els que falten i refà els que ja són de prova', () => {
  const cwd = mkdtempSync(join(tmpdir(), 'tsf-pdf-'));
  mkdirSync(join(cwd, 'site'), { recursive: true });
  run(cwd);
  const files = [CONFIG.dossierUrl, ...CONFIG.products.map((p) => p.dossierUrl).filter(Boolean)];
  for (const f of files) assert.ok(existsSync(join(cwd, 'site', f)), f);
  const before = readFileSync(join(cwd, 'site', CONFIG.dossierUrl), 'latin1');
  assert.match(before, /documento de prueba/);
  run(cwd);
  assert.equal(readFileSync(join(cwd, 'site', CONFIG.dossierUrl), 'latin1'), before);
});
