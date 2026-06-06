import prisma from '../lib/prisma';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import * as activityLogRepository from '../repositories/activityLog.repository';
import * as activityLogService from '../services/activityLog.service';

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

describe('Activity Log Module', () => {
  describe('Repository', () => {
    test('listActivityLogs filters correctly by allowed types', async () => {
      prismaMock.activityLog.findMany.mockResolvedValue([]);
      prismaMock.activityLog.count.mockResolvedValue(0);

      const result = await activityLogRepository.listActivityLogs({
        allowedActionTypes: ['APPROVAL', 'PO'],
        page: 1,
        limit: 10
      });

      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
      expect(prismaMock.activityLog.findMany).toHaveBeenCalledWith({
        where: { actionType: { in: ['APPROVAL', 'PO'] } },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10
      });
    });
  });

  describe('Service', () => {
    test('listActivityLogs limits log visibility based on user role', async () => {
      prismaMock.activityLog.findMany.mockResolvedValue([]);
      prismaMock.activityLog.count.mockResolvedValue(0);

      const result = await activityLogService.listActivityLogs({
        role: 'MANAGER',
        userId: 5,
        page: 1,
        limit: 10
      });

      expect(result.items).toEqual([]);
      expect(prismaMock.activityLog.findMany).toHaveBeenCalledWith({
        where: {
          actionType: { in: ['APPROVAL', 'PO', 'RFQ', 'QUOTATION', 'INVOICE'] },
          actorId: 5
        },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10
      });
    });

    test('getActivityLogDetail throws error if log not found', async () => {
      prismaMock.activityLog.findUnique.mockResolvedValue(null);

      await expect(activityLogService.getActivityLogDetail(999)).rejects.toThrow(
        'Activity log record not found'
      );
    });
  });
});
