import { z, ZodObject, ZodRawShape } from 'zod';

// ─────────────────────────────────────────────────────────────────────────────
// Contract Types (for typed API definitions)
// ─────────────────────────────────────────────────────────────────────────────

export {
  type HttpMethod,
  type PathParamsObject,
  type ApiContract,
  defineContract,
  type InferBody,
  type InferQuery,
  type InferResponse,
  type InferParams,
  type InferPath,
} from './contracts/index.js';

// ─────────────────────────────────────────────────────────────────────────────
// API Response Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Default error response schema (used when no custom error is specified)
 */
export const DefaultErrorSchema = z.object({
  ok: z.literal(false),
  error: z.string(),
});
export type DefaultError = z.infer<typeof DefaultErrorSchema>;

/**
 * Creates a discriminated union API response schema.
 *
 * @param success - The success response schema (ok: true added automatically)
 * @param error - Optional custom error schema (ok: false added automatically).
 *                Defaults to { ok: false, error: string }
 *
 * @example
 * // Simple response with default error
 * const ListUsersResponseSchema = createApiResponse(
 *   z.object({ users: z.array(UserSchema), count: z.number() })
 * );
 * // Type: { ok: true, users: User[], count: number } | { ok: false, error: string }
 *
 * @example
 * // Response with custom error
 * const LoginResponseSchema = createApiResponse(
 *   z.object({ user: UserSchema, match: MatchSchema }),
 *   z.object({ error: z.string(), topMatches: z.array(MatchSchema) })
 * );
 * // Type: { ok: true, user: User, match: Match } | { ok: false, error: string, topMatches: Match[] }
 */
export function createApiResponse<
  TSuccess extends ZodRawShape,
  TError extends ZodRawShape = { error: z.ZodString },
>(success: ZodObject<TSuccess>, error?: ZodObject<TError>) {
  const successSchema = success.extend({ ok: z.literal(true) });
  const errorSchema = error
    ? error.extend({ ok: z.literal(false) })
    : z.object({ ok: z.literal(false), error: z.string() });

  return z.discriminatedUnion('ok', [successSchema, errorSchema]);
}

/**
 * Helper type to extract the success type from an API response schema
 */
export type ApiSuccess<T> = T extends { ok: true } ? T : never;

/**
 * Helper type to extract the error type from an API response schema
 */
export type ApiError<T> = T extends { ok: false } ? T : never;

// Common primitives
export const ImageName = z.string().trim().min(1, 'name required');
export type ImageName = z.infer<typeof ImageName>;

// Save image
export const SaveImageBodySchema = z.object({
  name: ImageName,
  image: z.string().min(1, 'image required'), // base64 or data URL
});
export type SaveImageBody = z.infer<typeof SaveImageBodySchema>;

export const SaveImageResponseSchema = createApiResponse(
  z.object({
    name: z.string(),
    file: z.string(),
  }),
);
export type SaveImageResponse = z.infer<typeof SaveImageResponseSchema>;

// List images
export const ListImagesResponseSchema = createApiResponse(
  z.object({
    images: z.array(z.string()),
    files: z.array(z.string()),
  }),
);
export type ListImagesResponse = z.infer<typeof ListImagesResponseSchema>;

// Compare images
export const CompareImagesBodySchema = z.object({
  a: ImageName,
  b: ImageName,
});
export type CompareImagesBody = z.infer<typeof CompareImagesBodySchema>;

export const CompareImagesResponseSchema = createApiResponse(
  z.object({
    same: z.boolean(),
    algo: z.literal('face-arcface'),
    a: z.string(),
    b: z.string(),
    distance: z.number(),
    threshold: z.number(),
    timing_ms: z.number().optional(),
    model: z.string().optional(),
  }),
);
export type CompareImagesResponse = z.infer<typeof CompareImagesResponseSchema>;

// Health check
export const FaceHealthSchema = z.object({
  ok: z.boolean(),
  modelsLoaded: z.boolean().optional(),
  model: z.string().nullable().optional(),
  commit: z.string().optional(),
});
export type FaceHealth = z.infer<typeof FaceHealthSchema>;

export const HealthResponseSchema = createApiResponse(
  z.object({
    service: z.string(),
    env: z.string(),
    commit: z.string().optional(),
    face: FaceHealthSchema,
    config: z
      .object({
        faceServiceUrl: z.string(),
        port: z.string(),
        imagesDir: z.string(),
        corsOrigin: z.string(),
      })
      .optional(),
  }),
);
export type HealthResponse = z.infer<typeof HealthResponseSchema>;
export type HealthSuccess = ApiSuccess<HealthResponse>;
export type HealthConfig = HealthSuccess['config'];

/** POST /load-model request body */
export const LoadModelBodySchema = z.object({
  model: z.enum(['buffalo_l', 'buffalo_s']),
});
export type LoadModelBody = z.infer<typeof LoadModelBodySchema>;

/** POST /load-model response */
export const LoadModelResponseSchema = createApiResponse(
  z.object({
    message: z.string(),
    model: z.string(),
  }),
);
export type LoadModelResponse = z.infer<typeof LoadModelResponseSchema>;

// Error response
export const ErrorResponseSchema = z.object({ error: z.string() });
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Auth schemas
// ─────────────────────────────────────────────────────────────────────────────

/** User object returned from auth endpoints */
export const UserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string().nullable(),
  profileImagePath: z.string().nullable(),
});
export type User = z.infer<typeof UserSchema>;

/** POST /auth/signup request body */
export const SignupBodySchema = z.object({
  email: z.string().email('valid email required'),
  name: z.string().min(1, 'name required'),
  faceImage: z.string().min(1, 'face image required (base64)'),
});
export type SignupBody = z.infer<typeof SignupBodySchema>;

/** POST /auth/signup response */
export const SignupResponseSchema = createApiResponse(z.object({ user: UserSchema }));
export type SignupResponse = z.infer<typeof SignupResponseSchema>;

/** POST /auth/login request body */
export const LoginBodySchema = z.object({
  faceImage: z.string().min(1, 'face image required (base64)'),
});
export type LoginBody = z.infer<typeof LoginBodySchema>;

/** Top match schema (reused in success and error) */
const TopMatchSchema = z.object({
  email: z.string(),
  name: z.string().nullable(),
  distance: z.number(),
  profileImagePath: z.string().nullable(),
});

/** Login success data */
const LoginSuccessSchema = z.object({
  ok: z.literal(true),
  user: UserSchema,
  match: z.object({
    distance: z.number(),
    threshold: z.number(),
  }),
  topMatches: z.array(TopMatchSchema),
});

/** Login error data (custom error with face match details) */
const LoginErrorSchema = z.object({
  ok: z.literal(false),
  error: z.string(),
  distance: z.number().optional(),
  threshold: z.number().optional(),
  topMatches: z.array(TopMatchSchema).optional(),
});

/** POST /auth/login response - discriminated union */
export const LoginResponseSchema = z.discriminatedUnion('ok', [
  LoginSuccessSchema,
  LoginErrorSchema,
]);
export type LoginResponse = z.infer<typeof LoginResponseSchema>;

/** Helper type for login success */
export type LoginSuccess = ApiSuccess<LoginResponse>;

/** Helper type for login error */
export type LoginError = ApiError<LoginResponse>;

/** User schema for list users */
export const ListUserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string().nullable(),
  profileImagePath: z.string().nullable(),
  faceRegisteredAt: z.string().nullable(), // ISO timestamp
  createdAt: z.string().nullable(), // ISO timestamp
  updatedAt: z.string().nullable(), // ISO timestamp
});
export type ListUser = z.infer<typeof ListUserSchema>;

/** GET /users response */
export const ListUsersResponseSchema = createApiResponse(
  z.object({
    users: z.array(ListUserSchema),
    count: z.number(),
  }),
);
export type ListUsersResponse = z.infer<typeof ListUsersResponseSchema>;
