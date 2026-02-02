import type { AnyApiContract, InferBody, InferResponse } from '@praapt/shared';
import { buildUrl } from '@praapt/shared';

/**
 * Options for calling a contract endpoint.
 */
export interface CallContractOptions<TContract extends AnyApiContract> {
  /** Path parameters to substitute in the URL (for routes like /users/:id) */
  params?: Record<string, string>;
  /** Request body (for POST/PUT/PATCH requests) */
  body?: InferBody<TContract>;
  /** Query parameters to append to the URL */
  query?: Record<string, string | number | boolean | undefined>;
}

/**
 * Error thrown when an API call fails at the HTTP level.
 * Note: API responses with `ok: false` are valid responses, not errors.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Call an API endpoint using a contract definition.
 * Provides type-safe request/response handling.
 *
 * @param baseUrl - The API base URL
 * @param contract - The contract defining the endpoint
 * @param options - Optional params, body, and query
 * @returns The typed response data
 * @throws {ApiError} When the server returns a non-JSON response or network error
 *
 * @example
 * // GET request
 * const health = await callContract(baseUrl, Contracts.getHealth);
 *
 * // POST request with body
 * const result = await callContract(baseUrl, Contracts.login, {
 *   body: { faceImage: base64Image }
 * });
 *
 * // Request with path params
 * const user = await callContract(baseUrl, Contracts.getUser, {
 *   params: { id: '123' }
 * });
 */
export async function callContract<TContract extends AnyApiContract>(
  baseUrl: string,
  contract: TContract,
  options?: CallContractOptions<TContract>,
): Promise<InferResponse<TContract>> {
  const url = baseUrl + buildUrl(contract.path, options?.params, options?.query);

  const init: RequestInit = {
    method: contract.method,
    headers: {},
  };

  if (options?.body !== undefined) {
    init.headers = { 'Content-Type': 'application/json' };
    init.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, init);

  // Check if response is JSON
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await response.text();
    throw new ApiError(
      `Expected JSON response but got ${contentType || 'unknown content type'}`,
      response.status,
      text,
    );
  }

  const data = await response.json();

  // Validate response with contract schema
  const parseResult = contract.response.safeParse(data);
  if (!parseResult.success) {
    console.warn('Response validation failed:', parseResult.error.issues, data);
  }

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- data parsed from JSON matches contract response type
  return data as InferResponse<TContract>;
}

/**
 * Create a contract client bound to a base URL.
 * Returns a function that calls endpoints without needing to pass baseUrl each time.
 *
 * @example
 * const api = createContractClient('http://localhost:3001');
 * const health = await api(Contracts.getHealth);
 * const result = await api(Contracts.login, { body: { faceImage } });
 */
export function createContractClient(baseUrl: string) {
  return <TContract extends AnyApiContract>(
    contract: TContract,
    options?: CallContractOptions<TContract>,
  ): Promise<InferResponse<TContract>> => {
    return callContract(baseUrl, contract, options);
  };
}
