import * as vendorRepository from '../repositories/vendor.repository';
import prisma from '../lib/prisma';
import { CreateVendorInput, UpdateVendorInput } from '../validations/vendor.validation';

export const listVendors = async (query: {
  search?: string;
  category?: string;
  status?: string;
  page?: string;
  limit?: string;
}) => {
  const page = Math.max(1, parseInt(query.page || '1', 10));
  const limit = Math.max(1, Math.min(100, parseInt(query.limit || '20', 10)));

  return vendorRepository.getVendors({
    search: query.search,
    category: query.category,
    status: query.status,
    page,
    limit
  });
};

export const getVendorDetail = async (id: number) => {
  const vendor = await vendorRepository.getVendorById(id);
  if (!vendor) {
    throw new Error('Vendor not found');
  }
  return vendor;
};

export const onboardVendor = async (data: CreateVendorInput) => {
  // Check if user exists and is a VENDOR role
  const user = await prisma.user.findUnique({ where: { id: data.userId } });
  if (!user) {
    throw new Error('Associated user account not found');
  }
  if (user.role !== 'VENDOR') {
    throw new Error('User mapped to this vendor profile must have the VENDOR role');
  }

  // Check if user already has a vendor profile
  const existingVendor = await vendorRepository.getVendorByUserId(data.userId);
  if (existingVendor) {
    throw new Error('This user account is already mapped to a vendor profile');
  }

  return vendorRepository.createVendor(data);
};

export const updateVendorProfile = async (id: number, data: UpdateVendorInput) => {
  const vendor = await vendorRepository.getVendorById(id);
  if (!vendor) {
    throw new Error('Vendor not found');
  }
  return vendorRepository.updateVendor(id, data);
};
