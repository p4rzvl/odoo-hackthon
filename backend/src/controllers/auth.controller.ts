import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { RegisterInput, LoginInput } from '../validations/auth.validation';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-development-change-in-production';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'super-refresh-key-for-development';

// Helper: Generate tokens
const generateTokens = (user: { id: number; email: string; name: string }) => {
  const payload = { id: user.id, email: user.email, name: user.name };
  
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '30m' });
  const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' });

  return { accessToken, refreshToken };
};

// 1. REGISTER
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body as RegisterInput;

    // Check if email already in use
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({
        success: false,
        error: 'A user with this email address already exists.'
      });
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Save user
    const user = await prisma.user.create({
      data: { email, passwordHash, name }
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

    res.status(201).json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name },
      accessToken,
      refreshToken
    });
  } catch (error: any) {
    console.error('Registration failed:', error);
    res.status(500).json({
      success: false,
      error: 'An internal server error occurred during registration.'
    });
  }
};

// 2. LOGIN
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as LoginInput;

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password.'
      });
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password.'
      });
      return;
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

    res.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name },
      accessToken,
      refreshToken
    });
  } catch (error: any) {
    console.error('Login failed:', error);
    res.status(500).json({
      success: false,
      error: 'An internal server error occurred during login.'
    });
  }
};

// 3. REFRESH TOKEN
export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        error: 'Refresh token is required.'
      });
      return;
    }

    // Find token in database
    const dbToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true }
    });

    if (!dbToken || dbToken.revoked || dbToken.expiresAt < new Date()) {
      res.status(403).json({
        success: false,
        error: 'Refresh token is expired, revoked, or invalid.'
      });
      return;
    }

    // Decode token to verify signing
    let decoded: any;
    try {
      decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    } catch (err) {
      res.status(403).json({
        success: false,
        error: 'Refresh token signature is invalid.'
      });
      return;
    }

    // Generate new tokens
    const { accessToken } = generateTokens(dbToken.user);

    res.json({
      success: true,
      accessToken
    });
  } catch (error: any) {
    console.error('Refresh token exchange failed:', error);
    res.status(500).json({
      success: false,
      error: 'An internal server error occurred while refreshing your session.'
    });
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

    res.json({
      success: true,
      message: 'Successfully logged out.'
    });
  } catch (error: any) {
    console.error('Logout failed:', error);
    res.status(500).json({
      success: false,
      error: 'An internal server error occurred during logout.'
    });
  }
};
