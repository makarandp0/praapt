import type { ErrorRequestHandler, Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

import { AppError } from './errors.js';
import { logger } from './logger.js';

/**
 * Extract a safe error message from an unknown error.
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Unknown error';
}

/**
 * Format Zod validation errors into a readable message.
 */
function formatZodError(error: ZodError): string {
  const issues = error.issues.map((issue) => {
    const path = issue.path.join('.');
    return path ? `${path}: ${issue.message}` : issue.message;
  });
  return issues[0] || 'Validation failed';
}

/**
 * Global error handler middleware.
 *
 * Handles:
 * - AppError subclasses (operational errors with status codes)
 * - ZodError (validation errors from schema parsing)
 * - Unknown errors (logged and returned as 500)
 *
 * Usage: Add as the last middleware in Express app
 * ```
 * app.use(errorHandler);
 * ```
 */
export const errorHandler: ErrorRequestHandler = (
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void => {
  // Handle known application errors
  if (err instanceof AppError) {
    logger.warn(
      {
        err,
        statusCode: err.statusCode,
        code: err.code,
        path: req.path,
        method: req.method,
      },
      err.message,
    );

    res.status(err.statusCode).json(err.toJSON());
    return;
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const message = formatZodError(err);
    logger.warn(
      {
        validationErrors: err.issues,
        path: req.path,
        method: req.method,
      },
      `Validation error: ${message}`,
    );

    res.status(400).json({
      error: message,
      code: 'VALIDATION_ERROR',
    });
    return;
  }

  // Handle unexpected errors
  const message = err instanceof Error ? err.message : 'Unknown error';
  const stack = err instanceof Error ? err.stack : undefined;

  logger.error(
    {
      err,
      stack,
      path: req.path,
      method: req.method,
    },
    `Unhandled error: ${message}`,
  );

  res.status(500).json({
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
  });
};

/**
 * Async route wrapper to catch errors and pass to error handler.
 *
 * Usage:
 * ```
 * router.get('/users', asyncHandler(async (req, res) => {
 *   const users = await getUsers();
 *   res.json(users);
 * }));
 * ```
 */
export function asyncHandler<T>(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<T>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
