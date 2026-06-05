import { Request, Response, NextFunction } from 'express';
import { sendError } from '../lib/response';

/**
 * Global Express Error Handler Middleware
 */
export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('❌ Unhandled Server Error:', err);

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'An unexpected server error occurred.';

  // Under production, do not leak internal stack details
  const displayMessage = process.env.NODE_ENV === 'production' && statusCode === 500
    ? 'An unexpected server error occurred. Please contact system support.'
    : message;

  sendError(res, displayMessage, statusCode);
};
