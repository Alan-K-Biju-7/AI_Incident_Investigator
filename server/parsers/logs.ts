import { normalizeTimestamp } from '../engine.js';

export interface ParsedLogLine {
  line: number;
  raw: string;
  timestamp: string | null;
  level: string | null;
  message: string;
  timestampConfidence: number;
}

const timestampPatterns = [
  /^(?<timestamp>\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?)[\s|]+/,
  /^\[(?<timestamp>\d{2}\/\w{3}\/\d{4}:\d{2}:\d{2}:\d{2} [+-]\d{4})\]\s*/,
  /^(?<timestamp>\w{3}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2})\s+/,
];

const levels = /\b(TRACE|DEBUG|INFO|WARN|WARNING|ERROR|FATAL|CRITICAL)\b/i;

function normalizeApacheTimestamp(value: string): string | null {
  const match = value.match(/^(\d{2})\/(\w{3})\/(\d{4}):(\d{2}:\d{2}:\d{2}) ([+-]\d{4})$/);
  if (!match) return null;
  const months: Record<string, string> = { Jan:'01',Feb:'02',Mar:'03',Apr:'04',May:'05',Jun:'06',Jul:'07',Aug:'08',Sep:'09',Oct:'10',Nov:'11',Dec:'12' };
  const [,day,month,year,clock,zone] = match;
  return normalizeTimestamp(`${year}-${months[month]}-${day}T${clock}${zone}`);
}

export function parseLogText(text: string, options: { defaultZone?: string; referenceYear?: number } = {}): ParsedLogLine[] {
  const defaultZone = options.defaultZone ?? 'Z';
  const referenceYear = options.referenceYear ?? new Date().getUTCFullYear();
  return text.split(/\r?\n/).filter(Boolean).map((raw, index) => {
    let timestamp: string | null = null;
    let timestampConfidence = 0;
    let message = raw;
    for (const pattern of timestampPatterns) {
      const match = raw.match(pattern);
      const value = match?.groups?.timestamp;
      if (!value) continue;
      if (/^\d{2}\//.test(value)) timestamp = normalizeApacheTimestamp(value);
      else if (/^[A-Z][a-z]{2}\s/.test(value)) timestamp = normalizeTimestamp(`${referenceYear}-${value}`, defaultZone);
      else timestamp = normalizeTimestamp(value, defaultZone);
      timestampConfidence = timestamp ? (/Z$|[+-]\d{2}:?\d{2}$/.test(value) ? 1 : .85) : 0;
      message = raw.slice(match[0].length);
      break;
    }
    const levelMatch = message.match(levels);
    return { line: index + 1, raw, timestamp, level: levelMatch?.[1].toUpperCase().replace('WARNING','WARN') ?? null, message: message.replace(levels, '').replace(/^[:\s|-]+/, ''), timestampConfidence };
  });
}
