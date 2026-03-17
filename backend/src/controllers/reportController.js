const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const { StatusCodes } = require("http-status-codes");
const ReportSubmission = require("../models/ReportSubmission");
const Task = require("../models/Task");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { reportFilesRoot } = require("../utils/paths");
const { logActivity } = require("../services/logService");

const uploadReport = asyncHandler(async (req, res) => {
  const taskId = req.params.taskId || req.body.taskId;

  if (!req.file || !taskId) {
    throw new AppError("Task and report file are required", StatusCodes.BAD_REQUEST);
  }

  const task = await Task.findById(taskId);
  if (!task) {
    fs.unlink(req.file.path, () => {});
    throw new AppError("Task not found", StatusCodes.NOT_FOUND);
  }

  if (String(task.assignedTo) !== String(req.user._id)) {
    fs.unlink(req.file.path, () => {});
    throw new AppError("You can only submit reports for your assigned tasks", StatusCodes.FORBIDDEN);
  }

  const submissionCount = await ReportSubmission.countDocuments({ studentId: req.user._id, taskId });
  if (submissionCount >= 3) {
    fs.unlink(req.file.path, () => {});
    throw new AppError("Maximum of 3 reports allowed per task.", StatusCodes.CONFLICT);
  }

  const submission = await ReportSubmission.create({
    studentId: req.user._id,
    taskId,
    reportFile: req.file.filename,
    status: "SUBMITTED"
  });

  task.status = "SUBMITTED";
  await task.save();

  res.status(StatusCodes.CREATED).json({ message: "Report uploaded successfully", submission });
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
  
  // Try to find by ID first, then by filename
  const isId = mongoose.Types.ObjectId.isValid(id);
  const submission = await ReportSubmission.findOne({
    $or: [
      ...(isId ? [{ _id: id }] : []),
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

  const filePath = path.resolve(reportFilesRoot, submission.reportFile);
  if (!fs.existsSync(filePath)) {
    console.error(`Report file not found at: ${filePath}`);
    throw new AppError("Report file not found on server storage.", StatusCodes.NOT_FOUND);
  }

  if (req.query.view === "true") {
    const ext = path.extname(filePath).toLowerCase();
    const codeExtensions = ['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.c', '.cpp', '.h', '.html', '.css', '.json', '.txt', '.md'];
    
    const headers = {
      "Content-Disposition": "inline"
    };

    if (codeExtensions.includes(ext)) {
      headers["Content-Type"] = "text/plain";
    }

    return res.sendFile(filePath, { headers });
  }

  return res.download(filePath);
});

module.exports = {
  uploadReport,
  getStudentReports,
  getTaskReports,
  downloadReport
};
