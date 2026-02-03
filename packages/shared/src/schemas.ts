import { z, ZodObject, ZodRawShape } from 'zod';

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

// Firebase client config (for frontend initialization)
export const FirebaseClientConfigSchema = z.object({
  apiKey: z.string(),
  authDomain: z.string(),
  projectId: z.string(),
  appId: z.string(),
});
export type FirebaseClientConfig = z.infer<typeof FirebaseClientConfigSchema>;

// Auth config in health response
export const AuthConfigSchema = z.object({
  enabled: z.boolean(),
  firebase: FirebaseClientConfigSchema.optional(),
});
export type AuthConfig = z.infer<typeof AuthConfigSchema>;

export const HealthResponseSchema = createApiResponse(
  z.object({
    service: z.string(),
    env: z.string(),
    commit: z.string().optional(),
    face: FaceHealthSchema,
    auth: AuthConfigSchema.optional(),
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
// Auth schemas (Face Registration)
// ─────────────────────────────────────────────────────────────────────────────

/** Face registration object returned from auth endpoints */
export const FaceRegistrationSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string().nullable(),
  profileImagePath: z.string().nullable(),
});
export type FaceRegistration = z.infer<typeof FaceRegistrationSchema>;

/** POST /auth/signup request body */
export const SignupBodySchema = z.object({
  email: z.string().email('valid email required'),
  name: z.string().min(1, 'name required'),
  faceImage: z.string().min(1, 'face image required (base64)'),
});
export type SignupBody = z.infer<typeof SignupBodySchema>;

/** POST /auth/signup response */
export const SignupResponseSchema = createApiResponse(z.object({ user: FaceRegistrationSchema }));
export type SignupResponse = z.infer<typeof SignupResponseSchema>;

/** POST /demo/face-match request body */
export const FaceMatchBodySchema = z.object({
  faceImage: z.string().min(1, 'face image required (base64)'),
});
export type FaceMatchBody = z.infer<typeof FaceMatchBodySchema>;

/** Top match schema (reused in success and error) */
const TopMatchSchema = z.object({
  email: z.string(),
  name: z.string().nullable(),
  distance: z.number(),
  profileImagePath: z.string().nullable(),
});

/** Face match success data */
const FaceMatchSuccessSchema = z.object({
  ok: z.literal(true),
  matchedRegistration: FaceRegistrationSchema,
  match: z.object({
    distance: z.number(),
    threshold: z.number(),
  }),
  topMatches: z.array(TopMatchSchema),
});

/** Face match error data (custom error with face match details) */
const FaceMatchErrorSchema = z.object({
  ok: z.literal(false),
  error: z.string(),
  distance: z.number().optional(),
  threshold: z.number().optional(),
  topMatches: z.array(TopMatchSchema).optional(),
});

/** POST /demo/face-match response - discriminated union */
export const FaceMatchResponseSchema = z.discriminatedUnion('ok', [
  FaceMatchSuccessSchema,
  FaceMatchErrorSchema,
]);
export type FaceMatchResponse = z.infer<typeof FaceMatchResponseSchema>;

/** Helper type for face match success */
export type FaceMatchSuccess = ApiSuccess<FaceMatchResponse>;

/** Helper type for face match error */
export type FaceMatchError = ApiError<FaceMatchResponse>;

/** Face registration schema for list endpoint */
export const ListFaceRegistrationSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string().nullable(),
  profileImagePath: z.string().nullable(),
  faceRegisteredAt: z.string().nullable(), // ISO timestamp
  createdAt: z.string().nullable(), // ISO timestamp
  updatedAt: z.string().nullable(), // ISO timestamp
});
export type ListFaceRegistration = z.infer<typeof ListFaceRegistrationSchema>;

/** GET /face-registrations response */
export const ListFaceRegistrationsResponseSchema = createApiResponse(
  z.object({
    registrations: z.array(ListFaceRegistrationSchema),
    count: z.number(),
  }),
);
export type ListFaceRegistrationsResponse = z.infer<typeof ListFaceRegistrationsResponseSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// User schemas (Firebase Auth)
// ─────────────────────────────────────────────────────────────────────────────

/** User role enum values */
export const UserRoleSchema = z.enum(['developer', 'admin', 'volunteer', 'vendor', 'unknown']);
export type UserRole = z.infer<typeof UserRoleSchema>;

/** User object returned from auth endpoints */
export const UserSchema = z.object({
  id: z.string().uuid(),
  firebaseUid: z.string(),
  email: z.string().email(),
  name: z.string().nullable(),
  provider: z.string().nullable(),
  photoUrl: z.string().nullable(),
  role: UserRoleSchema.nullable(),
  createdAt: z.string().nullable(), // ISO timestamp
  updatedAt: z.string().nullable(), // ISO timestamp
});
export type User = z.infer<typeof UserSchema>;

/** GET /me response */
export const GetMeResponseSchema = createApiResponse(z.object({ user: UserSchema }));
export type GetMeResponse = z.infer<typeof GetMeResponseSchema>;
