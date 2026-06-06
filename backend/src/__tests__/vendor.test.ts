import prisma from '../lib/prisma';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import * as vendorRepository from '../repositories/vendor.repository';
import * as vendorService from '../services/vendor.service';

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

describe('Vendor Module', () => {
  describe('Repository', () => {
    test('getVendors returns items and total count', async () => {
      const mockItems = [
        { id: 1, companyName: 'Vendor A', status: 'ACTIVE' }
      ] as any;
      prismaMock.vendor.findMany.mockResolvedValue(mockItems);
      prismaMock.vendor.count.mockResolvedValue(1);

      const result = await vendorRepository.getVendors({ page: 1, limit: 10 });

      expect(result.items).toEqual(mockItems);
      expect(result.total).toBe(1);
      expect(prismaMock.vendor.findMany).toHaveBeenCalled();
      expect(prismaMock.vendor.count).toHaveBeenCalled();
    });

    test('getVendorById returns vendor', async () => {
      const mockVendor = { id: 1, companyName: 'Vendor A' } as any;
      prismaMock.vendor.findUnique.mockResolvedValue(mockVendor);

      const result = await vendorRepository.getVendorById(1);

      expect(result).toEqual(mockVendor);
      expect(prismaMock.vendor.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: expect.any(Object)
      });
    });

    test('createVendor calls prisma.vendor.create', async () => {
      const mockVendor = { id: 1, companyName: 'Vendor A' } as any;
      prismaMock.vendor.create.mockResolvedValue(mockVendor);

      const input = {
        userId: 2,
        companyName: 'Vendor A',
        gstNumber: 'GST123',
        category: 'IT',
        contactNumber: '1234567890',
        address: '123 Street'
      };

      const result = await vendorRepository.createVendor(input);
      expect(result).toEqual(mockVendor);
      expect(prismaMock.vendor.create).toHaveBeenCalled();
    });
  });

  describe('Service', () => {
    test('getVendorDetail throws error if not found', async () => {
      prismaMock.vendor.findUnique.mockResolvedValue(null);

      await expect(vendorService.getVendorDetail(999)).rejects.toThrow('Vendor not found');
    });

    test('onboardVendor throws if user does not exist', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(vendorService.onboardVendor({
        userId: 999,
        companyName: 'V',
        gstNumber: 'G',
        category: 'C',
        contactNumber: '1',
        address: 'A'
      })).rejects.toThrow('Associated user account not found');
    });

    test('onboardVendor throws if user role is not VENDOR', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: 2, role: 'OFFICER' } as any);

      await expect(vendorService.onboardVendor({
        userId: 2,
        companyName: 'V',
        gstNumber: 'G',
        category: 'C',
        contactNumber: '1',
        address: 'A'
      })).rejects.toThrow('User mapped to this vendor profile must have the VENDOR role');
    });
  });
});
