import express from "express";
import { verifyToken, adminOnly, adminOrManager, anyRole, excelCsvAllowed } from "../middleware/authMiddleware.js";

import {
  // View
  dailyReport, weeklyReport, monthlyReport, yearlyReport, customReport,

  // Client Fare Excel (admin + user only, no manager)
  exportDailyClientExcel, exportWeeklyClientExcel, exportMonthlyClientExcel,
  exportYearlyClientExcel, exportCustomClientExcel,

  // Company Fare Excel (admin + user only, no manager)
  exportDailyCompanyExcel, exportWeeklyCompanyExcel, exportMonthlyCompanyExcel,
  exportYearlyCompanyExcel, exportCustomCompanyExcel,

  // PDF combined (all roles)
  exportDailyPdf, exportWeeklyPdf, exportMonthlyPdf, exportYearlyPdf, exportCustomPdf,

  // Client Fare PDF (all roles)
  exportDailyClientPdf, exportWeeklyClientPdf, exportMonthlyClientPdf,
  exportYearlyClientPdf, exportCustomClientPdf,

  // Company Fare PDF (all roles)
  exportDailyCompanyPdf, exportWeeklyCompanyPdf, exportMonthlyCompanyPdf,
  exportYearlyCompanyPdf, exportCustomCompanyPdf,

  // Client Fare CSV (admin + user only, no manager)
  exportDailyClientCsv, exportWeeklyClientCsv, exportMonthlyClientCsv,
  exportYearlyClientCsv, exportCustomClientCsv,

  // Company Fare CSV (admin + user only, no manager)
  exportDailyCompanyCsv, exportWeeklyCompanyCsv, exportMonthlyCompanyCsv,
  exportYearlyCompanyCsv, exportCustomCompanyCsv,

  // Diesel Excel (admin + user only, no manager)
  exportDailyDieselExcel, exportWeeklyDieselExcel, exportMonthlyDieselExcel,
  exportYearlyDieselExcel, exportCustomDieselExcel,

  // Diesel PDF (all roles)
  exportDailyDieselPdf, exportWeeklyDieselPdf, exportMonthlyDieselPdf,
  exportYearlyDieselPdf, exportCustomDieselPdf,

} from "../controllers/reportController.js";

const router = express.Router();

// ── View (all roles) ──────────────────────────────────────────
router.get("/daily",   verifyToken, anyRole, dailyReport);
router.get("/weekly",  verifyToken, anyRole, weeklyReport);
router.get("/monthly", verifyToken, anyRole, monthlyReport);
router.get("/yearly",  verifyToken, anyRole, yearlyReport);
router.get("/custom",  verifyToken, anyRole, customReport);

// ── Client Fare Excel (no manager) ───────────────────────────
router.get("/daily-client-excel",   verifyToken, excelCsvAllowed, exportDailyClientExcel);
router.get("/weekly-client-excel",  verifyToken, excelCsvAllowed, exportWeeklyClientExcel);
router.get("/monthly-client-excel", verifyToken, excelCsvAllowed, exportMonthlyClientExcel);
router.get("/yearly-client-excel",  verifyToken, excelCsvAllowed, exportYearlyClientExcel);
router.get("/custom-client-excel",  verifyToken, excelCsvAllowed, exportCustomClientExcel);

// ── Company Fare Excel (no manager) ──────────────────────────
router.get("/daily-company-excel",   verifyToken, excelCsvAllowed, exportDailyCompanyExcel);
router.get("/weekly-company-excel",  verifyToken, excelCsvAllowed, exportWeeklyCompanyExcel);
router.get("/monthly-company-excel", verifyToken, excelCsvAllowed, exportMonthlyCompanyExcel);
router.get("/yearly-company-excel",  verifyToken, excelCsvAllowed, exportYearlyCompanyExcel);
router.get("/custom-company-excel",  verifyToken, excelCsvAllowed, exportCustomCompanyExcel);

// ── PDF combined (all roles) ───────────────────────────────────────────────
router.get("/daily-pdf",   verifyToken, anyRole, exportDailyPdf);
router.get("/weekly-pdf",  verifyToken, anyRole, exportWeeklyPdf);
router.get("/monthly-pdf", verifyToken, anyRole, exportMonthlyPdf);
router.get("/yearly-pdf",  verifyToken, anyRole, exportYearlyPdf);
router.get("/custom-pdf",  verifyToken, anyRole, exportCustomPdf);

// ── Client Fare PDF (all roles) ───────────────────────────────────────────
router.get("/daily-client-pdf",   verifyToken, anyRole, exportDailyClientPdf);
router.get("/weekly-client-pdf",  verifyToken, anyRole, exportWeeklyClientPdf);
router.get("/monthly-client-pdf", verifyToken, anyRole, exportMonthlyClientPdf);
router.get("/yearly-client-pdf",  verifyToken, anyRole, exportYearlyClientPdf);
router.get("/custom-client-pdf",  verifyToken, anyRole, exportCustomClientPdf);

// ── Company Fare PDF (all roles) ──────────────────────────────────────────
router.get("/daily-company-pdf",   verifyToken, anyRole, exportDailyCompanyPdf);
router.get("/weekly-company-pdf",  verifyToken, anyRole, exportWeeklyCompanyPdf);
router.get("/monthly-company-pdf", verifyToken, anyRole, exportMonthlyCompanyPdf);
router.get("/yearly-company-pdf",  verifyToken, anyRole, exportYearlyCompanyPdf);
router.get("/custom-company-pdf",  verifyToken, anyRole, exportCustomCompanyPdf);

// ── Client Fare CSV (no manager) ─────────────────────────────
router.get("/daily-client-csv",   verifyToken, excelCsvAllowed, exportDailyClientCsv);
router.get("/weekly-client-csv",  verifyToken, excelCsvAllowed, exportWeeklyClientCsv);
router.get("/monthly-client-csv", verifyToken, excelCsvAllowed, exportMonthlyClientCsv);
router.get("/yearly-client-csv",  verifyToken, excelCsvAllowed, exportYearlyClientCsv);
router.get("/custom-client-csv",  verifyToken, excelCsvAllowed, exportCustomClientCsv);

// ── Company Fare CSV (no manager) ────────────────────────────
router.get("/daily-company-csv",   verifyToken, excelCsvAllowed, exportDailyCompanyCsv);
router.get("/weekly-company-csv",  verifyToken, excelCsvAllowed, exportWeeklyCompanyCsv);
router.get("/monthly-company-csv", verifyToken, excelCsvAllowed, exportMonthlyCompanyCsv);
router.get("/yearly-company-csv",  verifyToken, excelCsvAllowed, exportYearlyCompanyCsv);
router.get("/custom-company-csv",  verifyToken, excelCsvAllowed, exportCustomCompanyCsv);

// ── Diesel Excel (no manager) ─────────────────────────────────
router.get("/daily-diesel-excel",   verifyToken, excelCsvAllowed, exportDailyDieselExcel);
router.get("/weekly-diesel-excel",  verifyToken, excelCsvAllowed, exportWeeklyDieselExcel);
router.get("/monthly-diesel-excel", verifyToken, excelCsvAllowed, exportMonthlyDieselExcel);
router.get("/yearly-diesel-excel",  verifyToken, excelCsvAllowed, exportYearlyDieselExcel);
router.get("/custom-diesel-excel",  verifyToken, excelCsvAllowed, exportCustomDieselExcel);

// ── Diesel PDF (all roles) ────────────────────────────────────
router.get("/daily-diesel-pdf",   verifyToken, anyRole, exportDailyDieselPdf);
router.get("/weekly-diesel-pdf",  verifyToken, anyRole, exportWeeklyDieselPdf);
router.get("/monthly-diesel-pdf", verifyToken, anyRole, exportMonthlyDieselPdf);
router.get("/yearly-diesel-pdf",  verifyToken, anyRole, exportYearlyDieselPdf);
router.get("/custom-diesel-pdf",  verifyToken, anyRole, exportCustomDieselPdf);

export default router;
