const fs = require("fs");
const { StatusCodes } = require("http-status-codes");
const Task = require("../models/Task");
const User = require("../models/User");
const ReportSubmission = require("../models/ReportSubmission");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { taskFilesRoot } = require("../utils/paths");
const { logActivity } = require("../services/logService");

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
    assignedTo, // Can be an array of IDs
    businessId
  } = req.body;

  if (!title || !description || !expectedOutcome || !daysRequired || !startDate || !deadlineDate || !sprintId || !assignedTo || !businessId) {
    throw new AppError("All task fields inclusive of business are required.", StatusCodes.BAD_REQUEST);
  }

  const assignedUserIds = Array.isArray(assignedTo) ? assignedTo : [assignedTo];
  const attachments = (req.files || []).map((file) => file.filename);
  const createdTasksCount = [];

  for (const studentId of assignedUserIds) {
    const student = await User.findOne({ _id: studentId, role: "STUDENT", isActive: true });
    
    if (!student) {
      continue;
    }

    // Update student's business if it's different or missing
    if (String(student.businessId) !== String(businessId)) {
      student.businessId = businessId;
      await student.save();
    }

    const task = await Task.create({
      title,
      description,
      expectedOutcome,
      daysRequired,
      startDate,
      deadlineDate,
      attachments,
      businessId,
      sprintId,
      assignedTo: studentId,
      createdBy: req.user._id,
      status: "ASSIGNED"
    });
    createdTasksCount.push(task._id);
  }

  if (createdTasksCount.length === 0) {
    throw new AppError("No valid students were selected for task assignment.", StatusCodes.BAD_REQUEST);
  }

  await logActivity({
    userId: req.user._id,
    action: "CREATE_TASK",
    details: `Created task "${title}" for ${createdTasksCount.length} students`,
    metadata: { taskCount: createdTasksCount.length, title },
    ip: req.ip
  });

  res.status(StatusCodes.CREATED).json({ 
    message: `Successfully created tasks for ${createdTasksCount.length} students.`,
    createdCount: createdTasksCount.length 
  });
});

const getMyTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find(buildTaskQuery(req.user))
    .sort({ deadlineDate: 1, createdAt: -1 })
    .populate("businessId", "name description")
    .populate("sprintId", "name startDate endDate")
    .populate("assignedTo", "name email college")
    .populate("createdBy", "name email role")
    .populate("comments.userId", "name role");
    
  // Enhance tasks with submission counts
  const tasksWithCounts = await Promise.all(tasks.map(async (task) => {
    const count = await ReportSubmission.countDocuments({ taskId: task._id });
    return { ...task.toObject(), submissionCount: count };
  }));

  res.status(StatusCodes.OK).json({ tasks: tasksWithCounts });
});

const getAllTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find(buildTaskQuery(req.user))
    .sort({ createdAt: -1 })
    .populate("businessId", "name")
    .populate("sprintId", "name")
    .populate("assignedTo", "name email businessId college")
    .populate("createdBy", "name email role")
    .populate("comments.userId", "name role");

  // Enhance tasks with submission counts
  const tasksWithCounts = await Promise.all(tasks.map(async (task) => {
    const count = await ReportSubmission.countDocuments({ taskId: task._id });
    return { ...task.toObject(), submissionCount: count };
  }));

  res.status(StatusCodes.OK).json({ tasks: tasksWithCounts });
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
    req.user.role === "SUPERADMIN" ||
    req.user.role === "ADMIN" ||
    String(task.assignedTo) === String(req.user._id) ||
    String(task.createdBy) === String(req.user._id);

  if (!canComment) {
    throw new AppError("Access denied", StatusCodes.FORBIDDEN);
  }

  // Find all tasks that share the same "template" (common tasks)
  const siblings = await Task.find({
    title: task.title,
    description: task.description,
    businessId: task.businessId,
    sprintId: task.sprintId,
    createdBy: task.createdBy
  });

  // Add comment to all siblings to make it a "common" comment thread
  const commentPromises = siblings.map((sibling) => {
    sibling.comments.push({ userId: req.user._id, message });
    return sibling.save();
  });

  await Promise.all(commentPromises);

  if (["ADMIN", "SUPERADMIN"].includes(req.user.role)) {
    await logActivity({
      userId: req.user._id,
      action: "ADD_COMMENT",
      details: `Added common comment to task series: ${task.title}`,
      metadata: { taskId: task._id, siblingCount: siblings.length },
      ip: req.ip
    });
  }

  const populatedTask = await Task.findById(task._id).populate("comments.userId", "name role");
  res.status(StatusCodes.OK).json({ message: "Comment added successfully to all related tasks", task: populatedTask });
});

const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    throw new AppError("Task not found", StatusCodes.NOT_FOUND);
  }

  if (req.user.role !== "SUPERADMIN" && req.user.role !== "ADMIN" && String(task.createdBy) !== String(req.user._id)) {
    throw new AppError("Access denied", StatusCodes.FORBIDDEN);
  }

  for (const attachment of task.attachments) {
    fs.unlink(`${taskFilesRoot}\\${attachment}`, () => {});
  }

  await Task.findByIdAndDelete(req.params.id);
  await ReportSubmission.deleteMany({ taskId: req.params.id });

  await logActivity({
    userId: req.user._id,
    action: "DELETE_TASK",
    details: `Deleted task: ${task.title}`,
    metadata: { taskId: task._id },
    ip: req.ip
  });

  res.status(StatusCodes.OK).json({ message: "Task deleted successfully" });
});

module.exports = {
  createTask,
  getMyTasks,
  getAllTasks,
  addComment,
  deleteTask
};
