import prisma from '../lib/prisma';
import { LogActionType } from '@prisma/client';

export const listActivityLogs = async (filters: {
  allowedActionTypes?: LogActionType[];
  actorId?: number;
  actionType?: string;
  page: number;
  limit: number;
}) => {
  const { allowedActionTypes, actorId, actionType, page, limit } = filters;
  const where: any = {};

  if (allowedActionTypes && allowedActionTypes.length > 0) {
    where.actionType = { in: allowedActionTypes };
  }

  if (actorId) {
    where.actorId = actorId;
  }

  if (actionType && (!allowedActionTypes || allowedActionTypes.includes(actionType as LogActionType))) {
    where.actionType = actionType as LogActionType;
  }

  const [items, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      include: {
        actor: {
          select: { id: true, firstName: true, lastName: true, email: true, role: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.activityLog.count({ where })
  ]);

  return { items, total };
};

export const getActivityLogById = async (id: number) => {
  return prisma.activityLog.findUnique({
    where: { id },
    include: {
      actor: {
        select: { id: true, firstName: true, lastName: true, email: true, role: true }
      }
    }
  });
};
