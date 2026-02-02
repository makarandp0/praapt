import type { z } from 'zod';

/**
 * HTTP methods supported by API contracts.
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

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
 * Captures method, path, and all request/response schemas.
 */
export interface ApiContract<
  TPath extends string = string,
  TBody extends z.ZodTypeAny | undefined = undefined,
  TQuery extends z.ZodTypeAny | undefined = undefined,
  TResponse extends z.ZodTypeAny = z.ZodTypeAny,
> {
  method: HttpMethod;
  path: TPath;
  body?: TBody;
  query?: TQuery;
  response: TResponse;
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
>(contract: ApiContract<TPath, TBody, TQuery, TResponse>): ApiContract<TPath, TBody, TQuery, TResponse> {
  return contract;
}

// ============================================================================
// Type inference helpers for consuming contracts
// ============================================================================

/**
 * Infer the request body type from a contract.
 */
export type InferBody<C> = C extends ApiContract<string, infer B, z.ZodTypeAny | undefined, z.ZodTypeAny>
  ? B extends z.ZodTypeAny
    ? z.infer<B>
    : undefined
  : never;

/**
 * Infer the query parameters type from a contract.
 */
export type InferQuery<C> = C extends ApiContract<string, z.ZodTypeAny | undefined, infer Q, z.ZodTypeAny>
  ? Q extends z.ZodTypeAny
    ? z.infer<Q>
    : undefined
  : never;

/**
 * Infer the response type from a contract.
 */
export type InferResponse<C> = C extends ApiContract<string, z.ZodTypeAny | undefined, z.ZodTypeAny | undefined, infer R>
  ? R extends z.ZodTypeAny
    ? z.infer<R>
    : never
  : never;

/**
 * Infer the path parameters type from a contract.
 */
export type InferParams<C> = C extends ApiContract<infer P, z.ZodTypeAny | undefined, z.ZodTypeAny | undefined, z.ZodTypeAny>
  ? PathParamsObject<P>
  : never;

/**
 * Extract the path string from a contract.
 */
export type InferPath<C> = C extends ApiContract<infer P, z.ZodTypeAny | undefined, z.ZodTypeAny | undefined, z.ZodTypeAny>
  ? P
  : never;

/**
 * Any API contract type - used for accepting contracts with any body/query configuration.
 * This is useful when you need a generic constraint that accepts any valid contract.
 */
export type AnyApiContract = ApiContract<string, z.ZodTypeAny | undefined, z.ZodTypeAny | undefined, z.ZodTypeAny>;
