import {
  CompareImagesBodySchema,
  CompareImagesResponseSchema,
  HealthResponseSchema,
  ListImagesResponseSchema,
  ListUsersResponseSchema,
  LoadModelBodySchema,
  LoadModelResponseSchema,
  LoginBodySchema,
  LoginResponseSchema,
  SaveImageBodySchema,
  SaveImageResponseSchema,
  SignupBodySchema,
  SignupResponseSchema,
} from '../schemas.js';
import { defineContract } from './types.js';

// ─────────────────────────────────────────────────────────────────────────────
// Health Contracts
// ─────────────────────────────────────────────────────────────────────────────

export const getHealth = defineContract({
  method: 'GET',
  path: '/health',
  response: HealthResponseSchema,
});

export const loadModel = defineContract({
  method: 'POST',
  path: '/load-model',
  body: LoadModelBodySchema,
  response: LoadModelResponseSchema,
});

// ─────────────────────────────────────────────────────────────────────────────
// Auth Contracts
// ─────────────────────────────────────────────────────────────────────────────

export const signup = defineContract({
  method: 'POST',
  path: '/auth/signup',
  body: SignupBodySchema,
  response: SignupResponseSchema,
});

export const login = defineContract({
  method: 'POST',
  path: '/auth/login',
  body: LoginBodySchema,
  response: LoginResponseSchema,
});

// ─────────────────────────────────────────────────────────────────────────────
// Images Contracts
// ─────────────────────────────────────────────────────────────────────────────

export const saveImage = defineContract({
  method: 'POST',
  path: '/images',
  body: SaveImageBodySchema,
  response: SaveImageResponseSchema,
});

export const listImages = defineContract({
  method: 'GET',
  path: '/images',
  response: ListImagesResponseSchema,
});

export const compareImages = defineContract({
  method: 'POST',
  path: '/images/compare',
  body: CompareImagesBodySchema,
  response: CompareImagesResponseSchema,
});

// ─────────────────────────────────────────────────────────────────────────────
// Users Contracts
// ─────────────────────────────────────────────────────────────────────────────

export const listUsers = defineContract({
  method: 'GET',
  path: '/users',
  response: ListUsersResponseSchema,
});
