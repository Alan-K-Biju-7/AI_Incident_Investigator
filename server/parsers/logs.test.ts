import { describe, expect, it } from 'vitest';
import { parseLogText } from './logs.js';

describe('log parsing', () => {
  it('extracts ISO timestamps, levels, and messages', () => {
    const [entry] = parseLogText('2026-08-19T09:14:22.183+05:30 ERROR PoolTimeout request=req_42');
    expect(entry).toMatchObject({ timestamp: '2026-08-19T03:44:22.183Z', level: 'ERROR', message: 'PoolTimeout request=req_42', timestampConfidence: 1 });
  });

  it('handles Apache timestamps with explicit offsets', () => {
    const [entry] = parseLogText('[19/Aug/2026:03:45:01 +0000] WARN upstream response delayed');
    expect(entry.timestamp).toBe('2026-08-19T03:45:01.000Z');
    expect(entry.level).toBe('WARN');
  });

  it('preserves lines without timestamps as uncertain evidence', () => {
    const [entry] = parseLogText('ERROR retry budget exhausted');
    expect(entry).toMatchObject({ timestamp: null, timestampConfidence: 0, level: 'ERROR' });
  });
});
