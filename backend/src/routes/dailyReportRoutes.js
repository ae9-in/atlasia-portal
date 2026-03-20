const express = require("express");
const router = express.Router();
const {
  uploadDailyReport,
  getMyDailyReports,
  getAllDailyReports,
  updateDailyReportStatus,
  downloadDailyReport,
  getTodayStatus
} = require("../controllers/dailyReportController");
const { 
  verifyToken, 
  requireAdminOrSuperadmin 
} = require("../middleware/authMiddleware");
const { reportUpload } = require("../middleware/uploadMiddleware");

/**
 * General student routes for daily reports
 */
router.post("/upload", verifyToken, reportUpload.single("report"), uploadDailyReport);
router.get("/my-reports", verifyToken, getMyDailyReports);
router.get("/today-status", verifyToken, getTodayStatus);

/**
 * Admin-only and cross-role routes
 */
router.get("/all", verifyToken, requireAdminOrSuperadmin, getAllDailyReports);
router.patch("/:id/status", verifyToken, requireAdminOrSuperadmin, updateDailyReportStatus);
router.get("/:id/download", verifyToken, downloadDailyReport);

module.exports = router;
