import prisma from '../lib/prisma';

export interface NotificationFilters {
  userId: number;
  type?: string;
  isRead?: boolean;
  page: number;
  limit: number;
}

export const listNotifications = async ({ userId, type, isRead, page, limit }: NotificationFilters) => {
  const where: any = { userId };
  if (type) where.type = type;
  if (isRead !== undefined) where.isRead = isRead;

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.notification.count({ where })
  ]);

  return { notifications, total };
};

export const getNotificationById = async (id: number) => {
  return prisma.notification.findUnique({ where: { id } });
};

export const markAsRead = async (id: number) => {
  return prisma.notification.update({ where: { id }, data: { isRead: true } });
};

export const markAllAsRead = async (userId: number) => {
  await prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
};

export const getUnreadCount = async (userId: number) => {
  return prisma.notification.count({ where: { userId, isRead: false } });
};

export const deleteNotification = async (id: number) => {
  return prisma.notification.delete({ where: { id } });
};
