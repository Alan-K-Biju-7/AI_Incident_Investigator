import { describe, expect, it } from 'vitest';
import { parseMetricCsv, parseMetricJson } from './metrics.js';

describe('metric normalization', () => {
  it('normalizes CSV records and retains metadata labels', () => {
    const result = parseMetricCsv('timestamp,name,value,unit,service\n2026-08-19T03:32:00Z,db.pool,98,percent,checkout-api');
    expect(result.rejected).toEqual([]);
    expect(result.records[0]).toEqual({ timestamp:'2026-08-19T03:32:00.000Z', name:'db.pool', value:98, unit:'percent', labels:{ service:'checkout-api' } });
  });

  it('supports quoted CSV values', () => {
    const result = parseMetricCsv('timestamp,name,value,region\n2026-08-19T03:32:00Z,"latency,p95",412,"us-east-1"');
    expect(result.records[0].name).toBe('latency,p95');
  });

  it('reports invalid rows without losing valid JSON records', () => {
    const result = parseMetricJson([{ timestamp:'bad', name:'errors', value:4 },{ timestamp:'2026-08-19T03:33:00Z', metric:'errors', value:'5' }]);
    expect(result.records).toHaveLength(1);
    expect(result.rejected).toEqual([{ row:2, reason:'Missing or invalid timestamp' }]);
  });
});
