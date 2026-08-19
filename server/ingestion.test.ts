import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { safeEvidenceName, validateEvidenceUpload } from './ingestion.js';

const temporaryDirectories: string[] = [];

async function fixture(name: string, content: string | Buffer, mimetype = 'text/plain') {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'aegis-ingestion-'));
  temporaryDirectories.push(directory);
  const filePath = path.join(directory, 'upload');
  await writeFile(filePath, content);
  return { path: filePath, originalname: name, mimetype, size: Buffer.byteLength(content) } as Express.Multer.File;
}

afterEach(async () => Promise.all(temporaryDirectories.splice(0).map(directory => rm(directory, { recursive: true }))));

describe('safe evidence names', () => {
  it('removes traversal and unsafe filename characters', () => {
    expect(safeEvidenceName('../../payment log (prod).txt')).toBe('payment_log__prod_.txt');
  });
});

describe('evidence upload validation', () => {
  it('accepts supported evidence and records its digest', async () => {
    const result = await validateEvidenceUpload(await fixture('checkout.log', '2026-08-19 ERROR timeout'));
    expect(result.accepted).toBe(true);
    expect(result.sha256).toHaveLength(64);
    expect(result.detectedType).toBe('log');
  });

  it('rejects executable content disguised as text', async () => {
    const result = await validateEvidenceUpload(await fixture('debug.txt', Buffer.from([0x7f, 0x45, 0x4c, 0x46, 0x01])));
    expect(result).toMatchObject({ accepted: false, reason: 'Executable content is not accepted as evidence' });
  });
});
