import { Router } from 'express';
import { getRfqs, getRfqById, createRfq, updateRfq, publishRfq } from '../controllers/rfq.controller';
import { authenticateToken } from '../middleware/auth';
import { requireRole } from '../middleware/roleGuard';
import { validateBody } from '../middleware/validate';
import { createRfqSchema, updateRfqSchema } from '../validations/rfq.validation';

const router = Router();

// Retrieve list of RFQs (accessible to Officers, Managers, and Vendors)
router.get(
  '/', 
  authenticateToken, 
  requireRole(['ADMIN', 'MANAGER', 'OFFICER', 'VENDOR']), 
  getRfqs
);

// Retrieve single RFQ details (accessible to Officers, Managers, and assigned Vendors)
router.get(
  '/:id', 
  authenticateToken, 
  requireRole(['ADMIN', 'MANAGER', 'OFFICER', 'VENDOR']), 
  getRfqById
);

// Create a new RFQ (Officers and Admins only)
router.post(
  '/', 
  authenticateToken, 
  requireRole(['ADMIN', 'OFFICER']), 
  validateBody(createRfqSchema), 
  createRfq
);

// Update a Draft RFQ (Officers and Admins only)
router.put(
  '/:id', 
  authenticateToken, 
  requireRole(['ADMIN', 'OFFICER']), 
  validateBody(updateRfqSchema), 
  updateRfq
);

import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), 'uploads', 'rfqs');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Upload RFQ file attachments (Officers and Admins only)
router.post(
  '/upload',
  authenticateToken,
  requireRole(['ADMIN', 'OFFICER']),
  upload.single('file'),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file provided' });
    }
    return res.status(200).json({
      success: true,
      data: {
        fileName: req.file.originalname,
        filePath: `/uploads/rfqs/${req.file.filename}`
      }
    });
  }
);

// Publish RFQ to invited vendors (Officers and Admins only)
router.post(
  '/:id/send', 
  authenticateToken, 
  requireRole(['ADMIN', 'OFFICER']), 
  publishRfq
);

export default router;
