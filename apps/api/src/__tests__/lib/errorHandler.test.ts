import type { Request, Response, NextFunction } from 'express';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { z } from 'zod';

import { errorHandler, asyncHandler, getErrorMessage } from '../../lib/errorHandler.js';
import { ValidationError, NotFoundError, InternalError } from '../../lib/errors.js';

// Mock the logger to avoid console output during tests
vi.mock('../../lib/logger.js', () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('errorHandler middleware', () => {
  let mockReq: Request;
  let mockRes: Response;
  let mockNext: NextFunction;
  let statusSpy: ReturnType<typeof vi.fn>;
  let jsonSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    statusSpy = vi.fn().mockReturnThis();
    jsonSpy = vi.fn();

    mockReq = {
      path: '/test',
      method: 'GET',
    } as Request;

    mockRes = {
      status: statusSpy,
      json: jsonSpy,
    } as unknown as Response;

    mockNext = vi.fn();
  });

  it('should handle ValidationError correctly', () => {
    const error = new ValidationError('Invalid email');

    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(statusSpy).toHaveBeenCalledWith(400);
    expect(jsonSpy).toHaveBeenCalledWith({
      ok: false,
      error: 'Invalid email',
      code: 'VALIDATION_ERROR',
    });
  });

  it('should handle NotFoundError correctly', () => {
    const error = new NotFoundError('User not found');

    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(statusSpy).toHaveBeenCalledWith(404);
    expect(jsonSpy).toHaveBeenCalledWith({
      ok: false,
      error: 'User not found',
      code: 'NOT_FOUND',
    });
  });

  it('should handle InternalError correctly', () => {
    const error = new InternalError('Database connection failed');

    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(statusSpy).toHaveBeenCalledWith(500);
    expect(jsonSpy).toHaveBeenCalledWith({
      ok: false,
      error: 'Database connection failed',
      code: 'INTERNAL_ERROR',
    });
  });

  it('should handle ZodError correctly', () => {
    const schema = z.object({ email: z.string().email() });

    try {
      schema.parse({ email: 'invalid' });
    } catch (error) {
      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        ok: false,
        error: expect.stringContaining('Invalid email'),
      });
    }
  });

  it('should handle unknown errors as 500', () => {
    const error = new Error('Something went wrong');

    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(statusSpy).toHaveBeenCalledWith(500);
    expect(jsonSpy).toHaveBeenCalledWith({
      ok: false,
      error: 'Internal server error',
    });
  });

  it('should handle non-Error objects', () => {
    const error = { weird: 'object' };

    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(statusSpy).toHaveBeenCalledWith(500);
    expect(jsonSpy).toHaveBeenCalledWith({
      ok: false,
      error: 'Internal server error',
    });
  });
});

describe('asyncHandler', () => {
  it('should pass successful results through', async () => {
    const mockReq = {} as Request;
    const mockRes = {
      json: vi.fn(),
    } as unknown as Response;
    const mockNext = vi.fn();

    const handler = asyncHandler(async (_req, res) => {
      res.json({ ok: true });
    });

    await handler(mockReq, mockRes, mockNext);

    expect(mockRes.json).toHaveBeenCalledWith({ ok: true });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should catch and forward errors to next', async () => {
    const mockReq = {} as Request;
    const mockRes = {} as Response;
    const mockNext = vi.fn();
    const testError = new Error('Test error');

    const handler = asyncHandler(async () => {
      throw testError;
    });

    await handler(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(testError);
  });
});

describe('getErrorMessage', () => {
  it('should extract message from Error', () => {
    expect(getErrorMessage(new Error('test message'))).toBe('test message');
  });

  it('should return "Unknown error" for non-Error values', () => {
    expect(getErrorMessage('string')).toBe('Unknown error');
    expect(getErrorMessage(123)).toBe('Unknown error');
    expect(getErrorMessage(null)).toBe('Unknown error');
    expect(getErrorMessage(undefined)).toBe('Unknown error');
    expect(getErrorMessage({ message: 'not an error' })).toBe('Unknown error');
  });
});
