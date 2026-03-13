const { StatusCodes } = require("http-status-codes");
const User = require("../models/User");
const Business = require("../models/Business");
const Task = require("../models/Task");
const ReportSubmission = require("../models/ReportSubmission");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, businessId = null } = req.body;

  if (!name || !email || !password || !role) {
    throw new AppError("Name, email, password, and role are required", StatusCodes.BAD_REQUEST);
  }

  if (!["SUPER_ADMIN", "COORDINATOR", "STUDENT"].includes(role)) {
    throw new AppError("Invalid role", StatusCodes.BAD_REQUEST);
  }

  if (req.user.role === "COORDINATOR" && role !== "STUDENT") {
    throw new AppError("Coordinators can only create students", StatusCodes.FORBIDDEN);
  }

  if (role === "STUDENT" && !businessId) {
    throw new AppError("Students must be assigned to a business", StatusCodes.BAD_REQUEST);
  }

  const normalizedEmail = email.toLowerCase();
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new AppError("Email is already registered", StatusCodes.CONFLICT);
  }

  const user = await User.create({ name, email: normalizedEmail, password, role, businessId });
  res.status(StatusCodes.CREATED).json({ message: "User created successfully", user });
});

const getUsers = asyncHandler(async (req, res) => {
  const query = {};
  if (req.query.role) {
    query.role = req.query.role;
  }
  const users = await User.find(query).select("-password").populate("businessId", "name description").sort({ createdAt: -1 });
  res.status(StatusCodes.OK).json({ users });
});

const getCoordinatorOverview = asyncHandler(async (req, res) => {
  const [totalStudents, tasksCreated, reportsSubmitted, pendingReports] = await Promise.all([
    User.countDocuments({ role: "STUDENT" }),
    Task.countDocuments({ createdBy: req.user._id }),
    ReportSubmission.countDocuments(),
    Task.countDocuments({ createdBy: req.user._id, status: { $in: ["ASSIGNED", "IN_PROGRESS"] } })
  ]);

  res.status(StatusCodes.OK).json({
    stats: { totalStudents, tasksCreated, reportsSubmitted, pendingReports }
  });
});

const getSuperAdminOverview = asyncHandler(async (_req, res) => {
  const [totalStudents, totalCoordinators, totalBusinesses, totalTasks, totalReports] = await Promise.all([
    User.countDocuments({ role: "STUDENT" }),
    User.countDocuments({ role: "COORDINATOR" }),
    Business.countDocuments(),
    Task.countDocuments(),
    ReportSubmission.countDocuments()
  ]);

  const weeklySubmissions = await Promise.all(
    Array.from({ length: 7 }).map(async (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      const count = await ReportSubmission.countDocuments({ submittedAt: { $gte: start, $lte: end } });
      return { date: start.toISOString().slice(5, 10), count };
    })
  );

  const completionRate = await Promise.all(
    Array.from({ length: 7 }).map(async (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      const created = await Task.countDocuments({ createdAt: { $gte: start, $lte: end } });
      const completed = await Task.countDocuments({ createdAt: { $gte: start, $lte: end }, status: { $in: ["COMPLETED", "REVIEWED"] } });
      return {
        date: start.toISOString().slice(5, 10),
        rate: created ? Math.round((completed / created) * 100) : 0
      };
    })
  );

  res.status(StatusCodes.OK).json({
    stats: { totalStudents, totalCoordinators, totalBusinesses, totalTasks, totalReports },
    weeklySubmissions,
    completionRate
  });
});

module.exports = {
  createUser,
  getUsers,
  getCoordinatorOverview,
  getSuperAdminOverview
};
