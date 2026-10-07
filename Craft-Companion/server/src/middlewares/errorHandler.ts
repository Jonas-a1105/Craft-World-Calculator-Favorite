import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors/AppError.js';
import { env } from '../config/env.js';

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  // 1. Zod Validation Errors
  if (err instanceof ZodError) {
    const formatted = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    res.status(400).json({
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: formatted,
    });
    return;
  }

  // 2. Operational Application Errors
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      console.error(`[Error] ${req.method} ${req.originalUrl}:`, err);
    }
    res.status(err.statusCode).json({
      message: err.message,
      code: err.code,
      ...(err.details ? { details: err.details } : {}),
    });
    return;
  }

  // 3. Unhandled / Unexpected Errors
  const errorMessage = err instanceof Error ? err.message : String(err);
  console.error(`[Unhandled Error] ${req.method} ${req.originalUrl}:`, err);

  res.status(500).json({
    message: env.NODE_ENV === 'production' ? 'Internal server error' : errorMessage,
    code: 'INTERNAL_SERVER_ERROR',
  });
}
