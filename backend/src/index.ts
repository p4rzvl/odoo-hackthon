import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import healthRouter from "./routes/health.routes";
import authRouter from "./routes/auth.routes";
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

// Routes
app.use("/api", healthRouter);
app.use("/api/v1/auth", authRouter);

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
