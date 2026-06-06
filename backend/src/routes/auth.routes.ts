import { Router } from "express";
import {
  register,
  login,
  refresh,
  logout,
  me,
  listUsers,
} from "../controllers/auth.controller";
import { validateBody } from "../middleware/validate";
import { registerSchema, loginSchema } from "../validations/auth.validation";
import { authenticateToken } from "../middleware/auth";

const router = Router();

router.post("/register", validateBody(registerSchema), register);
router.post("/login", validateBody(loginSchema), login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", authenticateToken, me);
router.get("/users", authenticateToken, listUsers);

export default router;
