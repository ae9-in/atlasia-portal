const fs = require("fs");
const { StatusCodes } = require("http-status-codes");
const Business = require("../models/Business");
const User = require("../models/User");
const Task = require("../models/Task");
const ReportSubmission = require("../models/ReportSubmission");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { taskFilesRoot } = require("../utils/paths");
const { logActivity } = require("../services/logService");

const createBusiness = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name || !description) {
    throw new AppError("Name and description are required", StatusCodes.BAD_REQUEST);
  }

  const business = await Business.create({ name, description });

  await logActivity({
    userId: req.user._id,
    action: "CREATE_BUSINESS",
    details: `Created business: ${name}`,
    metadata: { businessId: business._id },
    ip: req.ip
  });

  res.status(StatusCodes.CREATED).json({ message: "Business created successfully", business });
});

const getBusinesses = asyncHandler(async (_req, res) => {
  const businesses = await Business.find().sort({ createdAt: -1 });
  res.status(StatusCodes.OK).json({ businesses });
});

const deleteBusiness = asyncHandler(async (req, res) => {
  const business = await Business.findById(req.params.id);

  if (!business) {
    throw new AppError("Business not found", StatusCodes.NOT_FOUND);
  }

  // Unassign students linked to this business
  await User.updateMany(
    { businessId: business._id, role: "STUDENT" },
    { $unset: { businessId: 1 } }
  );

  // Find all tasks related to the business and delete them along with their attachments and submissions
  const tasks = await Task.find({ businessId: business._id });
  for (const task of tasks) {
    for (const attachment of task.attachments || []) {
      fs.unlink(`${taskFilesRoot}\\${attachment}`, () => {});
    }
    await ReportSubmission.deleteMany({ taskId: task._id });
    await Task.findByIdAndDelete(task._id);
  }

  // Delete the business itself
  await Business.findByIdAndDelete(req.params.id);

  await logActivity({
    userId: req.user._id,
    action: "DELETE_BUSINESS",
    details: `Deleted business: ${business.name}`,
    metadata: { businessId: business._id },
    ip: req.ip
  });

  res.status(StatusCodes.OK).json({ message: "Business deleted successfully" });
});

module.exports = {
  createBusiness,
  getBusinesses,
  deleteBusiness
};
