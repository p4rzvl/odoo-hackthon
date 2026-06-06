import prisma from '../lib/prisma';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import * as notificationRepository from '../repositories/notification.repository';
import * as notificationService from '../services/notification.service';

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

describe('Notification Module', () => {
  describe('Repository', () => {
    test('listNotifications calls findMany and count', async () => {
      prismaMock.notification.findMany.mockResolvedValue([]);
      prismaMock.notification.count.mockResolvedValue(0);

      const result = await notificationRepository.listNotifications({
        userId: 1,
        page: 1,
        limit: 10
      });

      expect(result.notifications).toEqual([]);
      expect(result.total).toBe(0);
      expect(prismaMock.notification.findMany).toHaveBeenCalled();
    });

    test('markAllAsRead calls updateMany', async () => {
      prismaMock.notification.updateMany.mockResolvedValue({ count: 5 } as any);

      await notificationRepository.markAllAsRead(1);

      expect(prismaMock.notification.updateMany).toHaveBeenCalledWith({
        where: { userId: 1, isRead: false },
        data: { isRead: true }
      });
    });
  });

  describe('Service', () => {
    test('markAsRead throws error if notification does not exist', async () => {
      prismaMock.notification.findUnique.mockResolvedValue(null);

      await expect(notificationService.markAsRead(1, 999)).rejects.toThrow(
        'Notification not found'
      );
    });

    test('markAsRead throws error if unauthorized', async () => {
      prismaMock.notification.findUnique.mockResolvedValue({
        id: 10,
        userId: 2 // Different user ID
      } as any);

      await expect(notificationService.markAsRead(1, 10)).rejects.toThrow(
        'Unauthorized'
      );
    });

    test('markAsRead updates notification to isRead true', async () => {
      prismaMock.notification.findUnique.mockResolvedValue({
        id: 10,
        userId: 1,
        isRead: false
      } as any);

      prismaMock.notification.update.mockResolvedValue({
        id: 10,
        isRead: true
      } as any);

      const result = await notificationService.markAsRead(1, 10);
      expect(result.isRead).toBe(true);
      expect(prismaMock.notification.update).toHaveBeenCalledWith({
        where: { id: 10 },
        data: { isRead: true }
      });
    });
  });
});
