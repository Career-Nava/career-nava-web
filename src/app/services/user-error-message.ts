const MAX_USER_ERROR_LENGTH = 280;

const TECHNICAL_MESSAGE_PATTERN = /(?:^|\b)(?:exception|stack trace|inner exception|sql|select\s+.+\s+from|insert\s+into|update\s+.+\s+set|delete\s+from|npgsql|system\.|at\s+\S+\.[a-z]+\s*\(|file:\\|line\s+\d+|token|oauth state|webhook|provider response|invalid\s+.+\s+response|missing\s+.+\s+token|http failure response for)(?:\b|:)/i;

type RecordValue = Record<string, unknown>;

/** Selects only expected, plain application messages from an unknown HTTP error. */
export function getUserErrorMessage(error: unknown, fallback: string): string {
  const root = asRecord(error);
  const errorBody = asRecord(root?.['error']);
  const status = getStatus(root);
  const allowApplicationMessage = status === null || status < 500;

  const candidates = allowApplicationMessage
    ? [
      errorBody?.['message'],
      ...getValidationMessages(errorBody?.['errors']),
      root?.['message']
    ]
    : [];

  for (const candidate of candidates) {
    const message = toSafeMessage(candidate);
    if (message) return message;
  }

  return fallback;
}

function getValidationMessages(value: unknown): unknown[] {
  if (typeof value === 'string') return [ value ];
  if (Array.isArray(value)) return value;
  const record = asRecord(value);
  if (!record) return [];

  return Object.values(record).flatMap(item => Array.isArray(item) ? item : [ item ]);
}

function toSafeMessage(value: unknown): string | null {
  if (typeof value !== 'string') return null;

  const message = value.trim().replace(/\s+/g, ' ');
  if (!message || message.length > MAX_USER_ERROR_LENGTH) return null;
  if (/[<>]/.test(message) || /^[\[{]/.test(message) || /[\]}]$/.test(message)) return null;
  if (/https?:\/\//i.test(message) || TECHNICAL_MESSAGE_PATTERN.test(message)) return null;

  return message;
}

function asRecord(value: unknown): RecordValue | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as RecordValue
    : null;
}

function getStatus(root: RecordValue | null): number | null {
  const status = root?.['status'] ?? root?.['statusCode'];
  return typeof status === 'number' && Number.isFinite(status) ? status : null;
}
