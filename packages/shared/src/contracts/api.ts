import {
  CompareImagesBodySchema,
  CompareImagesResponseSchema,
  FaceMatchBodySchema,
  FaceMatchResponseSchema,
  GetMeResponseSchema,
  HealthResponseSchema,
  KioskFaceMatchBodySchema,
  KioskFaceMatchResponseSchema,
  ListFaceRegistrationsResponseSchema,
  ListImagesResponseSchema,
  ListUsersResponseSchema,
  LoadModelBodySchema,
  LoadModelResponseSchema,
  SaveImageBodySchema,
  SaveImageResponseSchema,
  SignupBodySchema,
  SignupResponseSchema,
  RegisterCustomerBodySchema,
  RegisterCustomerResponseSchema,
  UpdateUserRoleBodySchema,
  UpdateUserRoleResponseSchema,
} from '../schemas.js';
import { defineContract } from './types.js';

// ─────────────────────────────────────────────────────────────────────────────
// Health Contracts
// ─────────────────────────────────────────────────────────────────────────────

export const getHealth = defineContract({
  method: 'GET',
  path: '/health',
  response: HealthResponseSchema,
  auth: 'public',
});

export const loadModel = defineContract({
  method: 'POST',
  path: '/load-model',
  body: LoadModelBodySchema,
  response: LoadModelResponseSchema,
  auth: ['developer'],
});

// ─────────────────────────────────────────────────────────────────────────────
// Face Registration Contracts
// ─────────────────────────────────────────────────────────────────────────────

export const signup = defineContract({
  method: 'POST',
  path: '/face-registrations',
  body: SignupBodySchema,
  response: SignupResponseSchema,
  auth: 'public',
});

export const listFaceRegistrations = defineContract({
  method: 'GET',
  path: '/face-registrations',
  response: ListFaceRegistrationsResponseSchema,
  auth: ['developer', 'admin'],
});

// ─────────────────────────────────────────────────────────────────────────────
// Customer Registration Contracts
// ─────────────────────────────────────────────────────────────────────────────

export const registerCustomer = defineContract({
  method: 'POST',
  path: '/customers',
  body: RegisterCustomerBodySchema,
  response: RegisterCustomerResponseSchema,
  auth: ['volunteer', 'admin', 'developer'],
});

// ─────────────────────────────────────────────────────────────────────────────
// Demo Contracts
// ─────────────────────────────────────────────────────────────────────────────

export const faceMatch = defineContract({
  method: 'POST',
  path: '/demo/face-match',
  body: FaceMatchBodySchema,
  response: FaceMatchResponseSchema,
  auth: ['developer', 'admin', 'volunteer', 'vendor'],
});

// ─────────────────────────────────────────────────────────────────────────────
// Kiosk Contracts
// ─────────────────────────────────────────────────────────────────────────────

export const kioskFaceMatch = defineContract({
  method: 'POST',
  path: '/kiosk/face-match',
  body: KioskFaceMatchBodySchema,
  response: KioskFaceMatchResponseSchema,
  auth: 'public',
});

// ─────────────────────────────────────────────────────────────────────────────
// Images Contracts
// ─────────────────────────────────────────────────────────────────────────────

export const saveImage = defineContract({
  method: 'POST',
  path: '/images',
  body: SaveImageBodySchema,
  response: SaveImageResponseSchema,
  auth: ['developer', 'admin', 'volunteer', 'vendor'],
});

export const listImages = defineContract({
  method: 'GET',
  path: '/images',
  response: ListImagesResponseSchema,
  auth: ['developer', 'admin', 'volunteer', 'vendor'],
});

export const compareImages = defineContract({
  method: 'POST',
  path: '/images/compare',
  body: CompareImagesBodySchema,
  response: CompareImagesResponseSchema,
  auth: ['developer', 'admin', 'volunteer', 'vendor'],
});

// ─────────────────────────────────────────────────────────────────────────────
// User Contracts (Firebase Auth)
// ─────────────────────────────────────────────────────────────────────────────

export const getMe = defineContract({
  method: 'GET',
  path: '/me',
  response: GetMeResponseSchema,
  auth: 'authenticated',
});

export const listUsers = defineContract({
  method: 'GET',
  path: '/users',
  response: ListUsersResponseSchema,
  auth: ['developer', 'admin'],
});

export const updateUserRole = defineContract({
  method: 'PATCH',
  path: '/users/:id/role',
  body: UpdateUserRoleBodySchema,
  response: UpdateUserRoleResponseSchema,
  auth: ['developer', 'admin'],
});
