import * as reportRepository from '../repositories/report.repository';
import { Role } from '@prisma/client';

export const getOverview = async (role: Role, month?: string) => {
  const data = await reportRepository.getOverview(month);

  if (role === 'VENDOR') {
    return {
      ...data,
      totalPoCount: 0,
      fulfilledCount: 0,
      fulfillmentRate: 0,
      totalSpend: 0,
      avgPoValue: 0,
      rfqCount: 0,
      quotationCount: 0,
      pendingApprovals: 0
    };
  }

  return data;
};

export const getSpendTrend = async (role: Role, month?: string) => {
  return role === 'VENDOR' ? [] : reportRepository.getSpendTrend(month);
};

export const getSpendByVendor = async (role: Role) => {
  return role === 'VENDOR' ? [] : reportRepository.getSpendByVendor();
};

export const getCsvData = async (role: Role) => {
  return role === 'VENDOR' ? [] : reportRepository.getCsvData();
};
