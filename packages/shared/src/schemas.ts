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
// Customer Registration (Kiosk)
// ─────────────────────────────────────────────────────────────────────────────

/** POST /customers request body */
export const RegisterCustomerBodySchema = z.object({
  name: z.string().min(1, 'name required'),
  pin: z.string().regex(/^\d{4}$/, 'pin must be 4 digits'),
  captures: z.array(z.string().min(1, 'capture required')).default([]),
});
export type RegisterCustomerBody = z.infer<typeof RegisterCustomerBodySchema>;

/** POST /customers response */
export const RegisterCustomerResponseSchema = createApiResponse(
  z.object({
    customerId: z.string().uuid(),
    faceCount: z.number(),
    imagePaths: z.array(z.string()),
  }),
);
export type RegisterCustomerResponse = z.infer<typeof RegisterCustomerResponseSchema>;

/** POST /kiosk/face-match request body */
export const KioskFaceMatchBodySchema = z.object({
  pin: z.string().min(1, 'pin required'),
  faceImage: z.string().min(1, 'face image required (base64)'),
});
export type KioskFaceMatchBody = z.infer<typeof KioskFaceMatchBodySchema>;

/** POST /kiosk/pin-lookup request body */
export const KioskPinLookupBodySchema = z.object({
  pin: z.string().regex(/^\d{4}$/, 'pin must be 4 digits'),
});
export type KioskPinLookupBody = z.infer<typeof KioskPinLookupBodySchema>;

/** Kiosk pin lookup customer */
const KioskPinLookupCustomerSchema = z.object({
  customerId: z.string().uuid(),
  name: z.string(),
  imagePath: z.string().nullable(),
  faceCount: z.number(),
});

/** Kiosk pin lookup success data */
const KioskPinLookupSuccessSchema = z.object({
  ok: z.literal(true),
  customers: z.array(KioskPinLookupCustomerSchema),
});

/** Kiosk pin lookup error data */
const KioskPinLookupErrorSchema = z.object({
  ok: z.literal(false),
  error: z.string(),
  reason: z.enum(['no_customers', 'no_faces']).optional(),
});

/** POST /kiosk/pin-lookup response - discriminated union */
export const KioskPinLookupResponseSchema = z.discriminatedUnion('ok', [
  KioskPinLookupSuccessSchema,
  KioskPinLookupErrorSchema,
]);
export type KioskPinLookupResponse = z.infer<typeof KioskPinLookupResponseSchema>;

/** Kiosk customer match entry */
const KioskCustomerMatchSchema = z.object({
  customerId: z.string().uuid(),
  name: z.string(),
  imagePath: z.string().nullable(),
  distance: z.number(),
});

/** Kiosk face match success data */
const KioskFaceMatchSuccessSchema = z.object({
  ok: z.literal(true),
  threshold: z.number(),
  matches: z.array(KioskCustomerMatchSchema),
});

/** Kiosk face match error data */
const KioskFaceMatchErrorSchema = z.object({
  ok: z.literal(false),
  error: z.string(),
  reason: z.enum(['no_customers', 'no_faces', 'no_match']).optional(),
  threshold: z.number().optional(),
  candidates: z.array(KioskCustomerMatchSchema).optional(),
});

/** POST /kiosk/face-match response - discriminated union */
export const KioskFaceMatchResponseSchema = z.discriminatedUnion('ok', [
  KioskFaceMatchSuccessSchema,
  KioskFaceMatchErrorSchema,
]);
export type KioskFaceMatchResponse = z.infer<typeof KioskFaceMatchResponseSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// User schemas (Firebase Auth)
// ─────────────────────────────────────────────────────────────────────────────

/** User role enum values */
export const UserRoleSchema = z.enum(['developer', 'admin', 'volunteer', 'vendor', 'unknown']);
export type UserRole = z.infer<typeof UserRoleSchema>;

/**
 * Safely parse a role value and return a valid UserRole or null.
 * Use this instead of type assertions to ensure runtime safety.
 */
export function parseUserRole(role: unknown): UserRole | null {
  const result = UserRoleSchema.safeParse(role);
  return result.success ? result.data : null;
}

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

// ─────────────────────────────────────────────────────────────────────────────
// User Management schemas
// ─────────────────────────────────────────────────────────────────────────────

/** GET /users response - list all users */
export const ListUsersResponseSchema = createApiResponse(
  z.object({
    users: z.array(UserSchema),
    count: z.number(),
  }),
);
export type ListUsersResponse = z.infer<typeof ListUsersResponseSchema>;

/** Convenience type for a single user from the list */
export type ListUser = User;

/** PATCH /users/:id/role request body */
export const UpdateUserRoleBodySchema = z.object({
  role: UserRoleSchema,
});
export type UpdateUserRoleBody = z.infer<typeof UpdateUserRoleBodySchema>;

/** PATCH /users/:id/role response */
export const UpdateUserRoleResponseSchema = createApiResponse(
  z.object({ user: UserSchema }),
);
export type UpdateUserRoleResponse = z.infer<typeof UpdateUserRoleResponseSchema>;
