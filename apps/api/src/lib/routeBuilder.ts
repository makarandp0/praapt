import type { AnyApiContract, InferBody, InferResponse } from '@praapt/shared';
import type { NextFunction, Request, Response, Router } from 'express';
import type { ZodSchema } from 'zod';

import { validatedHandler, type ValidatedHandlerConfig } from './errorHandler.js';

/**
 * Handler function type for contract-based routes.
 * Receives the typed request and response, returns the response data.
 */
type ContractHandler<TContract extends AnyApiContract> = (
  req: Request<unknown, unknown, InferBody<TContract>>,
  res: Response,
  next: NextFunction,
) => Promise<InferResponse<TContract>>;

/**
 * Options for registering a contract-based route.
 */
interface FromContractOptions {
  /** HTTP status code for error responses (ok: false). Defaults to 400. */
  errorStatus?: number;
}

/**
 * Route builder that creates routes from API contracts.
 * Provides type-safe route registration with automatic validation.
 */
export interface RouteBuilder {
  /**
   * Register a route from an API contract.
   * The contract defines method, path, and schemas.
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
 * Routes are registered using contracts that define method, path, and schemas.
 *
 * @example
 * const routes = createRouteBuilder(router);
 *
 * routes.fromContract(Contracts.getHealth, async () => {
 *   return { ok: true, service: 'api', ... };
 * });
 *
 * routes.fromContract(Contracts.login, async (req) => {
 *   const { faceImage } = req.body;
 *   // ... authentication logic
 *   return { ok: true, user, match, topMatches };
 * }, { errorStatus: 401 });
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

      router[method](contract.path, validatedHandler(config, handler));
    },
  };
}
