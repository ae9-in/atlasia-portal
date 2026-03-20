const mongoose = require("mongoose");
const path = require("path");
const { StatusCodes } = require("http-status-codes");
const ReportSubmission = require("../models/ReportSubmission");
const Task = require("../models/Task");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { logActivity } = require("../services/logService");
const cloudinary = require("../config/cloudinary");

const uploadReport = asyncHandler(async (req, res) => {
  const taskId = req.params.taskId || req.body.taskId;

  if (!req.file || !taskId) {
    throw new AppError("Task and report file are required", StatusCodes.BAD_REQUEST);
  }

  const task = await Task.findById(taskId);
  if (!task) {
    // Cleanup Cloudinary file if task doesn't exist
    if (req.file.filename) {
      await cloudinary.uploader.destroy(req.file.filename, { resource_type: "raw" });
    }
    throw new AppError("Task not found", StatusCodes.NOT_FOUND);
  }

  if (String(task.assignedTo) !== String(req.user._id)) {
    if (req.file.filename) {
      await cloudinary.uploader.destroy(req.file.filename, { resource_type: "raw" });
    }
    throw new AppError("You can only submit reports for your assigned tasks", StatusCodes.FORBIDDEN);
  }

  const submissionCount = await ReportSubmission.countDocuments({ studentId: req.user._id, taskId });
  if (submissionCount >= 3) {
    if (req.file.filename) {
      await cloudinary.uploader.destroy(req.file.filename, { resource_type: "raw" });
    }
    throw new AppError("Maximum of 3 reports allowed per task.", StatusCodes.CONFLICT);
  }

  // req.file.path is the Cloudinary secure_url
  // req.file.filename is the Cloudinary public_id
  const submission = await ReportSubmission.create({
    studentId: req.user._id,
    taskId,
    cloudinaryUrl: req.file.path,
    cloudinaryPublicId: req.file.filename,
    originalFileName: req.file.originalname,
    fileFormat: path.extname(req.file.originalname).replace(".", "").toLowerCase(),
    fileSize: req.file.size || 0,
    resourceType: req.file.resource_type || "raw",
    // Maintaining reportFile for legacy compatibility with frontend keys
    reportFile: req.file.filename, 
    status: "SUBMITTED"
  });

  task.status = "SUBMITTED";
  await task.save();

  res.status(StatusCodes.CREATED).json({ 
    message: "Report uploaded successfully", 
    submission 
  });
});

const getStudentReports = asyncHandler(async (req, res) => {
  const reports = await ReportSubmission.find({ studentId: req.user._id })
    .sort({ submittedAt: -1 })
    .populate("taskId", "title deadlineDate status sprintId businessId");

  res.status(StatusCodes.OK).json({ reports });
});

const getTaskReports = asyncHandler(async (req, res) => {
  const query = req.query.taskId ? { taskId: req.query.taskId } : {};
  const reports = await ReportSubmission.find(query)
    .sort({ submittedAt: -1 })
    .populate({
      path: "studentId",
      select: "name email businessId college",
      populate: { path: "businessId", select: "name" }
    })
    .populate("taskId", "title status assignedTo createdBy");

  res.status(StatusCodes.OK).json({ reports });
});

const downloadReport = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const isId = mongoose.Types.ObjectId.isValid(id);
  const submission = await ReportSubmission.findOne({
    $or: [
      ...(isId ? [{ _id: id }] : []),
      { cloudinaryPublicId: id },
      { reportFile: id }
    ]
  }).populate("taskId", "assignedTo createdBy");

  if (!submission) {
    throw new AppError("Report not found", StatusCodes.NOT_FOUND);
  }

  const canAccess =
    req.user.role === "SUPERADMIN" ||
    req.user.role === "ADMIN" ||
    String(submission.studentId) === String(req.user._id) ||
    String(submission.taskId.createdBy) === String(req.user._id);

  if (!canAccess) {
    throw new AppError("Access denied", StatusCodes.FORBIDDEN);
  }

  if (["ADMIN", "SUPERADMIN"].includes(req.user.role)) {
    await logActivity({
      userId: req.user._id,
      action: req.query.view === 'true' ? "VIEW_REPORT" : "DOWNLOAD_REPORT",
      details: `${req.query.view === 'true' ? 'Viewed' : 'Downloaded'} report for submission ${submission._id}`,
      metadata: { submissionId: submission._id, taskId: submission.taskId?._id },
      ip: req.ip
    });
  }

  // Redirect to Cloudinary URL — NO local disk needed
  if (submission.cloudinaryUrl) {
    const isView = req.query.view === "true";
    const cloudinaryUrl = submission.cloudinaryUrl;
    const resourceType = submission.resourceType || "raw";

    if (isView) {
        // Attempt inline viewing for images/videos/PDFs (anything not 'raw')
        if (resourceType !== "raw" || ["pdf", "png", "jpg", "jpeg", "webp"].includes(submission.fileFormat)) {
            return res.redirect(302, cloudinaryUrl);
        }
    }

    // Only images and videos reliably support the fl_attachment flag in the URL for this account's configuration
    if (resourceType === "image" || resourceType === "video") {
        const downloadUrl = cloudinaryUrl.replace("/upload/", "/upload/fl_attachment/");
        return res.redirect(302, downloadUrl);
    }

    // For everything else (raw types), standard delivery is safest to avoid 401s
    return res.redirect(302, cloudinaryUrl);
  }

  // Legacy fallback for local files (only works if they still exist on disk)
  const { reportFilesRoot } = require("../utils/paths");
  const fs = require("fs");
  const filePath = path.resolve(reportFilesRoot, submission.reportFile);
  
  if (!fs.existsSync(filePath)) {
    throw new AppError("File not found on cloud or server storage.", StatusCodes.NOT_FOUND);
  }

  if (req.query.view === "true") {
      return res.sendFile(filePath, { headers: { "Content-Disposition": "inline" } });
  }
  return res.download(filePath);
});

module.exports = {
  uploadReport,
  getStudentReports,
  getTaskReports,
  downloadReport
};
