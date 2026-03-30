import express from "express";
import {
  login,
  initiateCreateUser,
  confirmCreateUser,
  getUsers,
  editUser,
  deleteUser,
  seedAdmin
} from "../controllers/authController.js";
import { verifyToken, adminOnly, adminOrManager } from "../middleware/authMiddleware.js";

const router = express.Router();

// ─────────────────────────────────────────────
// Public
// ─────────────────────────────────────────────
router.post("/login", login);
router.post("/seed",  seedAdmin);

// ─────────────────────────────────────────────
// Admin only — create user (2-step with OTP)
// ─────────────────────────────────────────────
router.post("/users/initiate", verifyToken, adminOnly, initiateCreateUser);
router.post("/users/confirm",  verifyToken, adminOnly, confirmCreateUser);

// ─────────────────────────────────────────────
// Admin only — edit and delete users
// ─────────────────────────────────────────────
router.put("/users/:id",    verifyToken, adminOnly, editUser);
router.delete("/users/:id", verifyToken, adminOnly, deleteUser);

// ─────────────────────────────────────────────
// Admin + Manager — view users
// ─────────────────────────────────────────────
router.get("/users", verifyToken, adminOrManager, getUsers);

export default router;
