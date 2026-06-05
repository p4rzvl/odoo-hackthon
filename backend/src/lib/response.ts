import { Response } from 'express';

export interface StandardResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  fields?: Record<string, string[]>;
}

/**
 * Send a standardized success JSON response
 */
export const sendSuccess = <T>(
  res: Response,
  data: T,
  statusCode = 200
): void => {
  res.status(statusCode).json({
    success: true,
    data
  });
};

/**
 * Send a standardized error JSON response
 */
export const sendError = (
  res: Response,
  message: string,
  statusCode = 400,
  fields?: Record<string, string[]>
): void => {
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(fields && { fields })
  });
};
