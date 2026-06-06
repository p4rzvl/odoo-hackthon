import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../types';
import { sendError } from '../lib/response';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-development-change-in-production';

interface DecodedToken {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  let token = req.cookies?.accessToken;

  if (!token) {
    const authHeader = req.headers['authorization'];
    token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"
  }

  if (!token) {
    return sendError(res, 'Access token is missing or invalid. Please login.', 401);
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    req.user = {
      id: decoded.id,
      email: decoded.email,
      firstName: decoded.firstName,
      lastName: decoded.lastName,
      role: decoded.role
    };
    next();
  } catch (error) {
    const isProduction = process.env.NODE_ENV === 'production';
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict' as const,
      path: '/',
    });
    return sendError(res, 'Token has expired or is invalid. Access denied.', 403);
  }
};

