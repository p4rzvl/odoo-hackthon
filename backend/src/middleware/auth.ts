import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-development-change-in-production';

interface DecodedToken {
  id: number;
  email: string;
  name: string;
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

  if (!token) {
    res.status(401).json({
      success: false,
      error: 'Access token is missing or invalid. Please login.'
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name
    };
    next();
  } catch (error) {
    res.status(403).json({
      success: false,
      error: 'Token has expired or is invalid. Access denied.'
    });
  }
};
