import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { sendSuccess, sendError } from '../lib/response';
import { AuthenticatedRequest } from '../types';

export const listUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        approvalLevel: true,
        createdAt: true
      },
      orderBy: { id: 'asc' }
    });
    return sendSuccess(res, { users });
  } catch (error: any) {
    console.error('List users failed:', error);
    return sendError(res, 'An error occurred while fetching users.', 500);
  }
};

export const activateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) return sendError(res, 'Invalid user ID', 400);

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return sendError(res, 'User not found', 404);

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true }
    });
    return sendSuccess(res, { user: updated }, 200);
  } catch (error: any) {
    console.error('Activate user failed:', error);
    return sendError(res, 'An error occurred.', 500);
  }
};

export const setApprovalLevel = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) return sendError(res, 'Invalid user ID', 400);

    const { approvalLevel } = req.body;
    if (approvalLevel !== null && approvalLevel !== 1 && approvalLevel !== 2) {
      return sendError(res, 'approvalLevel must be null, 1 (L1), or 2 (L2)', 400);
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return sendError(res, 'User not found', 404);
    if (user.role !== 'MANAGER') return sendError(res, 'Only MANAGER users can have an approval level', 400);

    const updated = await prisma.user.update({
      where: { id },
      data: { approvalLevel },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, approvalLevel: true }
    });
    return sendSuccess(res, { user: updated }, 200);
  } catch (error: any) {
    console.error('Set approval level failed:', error);
    return sendError(res, 'An error occurred.', 500);
  }
};
