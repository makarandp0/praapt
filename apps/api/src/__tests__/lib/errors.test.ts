import { describe, it, expect } from 'vitest';

import {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  InternalError,
  ServiceUnavailableError,
} from '../../lib/errors.js';

describe('Custom Error Classes', () => {
  describe('ValidationError', () => {
    it('should have correct status code and defaults', () => {
      const error = new ValidationError();
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.message).toBe('Invalid request');
      expect(error.isOperational).toBe(true);
    });

    it('should accept custom message', () => {
      const error = new ValidationError('Email is required');
      expect(error.message).toBe('Email is required');
    });

    it('should serialize to JSON correctly', () => {
      const error = new ValidationError('Invalid email format');
      expect(error.toJSON()).toEqual({
        error: 'Invalid email format',
        code: 'VALIDATION_ERROR',
      });
    });

    it('should be an instance of AppError and Error', () => {
      const error = new ValidationError();
      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('UnauthorizedError', () => {
    it('should have correct status code and defaults', () => {
      const error = new UnauthorizedError();
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('UNAUTHORIZED');
      expect(error.message).toBe('Unauthorized');
    });

    it('should accept custom message', () => {
      const error = new UnauthorizedError('Face not recognized');
      expect(error.message).toBe('Face not recognized');
    });
  });

  describe('ForbiddenError', () => {
    it('should have correct status code and defaults', () => {
      const error = new ForbiddenError();
      expect(error.statusCode).toBe(403);
      expect(error.code).toBe('FORBIDDEN');
      expect(error.message).toBe('Forbidden');
    });
  });

  describe('NotFoundError', () => {
    it('should have correct status code and defaults', () => {
      const error = new NotFoundError();
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('NOT_FOUND');
      expect(error.message).toBe('Not found');
    });

    it('should accept custom message', () => {
      const error = new NotFoundError('Image not found: test.jpg');
      expect(error.message).toBe('Image not found: test.jpg');
    });
  });

  describe('ConflictError', () => {
    it('should have correct status code and defaults', () => {
      const error = new ConflictError();
      expect(error.statusCode).toBe(409);
      expect(error.code).toBe('CONFLICT');
      expect(error.message).toBe('Conflict');
    });

    it('should accept custom message', () => {
      const error = new ConflictError('Email already registered');
      expect(error.message).toBe('Email already registered');
    });
  });

  describe('InternalError', () => {
    it('should have correct status code and defaults', () => {
      const error = new InternalError();
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('INTERNAL_ERROR');
      expect(error.message).toBe('Internal server error');
    });
  });

  describe('ServiceUnavailableError', () => {
    it('should have correct status code and defaults', () => {
      const error = new ServiceUnavailableError();
      expect(error.statusCode).toBe(503);
      expect(error.code).toBe('SERVICE_UNAVAILABLE');
      expect(error.message).toBe('Service unavailable');
    });

    it('should accept custom message', () => {
      const error = new ServiceUnavailableError('Face service unavailable');
      expect(error.message).toBe('Face service unavailable');
    });
  });
});
