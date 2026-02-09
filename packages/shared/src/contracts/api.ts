import {
  GetMeResponseSchema,
  HealthResponseSchema,
  KioskFaceMatchBodySchema,
  KioskFaceMatchResponseSchema,
  KioskPinLookupBodySchema,
  KioskPinLookupResponseSchema,
  ListUsersResponseSchema,
  LoadModelBodySchema,
  LoadModelResponseSchema,
  RegisterCustomerBodySchema,
  RegisterCustomerResponseSchema,
  ListCustomersResponseSchema,
  UpdateCustomerBodySchema,
  UpdateCustomerResponseSchema,
  DeleteCustomerResponseSchema,
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
  auth: 'authenticated',
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

export const listCustomers = defineContract({
  method: 'GET',
  path: '/customers',
  response: ListCustomersResponseSchema,
  auth: ['volunteer', 'admin', 'developer'],
});

export const updateCustomer = defineContract({
  method: 'PATCH',
  path: '/customers/:id',
  body: UpdateCustomerBodySchema,
  response: UpdateCustomerResponseSchema,
  auth: ['volunteer', 'admin', 'developer'],
});

export const deleteCustomer = defineContract({
  method: 'DELETE',
  path: '/customers/:id',
  response: DeleteCustomerResponseSchema,
  auth: ['volunteer', 'admin', 'developer'],
});

// ─────────────────────────────────────────────────────────────────────────────
// Kiosk Contracts
// ─────────────────────────────────────────────────────────────────────────────

export const kioskFaceMatch = defineContract({
  method: 'POST',
  path: '/kiosk/face-match',
  body: KioskFaceMatchBodySchema,
  response: KioskFaceMatchResponseSchema,
  auth: 'authenticated',
});

export const kioskPinLookup = defineContract({
  method: 'POST',
  path: '/kiosk/pin-lookup',
  body: KioskPinLookupBodySchema,
  response: KioskPinLookupResponseSchema,
  auth: 'authenticated',
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
