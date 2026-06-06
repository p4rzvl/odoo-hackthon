import prisma from '../lib/prisma';
import { LogActionType } from '@prisma/client';

export const listActivityLogs = async (filters: {
  allowedActionTypes?: LogActionType[];
  actorId?: number;
  actionTypes?: string;
  page: number;
  limit: number;
}) => {
  const { allowedActionTypes, actorId, actionTypes, page, limit } = filters;
  const where: any = {};

  if (allowedActionTypes && allowedActionTypes.length > 0) {
    where.actionType = { in: allowedActionTypes };
  }

  if (actorId) {
    where.actorId = actorId;
  }

  if (actionTypes) {
    const types = actionTypes.split(',').map(t => t.trim()).filter(t => t) as LogActionType[];
    const valid = allowedActionTypes
      ? types.filter(t => allowedActionTypes.includes(t))
      : types;
    if (valid.length > 0 && (!allowedActionTypes || valid.some(t => allowedActionTypes.includes(t)))) {
      where.actionType = { in: valid };
    }
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
