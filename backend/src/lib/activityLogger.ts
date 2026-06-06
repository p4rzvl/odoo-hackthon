import prisma from './prisma';
import { LogActionType } from '@prisma/client';

export interface LogActivityInput {
  actorId?: number;
  actionType: LogActionType;
  description: string;
  entityId?: number;
  entityType?: string;
}

export const logActivity = async (data: LogActivityInput) => {
  try {
    return await prisma.activityLog.create({
      data: {
        actorId: data.actorId,
        actionType: data.actionType,
        description: data.description,
        entityId: data.entityId,
        entityType: data.entityType
      }
    });
  } catch (error) {
    console.error('Failed to create activity log record:', error);
  }
};
