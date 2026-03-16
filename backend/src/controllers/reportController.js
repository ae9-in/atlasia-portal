const fs = require("fs");
const path = require("path");
const { StatusCodes } = require("http-status-codes");
const ReportSubmission = require("../models/ReportSubmission");
const Task = require("../models/Task");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { reportFilesRoot } = require("../utils/paths");

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

  const existingSubmission = await ReportSubmission.findOne({ studentId: req.user._id, taskId });
  if (existingSubmission) {
    fs.unlink(req.file.path, () => {});
    throw new AppError("A report for this task has already been submitted", StatusCodes.CONFLICT);
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
    .populate("studentId", "name email businessId")
    .populate("taskId", "title status assignedTo createdBy");

  res.status(StatusCodes.OK).json({ reports });
});

const downloadReport = asyncHandler(async (req, res) => {
  const submission = await ReportSubmission.findById(req.params.id).populate("taskId", "assignedTo createdBy");

  if (!submission) {
    throw new AppError("Report not found", StatusCodes.NOT_FOUND);
  }

  const canAccess =
    req.user.role === "SUPER_ADMIN" ||
    req.user.role === "COORDINATOR" ||
    String(submission.studentId) === String(req.user._id) ||
    String(submission.taskId.createdBy) === String(req.user._id);

  if (!canAccess) {
    throw new AppError("Access denied", StatusCodes.FORBIDDEN);
  }

  const filePath = path.join(reportFilesRoot, submission.reportFile);
  if (!fs.existsSync(filePath)) {
    throw new AppError("Report file not found", StatusCodes.NOT_FOUND);
  }

  return res.download(filePath);
});

module.exports = {
  uploadReport,
  getStudentReports,
  getTaskReports,
  downloadReport
};
