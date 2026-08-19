import { describe, expect, it } from 'vitest';
import { createProvenance, timestampCoverage } from './provenance.js';

describe('evidence provenance', () => {
  const records = [
    { timestamp:'2026-08-19T03:34:00.000Z', name:'errors', value:5, unit:null, labels:{} },
    { timestamp:'2026-08-19T03:32:00.000Z', name:'errors', value:1, unit:null, labels:{} },
  ];

  it('computes normalized timestamp coverage', () => {
    expect(timestampCoverage(records)).toEqual({ start:'2026-08-19T03:32:00.000Z', end:'2026-08-19T03:34:00.000Z' });
  });

  it('scores reliability from transparent source factors', () => {
    const result = createProvenance({ sha256:'abc', originalName:'metrics.csv', origin:'automated-export', sourceSystem:'prometheus', parser:'metrics/csv', records, receivedAt:'2026-08-19T04:00:00Z' });
    expect(result.reliability).toBe(1);
    expect(result.reliabilityReasons).toEqual(['automated-export baseline','source system identified','multiple parseable records','timestamp coverage established']);
  });

  it('reduces reliability when parsing rejects records', () => {
    const clean = createProvenance({ sha256:'a', originalName:'a.log', parser:'logs', records });
    const partial = createProvenance({ sha256:'b', originalName:'b.log', parser:'logs', records, parseErrors:3 });
    expect(partial.reliability).toBeLessThan(clean.reliability);
  });
});
