import prisma from '../lib/prisma';
import { VendorStatus } from '@prisma/client';
import { CreateVendorInput, UpdateVendorInput } from '../validations/vendor.validation';

export const getVendors = async (filters: {
  search?: string;
  category?: string;
  status?: string;
  page: number;
  limit: number;
}) => {
  const { search, category, status, page, limit } = filters;
  const skip = (page - 1) * limit;

  // Build prisma query condition
  const where: any = {};

  if (search) {
    where.OR = [
      { companyName: { contains: search, mode: 'insensitive' } },
      { gstNumber: { contains: search, mode: 'insensitive' } }
    ];
  }

  if (category) {
    where.category = category;
  }

  if (status) {
    where.status = status as VendorStatus;
  }

  const [items, total] = await Promise.all([
    prisma.vendor.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            phone: true,
            country: true,
            isActive: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.vendor.count({ where })
  ]);

  return { items, total };
};

export const getVendorById = async (id: number) => {
  return prisma.vendor.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          phone: true,
          country: true,
          isActive: true
        }
      }
    }
  });
};

export const getVendorByUserId = async (userId: number) => {
  return prisma.vendor.findUnique({
    where: { userId },
    include: { user: true }
  });
};

export const createVendor = async (data: CreateVendorInput) => {
  return prisma.vendor.create({
    data: {
      userId: data.userId,
      companyName: data.companyName,
      gstNumber: data.gstNumber,
      category: data.category,
      contactNumber: data.contactNumber,
      address: data.address,
      status: 'ACTIVE' // default active on creation by officer
    },
    include: { user: true }
  });
};

export const updateVendor = async (id: number, data: UpdateVendorInput) => {
  return prisma.vendor.update({
    where: { id },
    data: {
      companyName: data.companyName,
      gstNumber: data.gstNumber,
      category: data.category,
      contactNumber: data.contactNumber,
      address: data.address,
      status: data.status as VendorStatus
    },
    include: { user: true }
  });
};
