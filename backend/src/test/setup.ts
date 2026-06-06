import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';

// Mock the whole prisma module relative to its path
jest.mock('../lib/prisma', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
  prisma: mockDeep<PrismaClient>(),
  pool: {
    query: jest.fn(),
    connect: jest.fn(),
    end: jest.fn(),
  },
}));

// Mock the resend API
jest.mock('resend', () => {
  return {
    Resend: jest.fn().mockImplementation(() => {
      return {
        emails: {
          send: jest.fn().mockResolvedValue({ data: { id: 'mocked-email-id' } }),
        },
      };
    }),
  };
});

import prisma from '../lib/prisma';

beforeEach(() => {
  const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;
  mockReset(prismaMock);
  
  // Set up default mock implementation for $transaction to call the callback with prismaMock
  prismaMock.$transaction.mockImplementation(async (callback: any) => {
    if (typeof callback === 'function') {
      return callback(prismaMock);
    }
    return callback;
  });
});
