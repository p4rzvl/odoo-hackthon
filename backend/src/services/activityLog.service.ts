import * as activityLogRepository from '../repositories/activityLog.repository';
import { LogActionType } from '@prisma/client';
import { Role } from '@prisma/client';

const roleAllowedTypes: Record<Role, LogActionType[]> = {
  ADMIN:    Object.values(LogActionType),
  MANAGER:  [LogActionType.APPROVAL, LogActionType.PO, LogActionType.RFQ, LogActionType.QUOTATION, LogActionType.INVOICE],
  OFFICER:  [LogActionType.RFQ, LogActionType.QUOTATION, LogActionType.PO, LogActionType.INVOICE, LogActionType.VENDOR],
  VENDOR:   [LogActionType.RFQ, LogActionType.PO, LogActionType.INVOICE, LogActionType.QUOTATION, LogActionType.SYSTEM]
};

export const listActivityLogs = async (filters: {
  role: Role;
  userId: number;
  actionTypes?: string;
  page: number;
  limit: number;
}) => {
  const allowed = roleAllowedTypes[filters.role];

  return activityLogRepository.listActivityLogs({
    allowedActionTypes: allowed,
    actorId: filters.role !== 'ADMIN' ? filters.userId : undefined,
    actionTypes: filters.actionTypes,
    page: filters.page,
    limit: filters.limit
  });
};

export const getActivityLogDetail = async (id: number) => {
  const log = await activityLogRepository.getActivityLogById(id);
  if (!log) throw new Error('Activity log record not found');
  return log;
};
