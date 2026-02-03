import type { AnyApiContract, ContractAuth, InferBody, InferResponse, UserRole } from '@praapt/shared';
import type { NextFunction, Request, RequestHandler, Response, Router } from 'express';
import type { ZodSchema } from 'zod';

import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/authorization.js';
import { validatedHandler, type ValidatedHandlerConfig } from './errorHandler.js';

/**
 * Handler function type for contract-based routes.
 * Receives the typed request and response, returns the response data.
 * Note: params are typed as Record<string, string> for Express compatibility.
 * Use `as { id: string }` etc. in handlers if you need type-safe param access.
 */
type ContractHandler<TContract extends AnyApiContract> = (
  req: Request<Record<string, string>, unknown, InferBody<TContract>>,
  res: Response,
  next: NextFunction,
) => Promise<InferResponse<TContract>>;

/**
 * Options for registering a contract-based route.
 */
interface FromContractOptions {
  /** HTTP status code for error responses (ok: false). Defaults to 400. */
  errorStatus?: number;
  /**
   * Additional middleware to run AFTER auth checks but before the handler.
   * Use this for complex authorization logic (e.g., requireRoleUpdatePermission).
   * Basic auth (public/authenticated/role) is auto-derived from contract.auth.
   */
  middleware?: RequestHandler[];
}

/**
 * Build auth middleware based on contract's auth requirement.
 * Returns an array of middleware to apply.
 */
function buildAuthMiddleware(auth: ContractAuth): RequestHandler[] {
  // Public endpoints need no auth
  if (auth === 'public') {
    return [];
  }

  // Authenticated endpoints just need requireAuth
  if (auth === 'authenticated') {
    return [requireAuth];
  }

  // Role-based endpoints need requireAuth + requireRole
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- auth is validated by ContractAuth type
  const roles = auth as UserRole[];
  return [requireAuth, requireRole(...roles)];
}

/**
 * Route builder that creates routes from API contracts.
 * Provides type-safe route registration with automatic validation and auth.
 */
export interface RouteBuilder {
  /**
   * Register a route from an API contract.
   * The contract defines method, path, schemas, and auth requirements.
   * Auth middleware is automatically applied based on contract.auth.
   * The handler receives typed request data and must return typed response.
   */
  fromContract<TContract extends AnyApiContract>(
    contract: TContract,
    handler: ContractHandler<TContract>,
    options?: FromContractOptions,
  ): void;
}

/**
 * Create a route builder for the given Express router.
 * Routes are registered using contracts that define method, path, schemas, and auth.
 * Auth middleware is automatically derived from contract.auth:
 * - 'public': No auth required
 * - 'authenticated': requireAuth middleware
 * - UserRole[]: requireAuth + requireRole(...roles) middleware
 *
 * @example
 * const routes = createRouteBuilder(router);
 *
 * // Public endpoint (no auth)
 * routes.fromContract(Contracts.getHealth, async () => {
 *   return { ok: true, service: 'api', ... };
 * });
 *
 * // Role-protected endpoint (auth auto-applied from contract)
 * routes.fromContract(Contracts.listUsers, async () => {
 *   const users = await db.select().from(users);
 *   return { ok: true, users, count: users.length };
 * });
 *
 * // Custom middleware for complex auth logic
 * routes.fromContract(Contracts.updateUserRole, async (req) => {
 *   // ... update role logic
 * }, { middleware: [requireRoleUpdatePermission()] });
 */
export function createRouteBuilder(router: Router): RouteBuilder {
  return {
    fromContract<TContract extends AnyApiContract>(
      contract: TContract,
      handler: ContractHandler<TContract>,
      options?: FromContractOptions,
    ): void {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- method is validated by HttpMethod type
      const method = contract.method.toLowerCase() as 'get' | 'post' | 'put' | 'patch' | 'delete';

      const config: ValidatedHandlerConfig<InferBody<TContract>, ZodSchema<InferResponse<TContract>>> = {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- response schema comes from contract with same generic
        response: contract.response as ZodSchema<InferResponse<TContract>>,
        errorStatus: options?.errorStatus,
      };

      if (contract.body) {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- body schema comes from contract with same generic
        config.body = contract.body as ZodSchema<InferBody<TContract>>;
      }

      // Cast handler to any to satisfy validatedHandler's type expectations
      // The types are compatible at runtime - validatedHandler just wraps the handler
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/consistent-type-assertions -- handler type is validated by ContractHandler
      const wrappedHandler = validatedHandler(config, handler as any);

      // Build middleware chain: auth (from contract) -> custom middleware -> handler
      const authMiddleware = buildAuthMiddleware(contract.auth);
      const handlers: RequestHandler[] = [
        ...authMiddleware,
        ...(options?.middleware ?? []),
        wrappedHandler,
      ];

      router[method](contract.path, ...handlers);
    },
  };
}
