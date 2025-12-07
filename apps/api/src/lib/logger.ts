import pinoLogger from 'pino';
import type { Logger as PinoLogger, Bindings } from 'pino';

import { NODE_ENV } from '../env.js';

/**
 * Structured logger for the API.
 *
 * In development, logs are formatted with pino-pretty for readability.
 * In production, logs are JSON for structured logging systems.
 */
export const logger = pinoLogger({
  level: process.env.LOG_LEVEL || (NODE_ENV === 'production' ? 'info' : 'debug'),
  transport:
    NODE_ENV !== 'production'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
  base: {
    env: NODE_ENV,
  },
});

/**
 * Create a child logger with additional context.
 * Useful for adding request-specific data like requestId.
 */
export function createChildLogger(bindings: Bindings) {
  return logger.child(bindings);
}

export type Logger = PinoLogger;
