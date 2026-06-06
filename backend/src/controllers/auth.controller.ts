import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { RegisterInput, LoginInput } from '../validations/auth.validation';
import { sendSuccess, sendError } from '../lib/response';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-development-change-in-production';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'super-refresh-key-for-development';

// Helper: Generate tokens
const generateTokens = (user: { id: number; email: string; firstName: string; lastName: string; role: string }) => {
  const payload = { 
    id: user.id, 
    email: user.email, 
    firstName: user.firstName, 
    lastName: user.lastName, 
    role: user.role 
  };
  
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '30m' });
  const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' });

  return { accessToken, refreshToken };
};

// 1. REGISTER
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName, role, phone, country } = req.body as RegisterInput;

    // Check if email already in use
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return sendError(res, 'A user with this email address already exists.', 400);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Save user
    const user = await prisma.user.create({
      data: { 
        email, 
        passwordHash, 
        firstName, 
        lastName, 
        role, 
        phone, 
        country,
        isActive: true 
      }
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Save refresh token in DB
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt
      }
    });

    return sendSuccess(res, {
      user: { 
        id: user.id, 
        email: user.email, 
        firstName: user.firstName, 
        lastName: user.lastName, 
        role: user.role,
        phone: user.phone,
        country: user.country
      },
      accessToken,
      refreshToken
    }, 201);
  } catch (error: any) {
    console.error('Registration failed:', error);
    return sendError(res, 'An internal server error occurred during registration.', 500);
  }
};

// 2. LOGIN
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as LoginInput;

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      return sendError(res, 'Invalid email or password.', 401);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return sendError(res, 'Invalid email or password.', 401);
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Save refresh token in DB
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt
      }
    });

    return sendSuccess(res, {
      user: { 
        id: user.id, 
        email: user.email, 
        firstName: user.firstName, 
        lastName: user.lastName, 
        role: user.role,
        phone: user.phone,
        country: user.country
      },
      accessToken,
      refreshToken
    });
  } catch (error: any) {
    console.error('Login failed:', error);
    return sendError(res, 'An internal server error occurred during login.', 500);
  }
};

// 3. REFRESH TOKEN
export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return sendError(res, 'Refresh token is required.', 400);
    }

    // Find token in database
    const dbToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true }
    });

    if (!dbToken || dbToken.revoked || dbToken.expiresAt < new Date() || !dbToken.user.isActive) {
      return sendError(res, 'Refresh token is expired, revoked, or invalid.', 403);
    }

    // Decode token to verify signing
    let decoded: any;
    try {
      decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    } catch (err) {
      return sendError(res, 'Refresh token signature is invalid.', 403);
    }

    // Generate new tokens
    const { accessToken } = generateTokens(dbToken.user);

    return sendSuccess(res, { accessToken });
  } catch (error: any) {
    console.error('Refresh token exchange failed:', error);
    return sendError(res, 'An internal server error occurred while refreshing your session.', 500);
  }
};

// 4. LOGOUT
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Remove or revoke refresh token from DB
      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken }
      });
    }

    return sendSuccess(res, { message: 'Successfully logged out.' });
  } catch (error: any) {
    console.error('Logout failed:', error);
    return sendError(res, 'An internal server error occurred during logout.', 500);
  }
};

