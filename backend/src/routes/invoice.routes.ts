import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { requireRole } from '../middleware/roleGuard';
import { validateBody } from '../middleware/validate';
import { createInvoiceSchema } from '../validations/invoice.validation';
import * as invoiceController from '../controllers/invoice.controller';

const router = Router();

router.get('/', authenticateToken, requireRole(['OFFICER', 'ADMIN', 'MANAGER', 'VENDOR']), invoiceController.listInvoices);
router.get('/:id', authenticateToken, requireRole(['OFFICER', 'ADMIN', 'MANAGER', 'VENDOR']), invoiceController.getInvoiceDetail);
router.post('/', authenticateToken, requireRole(['OFFICER', 'ADMIN']), validateBody(createInvoiceSchema), invoiceController.createInvoice);
router.patch('/:id/pay', authenticateToken, requireRole(['OFFICER', 'ADMIN']), invoiceController.markInvoiceAsPaid);

export default router;
