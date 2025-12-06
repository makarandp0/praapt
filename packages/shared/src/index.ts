import { z } from 'zod';

// Common primitives
export const ImageName = z.string().trim().min(1, 'name required');
export type ImageName = z.infer<typeof ImageName>;

// Save image
export const SaveImageBodySchema = z.object({
  name: ImageName,
  image: z.string().min(1, 'image required'), // base64 or data URL
});
export type SaveImageBody = z.infer<typeof SaveImageBodySchema>;

export const SaveImageResponseSchema = z.object({
  ok: z.literal(true),
  name: z.string(),
  file: z.string(),
});
export type SaveImageResponse = z.infer<typeof SaveImageResponseSchema>;

// List images
export const ListImagesResponseSchema = z.object({
  ok: z.literal(true),
  images: z.array(z.string()),
  files: z.array(z.string()),
});
export type ListImagesResponse = z.infer<typeof ListImagesResponseSchema>;

// Compare images
export const CompareImagesBodySchema = z.object({
  a: ImageName,
  b: ImageName,
});
export type CompareImagesBody = z.infer<typeof CompareImagesBodySchema>;

export const CompareImagesResponseSchema = z.object({
  ok: z.literal(true),
  same: z.boolean(),
  algo: z.literal('face-arcface'),
  a: z.string(),
  b: z.string(),
  distance: z.number(),
  threshold: z.number(),
  timing_ms: z.number().optional(),
  model: z.string().optional(),
});
export type CompareImagesResponse = z.infer<typeof CompareImagesResponseSchema>;

// Health check
export const FaceHealthSchema = z.object({
  ok: z.boolean(),
  modelsLoaded: z.boolean().optional(),
  model: z.string().nullable().optional(),
  commit: z.string().optional(),
});
export type FaceHealth = z.infer<typeof FaceHealthSchema>;

export const HealthResponseSchema = z.object({
  ok: z.literal(true),
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
});
export type HealthResponse = z.infer<typeof HealthResponseSchema>;

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
export const SignupResponseSchema = z.object({
  ok: z.literal(true),
  user: UserSchema,
});
export type SignupResponse = z.infer<typeof SignupResponseSchema>;

/** POST /auth/login request body */
export const LoginBodySchema = z.object({
  faceImage: z.string().min(1, 'face image required (base64)'),
});
export type LoginBody = z.infer<typeof LoginBodySchema>;

/** POST /auth/login response */
export const LoginResponseSchema = z.object({
  ok: z.literal(true),
  user: UserSchema,
  match: z.object({
    distance: z.number(),
    threshold: z.number(),
  }),
  topMatches: z.array(
    z.object({
      email: z.string(),
      name: z.string().nullable(),
      distance: z.number(),
      profileImagePath: z.string().nullable(),
    }),
  ),
});
export type LoginResponse = z.infer<typeof LoginResponseSchema>;

/** Login failure response (401) */
export const LoginFailureResponseSchema = z.object({
  error: z.string(),
  distance: z.number().optional(),
  threshold: z.number().optional(),
  topMatches: z
    .array(
      z.object({
        email: z.string(),
        name: z.string().nullable(),
        distance: z.number(),
        profileImagePath: z.string().nullable(),
      }),
    )
    .optional(),
});
export type LoginFailureResponse = z.infer<typeof LoginFailureResponseSchema>;

/** GET /auth/users response */
export const ListUsersResponseSchema = z.object({
  ok: z.literal(true),
  users: z.array(
    UserSchema.extend({
      hasFace: z.boolean(),
      faceRegisteredAt: z.string().nullable(), // ISO timestamp
    }),
  ),
});
export type ListUsersResponse = z.infer<typeof ListUsersResponseSchema>;
