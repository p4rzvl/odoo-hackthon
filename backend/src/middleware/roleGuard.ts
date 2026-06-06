import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { sendError } from '../lib/response';

/**
 * Middleware to restrict access to specific roles.
 * Must be used AFTER authenticateToken middleware.
 */
export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return sendError(res, 'Authentication required.', 401);
    }

    const hasRole = allowedRoles.map(r => r.toUpperCase()).includes(req.user.role.toUpperCase());
    
    if (!hasRole) {
      return sendError(res, 'Forbidden: You do not have permission to perform this action.', 403);
    }

    next();
  };
};
