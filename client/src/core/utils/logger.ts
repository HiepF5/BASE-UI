// ============================================================
// Structured Logger – Phase 5 DX: Logging strategy
// Environment-aware, leveled, structured logging utility
// ============================================================

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: Record<string, unknown>;
}

type LogHandler = (entry: LogEntry) => void;

// Numeric log levels for comparison
const LOG_LEVEL_MAP: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// ─── Configuration ──────────────────────────────────────────

interface LoggerConfig {
  /** Minimum level to output (default: 'debug' in dev, 'warn' in prod) */
  minLevel: LogLevel;
  /** Enable structured JSON output (useful for log aggregators) */
  structured: boolean;
  /** Custom handlers for specific levels (e.g. send errors to Sentry) */
  handlers: LogHandler[];
  /** Whether logging is enabled at all */
  enabled: boolean;
}

const IS_DEV = import.meta.env.DEV;
const IS_TEST = import.meta.env.MODE === 'test';

const defaultConfig: LoggerConfig = {
  minLevel: IS_DEV ? 'debug' : 'warn',
  structured: !IS_DEV,
  handlers: [],
  enabled: !IS_TEST,
};

let config: LoggerConfig = { ...defaultConfig };

// ─── Core Logger ────────────────────────────────────────────

function shouldLog(level: LogLevel): boolean {
  if (!config.enabled) return false;
  return LOG_LEVEL_MAP[level] >= LOG_LEVEL_MAP[config.minLevel];
}

function createEntry(level: LogLevel, message: string, data?: Record<string, unknown>): LogEntry {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(data && { data }),
  };
}

function formatForConsole(entry: LogEntry): string {
  const prefix = `[${entry.level.toUpperCase()}]`;
  const time = entry.timestamp.split('T')[1]?.replace('Z', '') ?? '';
  return `${prefix} ${time} ${entry.message}`;
}

function output(entry: LogEntry): void {
  // Console output
  const consoleMethod =
    entry.level === 'debug'
      ? 'debug'
      : entry.level === 'info'
        ? 'info'
        : entry.level === 'warn'
          ? 'warn'
          : 'error';

  if (config.structured) {
    // JSON output for log aggregators
    // eslint-disable-next-line no-console
    console[consoleMethod](JSON.stringify(entry));
  } else {
    // Human-readable output for development
    const formatted = formatForConsole(entry);
    if (entry.data) {
      // eslint-disable-next-line no-console
      console[consoleMethod](formatted, entry.data);
    } else {
      // eslint-disable-next-line no-console
      console[consoleMethod](formatted);
    }
  }

  // Custom handlers
  for (const handler of config.handlers) {
    try {
      handler(entry);
    } catch {
      // Don't let handler errors crash the app
    }
  }
}

// ─── Public API ─────────────────────────────────────────────

export const logger = {
  debug(message: string, data?: Record<string, unknown>): void {
    if (!shouldLog('debug')) return;
    output(createEntry('debug', message, data));
  },

  info(message: string, data?: Record<string, unknown>): void {
    if (!shouldLog('info')) return;
    output(createEntry('info', message, data));
  },

  warn(message: string, data?: Record<string, unknown>): void {
    if (!shouldLog('warn')) return;
    output(createEntry('warn', message, data));
  },

  error(message: string, data?: Record<string, unknown>): void {
    if (!shouldLog('error')) return;
    output(createEntry('error', message, data));
  },

  /** Configure logging behavior */
  configure(partial: Partial<LoggerConfig>): void {
    config = { ...config, ...partial };
  },

  /** Add a custom log handler (e.g. Sentry, analytics) */
  addHandler(handler: LogHandler): () => void {
    config.handlers.push(handler);
    return () => {
      config.handlers = config.handlers.filter((h) => h !== handler);
    };
  },

  /** Reset to default configuration */
  reset(): void {
    config = { ...defaultConfig };
  },

  /** Create a child logger with a fixed prefix */
  child(prefix: string) {
    return {
      debug: (msg: string, data?: Record<string, unknown>) =>
        logger.debug(`[${prefix}] ${msg}`, data),
      info: (msg: string, data?: Record<string, unknown>) =>
        logger.info(`[${prefix}] ${msg}`, data),
      warn: (msg: string, data?: Record<string, unknown>) =>
        logger.warn(`[${prefix}] ${msg}`, data),
      error: (msg: string, data?: Record<string, unknown>) =>
        logger.error(`[${prefix}] ${msg}`, data),
    };
  },
} as const;
