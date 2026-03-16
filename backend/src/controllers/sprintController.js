const { StatusCodes } = require("http-status-codes");
const Sprint = require("../models/Sprint");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { logActivity } = require("../services/logService");

const createSprint = asyncHandler(async (req, res) => {
  const { name, startDate, endDate } = req.body;

  if (!name || !startDate || !endDate) {
    throw new AppError("Name, start date, and end date are required", StatusCodes.BAD_REQUEST);
  }

  const sprint = await Sprint.create({
    name,
    startDate,
    endDate,
    createdBy: req.user._id
  });

  await logActivity({
    userId: req.user._id,
    action: "CREATE_SPRINT",
    details: `Created sprint: ${name}`,
    metadata: { sprintId: sprint._id },
    ip: req.ip
  });

  res.status(StatusCodes.CREATED).json({ message: "Sprint created successfully", sprint });
});

const getSprints = asyncHandler(async (_req, res) => {
  const sprints = await Sprint.find().sort({ startDate: -1 }).populate("createdBy", "name email role");
  res.status(StatusCodes.OK).json({ sprints });
});

module.exports = {
  createSprint,
  getSprints
};
