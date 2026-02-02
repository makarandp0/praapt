/**
 * URL utilities for building API paths with params and query strings.
 */

/**
 * Build a query string from an object.
 * Handles undefined values by omitting them.
 */
export function buildQueryString(query: Record<string, string | number | boolean | undefined>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) {
      params.append(key, String(value));
    }
  }
  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Build a URL from a path template and params.
 * Replaces :param placeholders with actual values.
 *
 * @example
 * buildUrl('/users/:id', { id: '123' }) // '/users/123'
 * buildUrl('/users/:id/posts/:postId', { id: '1', postId: '2' }) // '/users/1/posts/2'
 */
export function buildUrl<T extends string>(
  pathTemplate: T,
  params?: Record<string, string>,
  query?: Record<string, string | number | boolean | undefined>,
): string {
  let path: string = pathTemplate;

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      path = path.replace(`:${key}`, encodeURIComponent(value));
    }
  }

  if (query) {
    path += buildQueryString(query);
  }

  return path;
}
