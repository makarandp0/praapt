// ─────────────────────────────────────────────────────────────────────────────
// Contract Types (for typed API definitions)
// ─────────────────────────────────────────────────────────────────────────────

export {
  type HttpMethod,
  type PathParamsObject,
  type ContractAuth,
  type ApiContract,
  type AnyApiContract,
  defineContract,
  type InferBody,
  type InferQuery,
  type InferResponse,
  type InferParams,
  type InferPath,
  type InferAuth,
  canCallContract,
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
  FirebaseClientConfigSchema,
  type FirebaseClientConfig,
  AuthConfigSchema,
  type AuthConfig,
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

  // Face Registration schemas
  FaceRegistrationSchema,
  type FaceRegistration,
  SignupBodySchema,
  type SignupBody,
  SignupResponseSchema,
  type SignupResponse,

  // Demo: Face Match schemas
  FaceMatchBodySchema,
  type FaceMatchBody,
  FaceMatchResponseSchema,
  type FaceMatchResponse,
  type FaceMatchSuccess,
  type FaceMatchError,

  // Kiosk: Face Match schemas
  KioskFaceMatchBodySchema,
  type KioskFaceMatchBody,
  KioskFaceMatchResponseSchema,
  type KioskFaceMatchResponse,

  // Face Registrations
  ListFaceRegistrationSchema,
  type ListFaceRegistration,
  ListFaceRegistrationsResponseSchema,
  type ListFaceRegistrationsResponse,

  // User (Firebase Auth)
  UserRoleSchema,
  type UserRole,
  parseUserRole,
  UserSchema,
  type User,
  GetMeResponseSchema,
  type GetMeResponse,

  // User Management
  ListUsersResponseSchema,
  type ListUsersResponse,
  type ListUser,
  UpdateUserRoleBodySchema,
  type UpdateUserRoleBody,
  UpdateUserRoleResponseSchema,
  type UpdateUserRoleResponse,
} from './schemas.js';
