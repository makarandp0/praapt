import {
  CompareImagesBodySchema,
  CompareImagesResponseSchema,
  FaceMatchBodySchema,
  FaceMatchResponseSchema,
  HealthResponseSchema,
  ListFaceRegistrationsResponseSchema,
  ListImagesResponseSchema,
  LoadModelBodySchema,
  LoadModelResponseSchema,
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
// Face Registration Contracts
// ─────────────────────────────────────────────────────────────────────────────

export const signup = defineContract({
  method: 'POST',
  path: '/face-registrations',
  body: SignupBodySchema,
  response: SignupResponseSchema,
});

// ─────────────────────────────────────────────────────────────────────────────
// Demo Contracts
// ─────────────────────────────────────────────────────────────────────────────

export const faceMatch = defineContract({
  method: 'POST',
  path: '/demo/face-match',
  body: FaceMatchBodySchema,
  response: FaceMatchResponseSchema,
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
// Face Registrations Contracts
// ─────────────────────────────────────────────────────────────────────────────

export const listFaceRegistrations = defineContract({
  method: 'GET',
  path: '/face-registrations',
  response: ListFaceRegistrationsResponseSchema,
});
