const { StatusCodes } = require("http-status-codes");
const DailyReport = require("../models/DailyReport");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const cloudinary = require("../config/cloudinary");
const { logActivity } = require("../services/logService");

/**
 * Upload a daily report for a student for the current IST day
 */
const uploadDailyReport = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  const todayIST = DailyReport.getTodayDateIST();

  // Check if a report for today already exists
  const existingReport = await DailyReport.findOne({ studentId, reportDate: todayIST });

  if (existingReport) {
    if (existingReport.status !== "RESUBMIT_REQUESTED") {
      throw new AppError("You have already submitted your daily report for today.", StatusCodes.CONFLICT);
    } else {
      // In case of resubmission, delete the old file on Cloudinary and the old DB record
      await cloudinary.uploader.destroy(existingReport.cloudinaryPublicId, { resource_type: "raw" });
      await DailyReport.findByIdAndDelete(existingReport._id);
    }
  }

  if (!req.file) {
    throw new AppError("Please provide a report file.", StatusCodes.BAD_REQUEST);
  }

  const format = req.file.originalname.split(".").pop().toLowerCase();

  const report = await DailyReport.create({
    studentId,
    reportDate: todayIST,
    cloudinaryUrl: req.file.path,
    cloudinaryPublicId: req.file.filename,
    originalFileName: req.file.originalname,
    fileFormat: format,
    fileSize: req.file.size || 0,
    resourceType: req.file.resource_type || "raw",
    status: "SUBMITTED"
  });

  res.status(StatusCodes.CREATED).json({
    message: "Daily report submitted successfully",
    report
  });
});

/**
 * Get all daily reports for the current student
 */
const getMyDailyReports = asyncHandler(async (req, res) => {
  const reports = await DailyReport.find({ studentId: req.user._id })
    .sort({ reportDate: -1 });

  res.status(StatusCodes.OK).json({ reports });
});

/**
 * Get all daily reports (Admin only) with filtering and pagination
 */
const getAllDailyReports = asyncHandler(async (req, res) => {
  const { date, studentId, studentName, page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  const query = {};
  
  if (date) {
    const parsedDate = new Date(date);
    const day = parsedDate.getUTCDate();
    const month = parsedDate.getUTCMonth();
    const year = parsedDate.getUTCFullYear();
    query.reportDate = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
  }

  if (studentId) {
    query.studentId = studentId;
  } else if (studentName) {
    const students = await User.find({ 
      name: { $regex: studentName, $options: "i" },
      role: "STUDENT"
    }).select("_id");
    query.studentId = { $in: students.map(s => s._id) };
  }

  const reports = await DailyReport.find(query)
    .populate("studentId", "name email college businessId")
    .sort({ reportDate: -1, submittedAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await DailyReport.countDocuments(query);

  res.status(StatusCodes.OK).json({
    reports,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit)
  });
});

/**
 * Update the status and admin note for a daily report (Admin only)
 */
const updateDailyReportStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, adminNote } = req.body;

  if (!["REVIEWED", "RESUBMIT_REQUESTED"].includes(status)) {
    throw new AppError("Invalid status. Allowed values: REVIEWED, RESUBMIT_REQUESTED.", StatusCodes.BAD_REQUEST);
  }

  const report = await DailyReport.findByIdAndUpdate(
    id,
    { status, adminNote },
    { new: true, runValidators: true }
  ).populate("studentId", "name email");

  if (!report) {
    throw new AppError("Daily report not found.", StatusCodes.NOT_FOUND);
  }

  await logActivity({
    userId: req.user._id,
    action: "UPDATE_DAILY_REPORT",
    details: `Updated report status for ${report.studentId.name} to ${status}`,
    metadata: { reportId: id, status, adminNote },
    ip: req.ip
  });

  res.status(StatusCodes.OK).json({ report });
});

/**
 * Download or view a daily report (Redirect to Cloudinary)
 */
const downloadDailyReport = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const isView = req.query.view === "true";

  const report = await DailyReport.findById(id);
  if (!report) {
    throw new AppError("Report not found.", StatusCodes.NOT_FOUND);
  }

  // Students can only access their own reports
  if (req.user.role === "STUDENT" && String(report.studentId) !== String(req.user._id)) {
    throw new AppError("Unauthorized access.", StatusCodes.FORBIDDEN);
  }

  if (req.user.role !== "STUDENT") {
    await logActivity({
      userId: req.user._id,
      action: isView ? "VIEW_DAILY_REPORT" : "DOWNLOAD_DAILY_REPORT",
      details: `${isView ? "Viewed" : "Downloaded"} daily report for ${id}`,
      metadata: { reportId: id },
      ip: req.ip
    });
  }

  const cloudinaryUrl = report.cloudinaryUrl;
  const resourceType = report.resourceType || "raw";

  if (isView) {
    // Attempt inline viewing for images/videos/PDFs (anything not 'raw' usually has right headers)
    if (resourceType !== "raw" || ["pdf", "png", "jpg", "jpeg", "webp"].includes(report.fileFormat)) {
      return res.redirect(302, cloudinaryUrl);
    }
  }

  // Only images and videos reliably support the fl_attachment flag in the URL for this setup
  if (resourceType === "image" || resourceType === "video") {
    const downloadUrl = cloudinaryUrl.replace("/upload/", "/upload/fl_attachment/");
    return res.redirect(302, downloadUrl);
  }

  // For everything else (raw types), standard direct delivery is safest to avoid 401s
  res.redirect(302, cloudinaryUrl);
});

/**
 * Get today's daily report status for student
 */
const getTodayStatus = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  const todayIST = DailyReport.getTodayDateIST();

  const report = await DailyReport.findOne({ studentId, reportDate: todayIST });

  res.status(StatusCodes.OK).json({
    submitted: !!report,
    report: report || null,
    canResubmit: report ? report.status === "RESUBMIT_REQUESTED" : false
  });
});

module.exports = {
  uploadDailyReport,
  getMyDailyReports,
  getAllDailyReports,
  updateDailyReportStatus,
  downloadDailyReport,
  getTodayStatus
};
