import * as invoiceRepository from '../repositories/invoice.repository';
import { logActivity } from '../lib/activityLogger';
import { sendInvoiceEmail } from '../lib/email';
import prisma from '../lib/prisma';

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

  // In-app notification for vendor
  const vendorUser = po.vendor.user;
  if (vendorUser) {
    await prisma.notification.create({
      data: {
        userId: vendorUser.id,
        message: `Invoice ${invoiceNumber} (₹${grandTotal}) generated for PO ${po.poNumber}`,
        type: 'INVOICE',
        relatedEntityId: invoice.id,
        entityType: 'invoice'
      }
    });

    // Email to vendor
    await sendInvoiceEmail(
      vendorUser.email,
      `${vendorUser.firstName} ${vendorUser.lastName}`,
      invoiceNumber,
      po.poNumber,
      grandTotal,
      po.vendor.gstNumber
    );
  }

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

  // In-app notification to the RFQ creator
  const rfqCreatorId = invoice.purchaseOrder.quotation?.rfq?.creator?.id;
  if (rfqCreatorId) {
    await prisma.notification.create({
      data: {
        userId: rfqCreatorId,
        message: `Invoice ${invoice.invoiceNumber} (₹${invoice.grandTotal}) marked as PAID${paidRemarks ? ` — "${paidRemarks}"` : ''}`,
        type: 'INVOICE',
        relatedEntityId: invoiceId,
        entityType: 'invoice'
      }
    });
  }

  return updated;
};
