import express from "express";
import { addBilling, searchBilling, updateBilling, deleteBilling } from "../controllers/billingController.js";
import { verifyToken, adminOnly, adminOrManager, anyRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// Add billing — admin & manager only (enforced in controller too)
router.post("/add", verifyToken, adminOrManager, addBilling);

// Search — all roles (financialYear + companyLocation required in query)
router.get("/search", verifyToken, anyRole, searchBilling);

// Update — admin & manager only
router.put("/update/:id", verifyToken, adminOrManager, updateBilling);

// Delete — admin only
router.delete("/delete/:id", verifyToken, adminOnly, deleteBilling);

export default router;
