import * as invoiceRepository from '../repositories/invoice.repository';
import { logActivity } from '../lib/activityLogger';

export const createInvoiceFromPo = async (userId: number, poId: number, invoiceDate: Date, dueDate: Date) => {
  const po = await invoiceRepository.getPurchaseOrderForInvoice(poId);
  if (!po) throw new Error('Purchase Order not found');
  if (po.status !== 'APPROVED') throw new Error('Purchase Order must be APPROVED before generating an invoice');

  const existingInvoices = po.invoices || [];
  if (existingInvoices.length > 0) {
    throw new Error('An invoice has already been generated for this Purchase Order');
  }

  const subtotal = Number(po.totalAmount);
  const cgstPercent = 9;
  const sgstPercent = 9;
  const cgst = Math.round(subtotal * cgstPercent / 100 * 100) / 100;
  const sgst = Math.round(subtotal * sgstPercent / 100 * 100) / 100;
  const grandTotal = Math.round((subtotal + cgst + sgst) * 100) / 100;

  const invoiceNumber = await invoiceRepository.getNextInvoiceNumber();

  const invoice = await invoiceRepository.createInvoice({
    invoiceNumber,
    poId,
    invoiceDate,
    dueDate,
    subtotal,
    cgst,
    sgst,
    grandTotal
  });

  await logActivity({
    actorId: userId,
    actionType: 'INVOICE',
    description: `Invoice ${invoiceNumber} (INR ${grandTotal}) generated for Purchase Order ${po.poNumber} with ${po.vendor.companyName}`,
    entityId: invoice.id,
    entityType: 'invoice'
  });

  return invoice;
};

export const listInvoices = async (filters: { status?: string; page: number; limit: number }) => {
  return invoiceRepository.listInvoices(filters);
};

export const getInvoiceDetail = async (invoiceId: number) => {
  const invoice = await invoiceRepository.getInvoiceById(invoiceId);
  if (!invoice) throw new Error('Invoice not found');
  return invoice;
};

export const markInvoiceAsPaid = async (userId: number, invoiceId: number, paidRemarks?: string) => {
  const invoice = await invoiceRepository.getInvoiceById(invoiceId);
  if (!invoice) throw new Error('Invoice not found');
  if (invoice.status === 'PAID') throw new Error('Invoice is already marked as paid');

  const updated = await invoiceRepository.markInvoiceAsPaid(invoiceId, paidRemarks);

  const remarkLog = paidRemarks ? `. Remarks: ${paidRemarks}` : '';
  await logActivity({
    actorId: userId,
    actionType: 'INVOICE',
    description: `Invoice ${invoice.invoiceNumber} marked as PAID${remarkLog}`,
    entityId: invoiceId,
    entityType: 'invoice'
  });

  return updated;
};
