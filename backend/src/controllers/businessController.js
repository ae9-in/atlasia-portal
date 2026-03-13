const { StatusCodes } = require("http-status-codes");
const Business = require("../models/Business");
const User = require("../models/User");
const Task = require("../models/Task");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

const createBusiness = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name || !description) {
    throw new AppError("Name and description are required", StatusCodes.BAD_REQUEST);
  }

  const business = await Business.create({ name, description });
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

  const [studentsUsingBusiness, tasksUsingBusiness] = await Promise.all([
    User.countDocuments({ businessId: business._id, role: "STUDENT", isActive: true }),
    Task.countDocuments({ businessId: business._id })
  ]);

  if (studentsUsingBusiness > 0 || tasksUsingBusiness > 0) {
    const reasons = [];

    if (studentsUsingBusiness > 0) {
      reasons.push(`${studentsUsingBusiness} active student${studentsUsingBusiness === 1 ? "" : "s"}`);
    }

    if (tasksUsingBusiness > 0) {
      reasons.push(`${tasksUsingBusiness} task${tasksUsingBusiness === 1 ? "" : "s"}`);
    }

    throw new AppError(
      `Cannot delete this business because it is still linked to ${reasons.join(" and ")}`,
      StatusCodes.CONFLICT
    );
  }

  await Business.findByIdAndDelete(req.params.id);

  res.status(StatusCodes.OK).json({ message: "Business deleted successfully" });
});

module.exports = {
  createBusiness,
  getBusinesses,
  deleteBusiness
};
