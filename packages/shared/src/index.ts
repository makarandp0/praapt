// ─────────────────────────────────────────────────────────────────────────────
// Contract Types (for typed API definitions)
// ─────────────────────────────────────────────────────────────────────────────

export {
  type HttpMethod,
  type PathParamsObject,
  type ApiContract,
  type AnyApiContract,
  defineContract,
  type InferBody,
  type InferQuery,
  type InferResponse,
  type InferParams,
  type InferPath,
  Contracts,
  buildUrl,
  buildQueryString,
} from './contracts/index.js';

// ─────────────────────────────────────────────────────────────────────────────
// Schemas (re-exported from schemas.ts to avoid circular dependencies)
// ─────────────────────────────────────────────────────────────────────────────

export {
  // API Response Helpers
  DefaultErrorSchema,
  type DefaultError,
  createApiResponse,
  type ApiSuccess,
  type ApiError,

  // Common primitives
  ImageName,

  // Save image
  SaveImageBodySchema,
  type SaveImageBody,
  SaveImageResponseSchema,
  type SaveImageResponse,

  // List images
  ListImagesResponseSchema,
  type ListImagesResponse,

  // Compare images
  CompareImagesBodySchema,
  type CompareImagesBody,
  CompareImagesResponseSchema,
  type CompareImagesResponse,

  // Health check
  FaceHealthSchema,
  type FaceHealth,
  HealthResponseSchema,
  type HealthResponse,
  type HealthSuccess,
  type HealthConfig,

  // Load model
  LoadModelBodySchema,
  type LoadModelBody,
  LoadModelResponseSchema,
  type LoadModelResponse,

  // Error response
  ErrorResponseSchema,
  type ErrorResponse,

  // Auth schemas
  UserSchema,
  type User,
  SignupBodySchema,
  type SignupBody,
  SignupResponseSchema,
  type SignupResponse,
  LoginBodySchema,
  type LoginBody,
  LoginResponseSchema,
  type LoginResponse,
  type LoginSuccess,
  type LoginError,

  // Users
  ListUserSchema,
  type ListUser,
  ListUsersResponseSchema,
  type ListUsersResponse,
} from './schemas.js';
