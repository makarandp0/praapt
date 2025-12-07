import type { ZodSchema } from 'zod';

/**
 * Base application error class.
 * All custom errors should extend this.
 *
 * Errors can optionally include a Zod schema for validating the error response.
 * This enables compile-time type checking of error data.
 */
export abstract class AppError<TData = undefined> extends Error {
  abstract readonly statusCode: number;
  abstract readonly code: string;
  readonly isOperational: boolean = true;
  readonly data?: TData;
  readonly schema?: ZodSchema<TData>;

  constructor(message: string, data?: TData, schema?: ZodSchema<TData>) {
    super(message);
    this.name = this.constructor.name;
    this.data = data;
    this.schema = schema;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON(): Record<string, unknown> {
    const base: Record<string, unknown> = {
      ok: false,
      error: this.message,
      code: this.code,
    };
    if (this.data !== undefined && typeof this.data === 'object' && this.data !== null) {
      Object.assign(base, this.data);
    }
    return base;
  }
}

/**
 * 400 Bad Request - Invalid input or validation failure
 */
export class ValidationError extends AppError {
  readonly statusCode = 400;
  readonly code = 'VALIDATION_ERROR';

  constructor(message: string = 'Invalid request') {
    super(message);
  }
}

/**
 * 401 Unauthorized - Authentication required or failed
 * Supports typed additional data via generic parameter.
 *
 * Usage:
 * ```
 * // Simple error
 * throw new UnauthorizedError('Error: Not logged in');
 *
 * // With typed data and schema validation
 * throw new UnauthorizedError('Error: Face not recognized', {
 *   distance: 0.5,
 *   threshold: 0.4,
 *   topMatches: [...]
 * }, LoginFailureResponseSchema);
 * ```
 */
export class UnauthorizedError<TData = undefined> extends AppError<TData> {
  readonly statusCode = 401;
  readonly code = 'UNAUTHORIZED';

  constructor(message: string = 'Unauthorized', data?: TData, schema?: ZodSchema<TData>) {
    super(message, data, schema);
  }
}

/**
 * 403 Forbidden - Authenticated but not allowed
 */
export class ForbiddenError extends AppError {
  readonly statusCode = 403;
  readonly code = 'FORBIDDEN';

  constructor(message: string = 'Forbidden') {
    super(message);
  }
}

/**
 * 404 Not Found - Resource not found
 */
export class NotFoundError extends AppError {
  readonly statusCode = 404;
  readonly code = 'NOT_FOUND';

  constructor(message: string = 'Not found') {
    super(message);
  }
}

/**
 * 409 Conflict - Resource already exists or conflicting state
 */
export class ConflictError extends AppError {
  readonly statusCode = 409;
  readonly code = 'CONFLICT';

  constructor(message: string = 'Conflict') {
    super(message);
  }
}

/**
 * 500 Internal Server Error - Unexpected errors
 */
export class InternalError extends AppError {
  readonly statusCode = 500;
  readonly code = 'INTERNAL_ERROR';

  constructor(message: string = 'Internal server error') {
    super(message);
  }
}

/**
 * 503 Service Unavailable - External service failure
 */
export class ServiceUnavailableError extends AppError {
  readonly statusCode = 503;
  readonly code = 'SERVICE_UNAVAILABLE';

  constructor(message: string = 'Service unavailable') {
    super(message);
  }
}
