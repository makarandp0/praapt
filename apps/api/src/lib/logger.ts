import pinoLogger from 'pino';
import type { Logger as PinoLogger, Bindings } from 'pino';

import { getConfig } from '../config.js';

const config = getConfig();

/**
 * Structured logger for the API.
 *
 * In development, logs are formatted with pino-pretty for readability.
 * In production, logs are JSON for structured logging systems.
 */
export const logger = pinoLogger({
  level: config.logLevel,
  transport:
    config.nodeEnv !== 'production'
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
    env: config.nodeEnv,
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
