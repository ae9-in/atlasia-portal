const fs = require("fs");
const { StatusCodes } = require("http-status-codes");
const Task = require("../models/Task");
const User = require("../models/User");
const ReportSubmission = require("../models/ReportSubmission");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { taskFilesRoot } = require("../utils/paths");

const buildTaskQuery = (user) => {
  if (user.role === "STUDENT") {
    return { assignedTo: user._id };
  }

  return {};
};

const createTask = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    expectedOutcome,
    daysRequired,
    startDate,
    deadlineDate,
    sprintId,
    assignedTo
  } = req.body;

  if (!title || !description || !expectedOutcome || !daysRequired || !startDate || !deadlineDate || !sprintId || !assignedTo) {
    throw new AppError(`All task fields are required. Missing one or more of: title, description, expectedOutcome, daysRequired, startDate, deadlineDate, sprintId, assignedTo. Received body: ${JSON.stringify(req.body)}`, StatusCodes.BAD_REQUEST);
  }

  const student = await User.findOne({ _id: assignedTo, role: "STUDENT", isActive: true }).populate("businessId", "name");
  if (!student) {
    throw new AppError("Assigned student not found", StatusCodes.NOT_FOUND);
  }

  if (!student.businessId) {
    throw new AppError("Assigned student must belong to a business before task creation", StatusCodes.BAD_REQUEST);
  }

  const attachments = (req.files || []).map((file) => file.filename);

  const task = await Task.create({
    title,
    description,
    expectedOutcome,
    daysRequired,
    startDate,
    deadlineDate,
    attachments,
    businessId: student.businessId._id,
    sprintId,
    assignedTo,
    createdBy: req.user._id,
    status: "ASSIGNED"
  });

  const populatedTask = await Task.findById(task._id)
    .populate("businessId", "name")
    .populate("sprintId", "name startDate endDate")
    .populate("assignedTo", "name email businessId")
    .populate("createdBy", "name email role");

  res.status(StatusCodes.CREATED).json({ message: "Task created successfully", task: populatedTask });
});

const getMyTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find(buildTaskQuery(req.user))
    .sort({ deadlineDate: 1, createdAt: -1 })
    .populate("businessId", "name description")
    .populate("sprintId", "name startDate endDate")
    .populate("assignedTo", "name email")
    .populate("createdBy", "name email role")
    .populate("comments.userId", "name role");

  res.status(StatusCodes.OK).json({ tasks });
});

const getAllTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find(buildTaskQuery(req.user))
    .sort({ createdAt: -1 })
    .populate("businessId", "name")
    .populate("sprintId", "name")
    .populate("assignedTo", "name email businessId")
    .populate("createdBy", "name email role")
    .populate("comments.userId", "name role");

  res.status(StatusCodes.OK).json({ tasks });
});

const addComment = asyncHandler(async (req, res) => {
  const { taskId, message } = req.body;
  
  if (!taskId || !message) {
    throw new AppError(`Task and comment message are required. Received taskId: ${taskId}, message: ${message}`, StatusCodes.BAD_REQUEST);
  }

  const task = await Task.findById(taskId);
  if (!task) {
    throw new AppError("Task not found", StatusCodes.NOT_FOUND);
  }

  const canComment =
    req.user.role === "SUPER_ADMIN" ||
    req.user.role === "COORDINATOR" ||
    String(task.assignedTo) === String(req.user._id) ||
    String(task.createdBy) === String(req.user._id);

  if (!canComment) {
    throw new AppError("Access denied", StatusCodes.FORBIDDEN);
  }

  task.comments.push({ userId: req.user._id, message });
  await task.save();

  const populatedTask = await Task.findById(task._id).populate("comments.userId", "name role");
  res.status(StatusCodes.OK).json({ message: "Comment added successfully", task: populatedTask });
});

const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    throw new AppError("Task not found", StatusCodes.NOT_FOUND);
  }

  if (req.user.role !== "SUPER_ADMIN" && req.user.role !== "COORDINATOR" && String(task.createdBy) !== String(req.user._id)) {
    throw new AppError("Access denied", StatusCodes.FORBIDDEN);
  }

  for (const attachment of task.attachments) {
    fs.unlink(`${taskFilesRoot}\\${attachment}`, () => {});
  }

  await Task.findByIdAndDelete(req.params.id);
  await ReportSubmission.deleteMany({ taskId: req.params.id });

  res.status(StatusCodes.OK).json({ message: "Task deleted successfully" });
});

module.exports = {
  createTask,
  getMyTasks,
  getAllTasks,
  addComment,
  deleteTask
};
