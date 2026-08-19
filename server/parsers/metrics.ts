import { normalizeTimestamp } from '../engine.js';

export interface NormalizedMetric {
  timestamp: string;
  name: string;
  value: number;
  unit: string | null;
  labels: Record<string, string>;
}

export interface MetricParseResult {
  records: NormalizedMetric[];
  rejected: Array<{ row: number; reason: string }>;
}

const reserved = new Set(['timestamp', 'time', 'name', 'metric', 'value', 'unit']);

function normalizeRow(row: Record<string, unknown>, index: number): NormalizedMetric | { row: number; reason: string } {
  const rawTimestamp = String(row.timestamp ?? row.time ?? '');
  const timestamp = normalizeTimestamp(rawTimestamp);
  if (!timestamp) return { row: index, reason: 'Missing or invalid timestamp' };
  const name = String(row.name ?? row.metric ?? '').trim();
  if (!name) return { row: index, reason: 'Metric name is required' };
  const value = typeof row.value === 'number' ? row.value : Number(row.value);
  if (!Number.isFinite(value)) return { row: index, reason: 'Metric value must be finite' };
  const labels = Object.fromEntries(Object.entries(row).filter(([key,value]) => !reserved.has(key) && value != null).map(([key,value]) => [key,String(value)]));
  return { timestamp, name, value, unit: row.unit ? String(row.unit) : null, labels };
}

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let quoted = false;
  for (let index = 0; index < line.length; index++) {
    const character = line[index];
    if (character === '"' && line[index + 1] === '"' && quoted) { current += '"'; index++; }
    else if (character === '"') quoted = !quoted;
    else if (character === ',' && !quoted) { values.push(current.trim()); current = ''; }
    else current += character;
  }
  values.push(current.trim());
  return values;
}

export function parseMetricCsv(text: string): MetricParseResult {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter(line => line.trim());
  if (lines.length < 2) return { records: [], rejected: [{ row: 1, reason: 'CSV requires a header and at least one record' }] };
  const headers = parseCsvLine(lines[0]).map(header => header.toLowerCase());
  return normalizeMetricRows(lines.slice(1).map(line => Object.fromEntries(headers.map((header,index) => [header,parseCsvLine(line)[index]]))));
}

export function parseMetricJson(input: string | unknown[]): MetricParseResult {
  try {
    const parsed = typeof input === 'string' ? JSON.parse(input) : input;
    if (!Array.isArray(parsed)) return { records: [], rejected: [{ row: 1, reason: 'Metric JSON must be an array' }] };
    return normalizeMetricRows(parsed as Record<string, unknown>[]);
  } catch {
    return { records: [], rejected: [{ row: 1, reason: 'Metric JSON is malformed' }] };
  }
}

export function normalizeMetricRows(rows: Record<string, unknown>[]): MetricParseResult {
  const records: NormalizedMetric[] = [];
  const rejected: MetricParseResult['rejected'] = [];
  rows.forEach((row,index) => {
    const result = normalizeRow(row,index + 2);
    if ('reason' in result) rejected.push(result); else records.push(result);
  });
  return { records: records.sort((a,b) => Date.parse(a.timestamp) - Date.parse(b.timestamp)), rejected };
}
