const express = require("express");
const {
  uploadReport,
  getStudentReports,
  getTaskReports,
  downloadReport
} = require("../controllers/reportController");
const {
  verifyToken,
  requireStudent,
  requireAdminOrSuperadmin
} = require("../middleware/authMiddleware");
const { reportUpload } = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post("/upload/:taskId", verifyToken, requireStudent, reportUpload.single("report"), uploadReport);
router.get("/student", verifyToken, requireStudent, getStudentReports);
router.get("/task", verifyToken, requireAdminOrSuperadmin, getTaskReports);
router.get("/download/:id", verifyToken, downloadReport);

module.exports = router;
