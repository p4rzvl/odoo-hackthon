import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import path from "path";
import healthRouter from "./routes/health.routes";
import authRouter from "./routes/auth.routes";
import vendorRouter from "./routes/vendor.routes";
import rfqRouter from "./routes/rfq.routes";
import quotationRouter from "./routes/quotation.routes";
import approvalRouter from "./routes/approval.routes";
import purchaseOrderRouter from "./routes/purchaseOrder.routes";
import invoiceRouter from "./routes/invoice.routes";
import adminRouter from "./routes/admin.routes";
import { authenticateToken } from "./middleware/auth";
import { AuthenticatedRequest } from "./types";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Routes
app.use("/api", healthRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/vendors", vendorRouter);
app.use("/api/v1/rfqs", rfqRouter);
app.use("/api/v1/quotations", quotationRouter);
app.use("/api/v1/approvals", approvalRouter);
app.use("/api/v1/purchase-orders", purchaseOrderRouter);
app.use("/api/v1/invoices", invoiceRouter);
app.use("/api/v1/admin", adminRouter);

// Sample Protected Route
app.get(
  "/api/v1/dashboard/metrics",
  authenticateToken,
  (req: AuthenticatedRequest, res) => {
    res.json({
      success: true,
      message: `Hello ${req.user?.firstName}, authorized session validated!`,
      metrics: {
        activeUsers: 142,
        totalOrders: 320,
        revenueUSD: 8540,
        satisfactionRate: "98%",
      },
    });
  },
);

import { globalErrorHandler } from "./middleware/errorHandler";

// Start the server
app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
