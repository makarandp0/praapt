import type { z } from 'zod';

import type { UserRole } from '../schemas.js';

/**
 * HTTP methods supported by API contracts.
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Authorization requirement for an endpoint.
 * - 'public': No authentication required
 * - 'authenticated': Any logged-in user (including 'unknown' role)
 * - UserRole[]: Specific roles required (e.g., ['developer', 'admin'])
 */
export type ContractAuth = 'public' | 'authenticated' | UserRole[];

/**
 * Extract ':param' names from a path string.
 * For example: '/documents/:id/comments/:commentId' -> 'id' | 'commentId'
 */
type ExtractPathParams<T extends string> = T extends `${string}:${infer Param}/${infer Rest}`
  ? Param | ExtractPathParams<`/${Rest}`>
  : T extends `${string}:${infer Param}`
    ? Param
    : never;

/**
 * Convert extracted param names to an object type.
 * Returns undefined if path has no params.
 */
export type PathParamsObject<T extends string> = [ExtractPathParams<T>] extends [never]
  ? undefined
  : { [K in ExtractPathParams<T>]: string };

/**
 * API contract definition for a single endpoint.
 * Captures method, path, schemas, and authorization requirements.
 */
export interface ApiContract<
  TPath extends string = string,
  TBody extends z.ZodTypeAny | undefined = undefined,
  TQuery extends z.ZodTypeAny | undefined = undefined,
  TResponse extends z.ZodTypeAny = z.ZodTypeAny,
  TAuth extends ContractAuth = ContractAuth,
> {
  method: HttpMethod;
  path: TPath;
  body?: TBody;
  query?: TQuery;
  response: TResponse;
  /** Authorization requirement for this endpoint */
  auth: TAuth;
}

/**
 * Helper function to define a contract with full type inference.
 * Use this instead of object literals for proper type narrowing.
 */
export function defineContract<
  TPath extends string,
  TBody extends z.ZodTypeAny | undefined = undefined,
  TQuery extends z.ZodTypeAny | undefined = undefined,
  TResponse extends z.ZodTypeAny = z.ZodTypeAny,
  TAuth extends ContractAuth = ContractAuth,
>(contract: ApiContract<TPath, TBody, TQuery, TResponse, TAuth>): ApiContract<TPath, TBody, TQuery, TResponse, TAuth> {
  return contract;
}

// ============================================================================
// Type inference helpers for consuming contracts
// ============================================================================

/**
 * Infer the request body type from a contract.
 */
export type InferBody<C> = C extends ApiContract<string, infer B, z.ZodTypeAny | undefined, z.ZodTypeAny, ContractAuth>
  ? B extends z.ZodTypeAny
    ? z.infer<B>
    : undefined
  : never;

/**
 * Infer the query parameters type from a contract.
 */
export type InferQuery<C> = C extends ApiContract<string, z.ZodTypeAny | undefined, infer Q, z.ZodTypeAny, ContractAuth>
  ? Q extends z.ZodTypeAny
    ? z.infer<Q>
    : undefined
  : never;

/**
 * Infer the response type from a contract.
 */
export type InferResponse<C> = C extends ApiContract<string, z.ZodTypeAny | undefined, z.ZodTypeAny | undefined, infer R, ContractAuth>
  ? R extends z.ZodTypeAny
    ? z.infer<R>
    : never
  : never;

/**
 * Infer the path parameters type from a contract.
 */
export type InferParams<C> = C extends ApiContract<infer P, z.ZodTypeAny | undefined, z.ZodTypeAny | undefined, z.ZodTypeAny, ContractAuth>
  ? PathParamsObject<P>
  : never;

/**
 * Extract the path string from a contract.
 */
export type InferPath<C> = C extends ApiContract<infer P, z.ZodTypeAny | undefined, z.ZodTypeAny | undefined, z.ZodTypeAny, ContractAuth>
  ? P
  : never;

/**
 * Infer the auth requirement from a contract.
 */
export type InferAuth<C> = C extends ApiContract<string, z.ZodTypeAny | undefined, z.ZodTypeAny | undefined, z.ZodTypeAny, infer A>
  ? A
  : never;

/**
 * Any API contract type - used for accepting contracts with any body/query configuration.
 * This is useful when you need a generic constraint that accepts any valid contract.
 */
export type AnyApiContract = ApiContract<string, z.ZodTypeAny | undefined, z.ZodTypeAny | undefined, z.ZodTypeAny, ContractAuth>;

// ============================================================================
// Authorization helpers
// ============================================================================

/**
 * Check if a user role can call a contract.
 * Use this on the client to check permissions before making API calls.
 *
 * @param contract - The API contract to check
 * @param userRole - The user's role (null if not authenticated)
 * @returns true if the user can call this endpoint
 *
 * @example
 * if (canCallContract(Contracts.listUsers, user?.role)) {
 *   // Show admin UI
 * }
 */
export function canCallContract(
  contract: AnyApiContract,
  userRole: UserRole | null,
): boolean {
  const { auth } = contract;

  // Public endpoints allow everyone
  if (auth === 'public') return true;

  // Authenticated endpoints require any logged-in user
  if (auth === 'authenticated') return userRole !== null;

  // Role-specific endpoints require the user to have one of the allowed roles
  return userRole !== null && auth.includes(userRole);
}
