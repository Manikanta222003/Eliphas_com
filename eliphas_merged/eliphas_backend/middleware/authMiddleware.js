import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();


export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ message: "No token provided" });

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};


// ─────────────────────────────────────────────
// Admin only
// ─────────────────────────────────────────────
export const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin")
    return res.status(403).json({ message: "Admin access required" });
  next();
};


// ─────────────────────────────────────────────
// Admin or Manager
// ─────────────────────────────────────────────
export const adminOrManager = (req, res, next) => {
  if (!req.user || !["admin", "manager"].includes(req.user.role))
    return res.status(403).json({ message: "Admin or Manager access required" });
  next();
};


// ─────────────────────────────────────────────
// All authenticated roles (admin, manager, user)
// ─────────────────────────────────────────────
export const anyRole = (req, res, next) => {
  if (!req.user || !["admin", "manager", "user"].includes(req.user.role))
    return res.status(403).json({ message: "Access denied" });
  next();
};


// ─────────────────────────────────────────────
// Manager cannot download Excel/CSV
// ─────────────────────────────────────────────
export const excelCsvAllowed = (req, res, next) => {
  if (!req.user || req.user.role === "manager")
    return res.status(403).json({ message: "Managers are not allowed to download Excel or CSV" });
  if (!["admin", "user"].includes(req.user.role))
    return res.status(403).json({ message: "Access denied" });
  next();
};
