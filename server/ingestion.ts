import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const allowedExtensions = new Set([
  '.csv', '.diff', '.json', '.log', '.md', '.pdf', '.png', '.txt', '.yaml', '.yml',
]);

const allowedMimeTypes = new Set([
  'application/json',
  'application/pdf',
  'application/octet-stream',
  'image/png',
  'text/csv',
  'text/markdown',
  'text/plain',
  'text/x-diff',
  'text/yaml',
]);

export interface UploadValidation {
  accepted: boolean;
  reason?: string;
  safeName: string;
  sha256?: string;
  detectedType?: string;
}

export function safeEvidenceName(originalName: string): string {
  const base = path.basename(originalName).normalize('NFKC');
  return base.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/^\.+/, '').slice(0, 180) || 'evidence';
}

export async function validateEvidenceUpload(file: Express.Multer.File): Promise<UploadValidation> {
  const safeName = safeEvidenceName(file.originalname);
  const extension = path.extname(safeName).toLowerCase();
  if (!allowedExtensions.has(extension)) return { accepted: false, reason: 'Unsupported evidence extension', safeName };
  if (!allowedMimeTypes.has(file.mimetype)) return { accepted: false, reason: 'Unsupported evidence content type', safeName };

  const bytes = await readFile(file.path);
  if (!bytes.length) return { accepted: false, reason: 'Evidence file is empty', safeName };

  const looksExecutable = bytes.subarray(0, 4).equals(Buffer.from([0x7f, 0x45, 0x4c, 0x46])) ||
    bytes.subarray(0, 2).equals(Buffer.from([0x4d, 0x5a]));
  if (looksExecutable) return { accepted: false, reason: 'Executable content is not accepted as evidence', safeName };

  return {
    accepted: true,
    safeName,
    sha256: createHash('sha256').update(bytes).digest('hex'),
    detectedType: extension.slice(1),
  };
}
