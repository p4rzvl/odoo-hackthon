import * as notificationRepository from '../repositories/notification.repository';
import prisma from '../lib/prisma';

export const listNotifications = async (userId: number, filters: { type?: string; isRead?: boolean; page: number; limit: number }) => {
  return notificationRepository.listNotifications({ userId, ...filters });
};

export const getUnreadCount = async (userId: number) => {
  return notificationRepository.getUnreadCount(userId);
};

export const markAsRead = async (userId: number, notificationId: number) => {
  const notification = await notificationRepository.getNotificationById(notificationId);
  if (!notification) throw new Error('Notification not found');
  if (notification.userId !== userId) throw new Error('Unauthorized');

  return notificationRepository.markAsRead(notificationId);
};

export const markAllAsRead = async (userId: number) => {
  await notificationRepository.markAllAsRead(userId);
};
