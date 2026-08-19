import type { ParsedLogLine } from './parsers/logs.js';
import type { NormalizedMetric } from './parsers/metrics.js';

export type EvidenceOrigin = 'automated-export' | 'repository' | 'human-upload' | 'external-status' | 'generated';

export interface EvidenceProvenance {
  sha256: string;
  originalName: string;
  receivedAt: string;
  origin: EvidenceOrigin;
  sourceSystem: string | null;
  parser: string;
  parserVersion: string;
  timestampCoverage: { start: string; end: string } | null;
  reliability: number;
  reliabilityReasons: string[];
}

const originReliability: Record<EvidenceOrigin, number> = {
  'automated-export': .92,
  repository: .9,
  'human-upload': .7,
  'external-status': .72,
  generated: .55,
};

export function timestampCoverage(records: Array<ParsedLogLine | NormalizedMetric>) {
  const timestamps = records.map(record => record.timestamp).filter((value): value is string => Boolean(value)).sort();
  return timestamps.length ? { start: timestamps[0], end: timestamps.at(-1)! } : null;
}

export function createProvenance(input: {
  sha256: string;
  originalName: string;
  origin?: EvidenceOrigin;
  sourceSystem?: string;
  parser: string;
  records?: Array<ParsedLogLine | NormalizedMetric>;
  parseErrors?: number;
  receivedAt?: string;
}): EvidenceProvenance {
  const origin = input.origin ?? 'human-upload';
  const reasons = [`${origin} baseline`];
  let reliability = originReliability[origin];
  if (input.sourceSystem) { reliability += .04; reasons.push('source system identified'); }
  const recordCount = input.records?.length ?? 0;
  const errors = input.parseErrors ?? 0;
  if (recordCount >= 2) { reliability += .03; reasons.push('multiple parseable records'); }
  if (errors > 0) { reliability -= Math.min(.2, errors / Math.max(1,recordCount + errors) * .2); reasons.push(`${errors} records rejected`); }
  const coverage = timestampCoverage(input.records ?? []);
  if (coverage) { reliability += .01; reasons.push('timestamp coverage established'); }
  return {
    sha256: input.sha256,
    originalName: input.originalName,
    receivedAt: input.receivedAt ?? new Date().toISOString(),
    origin,
    sourceSystem: input.sourceSystem ?? null,
    parser: input.parser,
    parserVersion: '1.0.0',
    timestampCoverage: coverage,
    reliability: +Math.max(0,Math.min(1,reliability)).toFixed(2),
    reliabilityReasons: reasons,
  };
}
