import type { ErrorRequestHandler, Request, Response, NextFunction } from 'express';
import { z, ZodError, ZodSchema } from 'zod';

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
   
  _next: NextFunction,
): void => {
  // Handle known application errors
  if (err instanceof AppError) {
    const errorResponse = err.toJSON();

    // Validate error response against schema if provided
    if (err.schema) {
      const validationResult = err.schema.safeParse(errorResponse);
      if (!validationResult.success) {
        logger.error(
          {
            path: req.path,
            method: req.method,
            statusCode: err.statusCode,
            errors: validationResult.error.issues,
            response: errorResponse,
          },
          'Error response validation failed - this is a bug! Error response does not match schema.',
        );
      }
    }

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

    res.status(err.statusCode).json(errorResponse);
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
      ok: false,
      error: message,
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
    ok: false,
    error: 'Internal server error',
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

/**
 * Configuration for validated route handlers.
 */
export interface ValidatedHandlerConfig<TBody, TResponseSchema extends ZodSchema> {
  /** Zod schema to validate request body (optional for GET requests) */
  body?: ZodSchema<TBody>;
  /** Zod schema to validate response (discriminated union with ok: true/false) - REQUIRED */
  response: TResponseSchema;
  /** HTTP status code for error responses (ok: false). Defaults to 400. */
  errorStatus?: number;
}

/**
 * Type-safe async route handler with schema validation for discriminated union responses.
 *
 * Routes return either success ({ ok: true, ... }) or error ({ ok: false, error: ... }).
 * The handler validates the response and sets appropriate status codes.
 *
 * For unexpected errors (validation, database, etc.), throw normally - they'll be
 * caught by the global error handler.
 *
 * Usage:
 * ```
 * router.get('/users', validatedHandler(
 *   { response: ListUsersResponseSchema },
 *   async (req, res) => {
 *     const users = await getUsers();
 *     return { ok: true, users, count: users.length };
 *   }
 * ));
 *
 * router.post('/login', validatedHandler(
 *   { body: LoginBodySchema, response: LoginResponseSchema, errorStatus: 401 },
 *   async (req, res) => {
 *     const { faceImage } = req.body;
 *     const match = await findMatch(faceImage);
 *     if (!match) {
 *       return { ok: false, error: 'Error: Face not recognized', distance, topMatches };
 *     }
 *     return { ok: true, user: match.user, match: match.data };
 *   }
 * ));
 * ```
 */
export function validatedHandler<TBody, TResponseSchema extends ZodSchema>(
  config: ValidatedHandlerConfig<TBody, TResponseSchema>,
  fn: (
    req: Request<unknown, unknown, TBody>,
    res: Response,
    next: NextFunction,
  ) => Promise<z.infer<TResponseSchema>>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve()
      .then(async () => {
        // Validate request body if schema provided
        if (config.body) {
          const parseResult = config.body.safeParse(req.body);
          if (!parseResult.success) {
            const firstError = parseResult.error.issues[0];
            throw new (await import('./errors.js')).ValidationError(
              firstError?.message || 'Invalid request body',
            );
          }
          req.body = parseResult.data;
        }

        // Execute handler
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- req.body was just validated and assigned
        const result = await fn(req as Request<unknown, unknown, TBody>, res, next);

        // Validate response
        const responseResult = config.response.safeParse(result);
        if (!responseResult.success) {
          logger.warn(
            {
              path: req.path,
              method: req.method,
              errors: responseResult.error.issues,
              result,
            },
            'Response validation failed - sending unvalidated response',
          );
        }

        // Set status code based on ok field
        if (
          typeof result === 'object' &&
          result !== null &&
          'ok' in result &&
          result.ok === false
        ) {
          const statusCode = config.errorStatus ?? 400;
          return res.status(statusCode).json(result);
        }

        // Success response
        return res.json(result);
      })
      .catch(next);
  };
}
