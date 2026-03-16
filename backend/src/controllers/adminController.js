const { StatusCodes } = require("http-status-codes");
const User = require("../models/User");
const Business = require("../models/Business");
const Task = require("../models/Task");
const ReportSubmission = require("../models/ReportSubmission");
const ActivityLog = require("../models/ActivityLog");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { logActivity } = require("../services/logService");

const validateBusiness = async (businessId) => {
  if (!businessId) {
    return null;
  }

  const business = await Business.findById(businessId);
  if (!business) {
    throw new AppError("Business not found", StatusCodes.NOT_FOUND);
  }

  return business;
};

const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, college, businessId = null } = req.body;

  if (!name || !email || !password || !role) {
    throw new AppError("Name, email, password, and role are required", StatusCodes.BAD_REQUEST);
  }

  if (!["SUPERADMIN", "ADMIN", "STUDENT"].includes(role)) {
    throw new AppError("Invalid role", StatusCodes.BAD_REQUEST);
  }

  if (req.user.role !== "SUPERADMIN") {
    throw new AppError("Only superadmins can create users", StatusCodes.FORBIDDEN);
  }

  if (role === "STUDENT" && !businessId) {
    throw new AppError("Students must be assigned to a business", StatusCodes.BAD_REQUEST);
  }

  await validateBusiness(role === "STUDENT" ? businessId : null);

  const normalizedEmail = email.toLowerCase();
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new AppError("Email is already registered", StatusCodes.CONFLICT);
  }

  const user = await User.create({ name, email: normalizedEmail, password, role, college, businessId });
  
  await logActivity({
    userId: req.user._id,
    action: "CREATE_USER",
    details: `Created user ${name} with role ${role}`,
    metadata: { createdUserId: user._id, role },
    ip: req.ip
  });

  res.status(StatusCodes.CREATED).json({ message: "User created successfully", user });
});

const getUsers = asyncHandler(async (req, res) => {
  const query = {};
  if (req.user.role === "ADMIN") {
    query.role = "STUDENT";
  } else if (req.query.role) {
    query.role = req.query.role;
  }

  const users = await User.find(query).select("-password").populate("businessId", "name description").sort({ createdAt: -1 });
  res.status(StatusCodes.OK).json({ users });
});

const assignStudentBusiness = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { businessId } = req.body;

  if (!businessId) {
    throw new AppError("Business is required", StatusCodes.BAD_REQUEST);
  }

  await validateBusiness(businessId);

  const student = await User.findOne({ _id: id, role: "STUDENT" });
  if (!student) {
    throw new AppError("Student not found", StatusCodes.NOT_FOUND);
  }

  student.businessId = businessId;
  await student.save();

  const updatedStudent = await User.findById(student._id).select("-password").populate("businessId", "name description");
  
  await logActivity({
    userId: req.user._id,
    action: "ASSIGN_BUSINESS",
    details: `Assigned student ${student.name} to business ${updatedStudent.businessId?.name}`,
    metadata: { studentId: student._id, businessId: updatedStudent.businessId?._id },
    ip: req.ip
  });

  res.status(StatusCodes.OK).json({ message: "Student business assigned", user: updatedStudent });
});

const getAdminOverview = asyncHandler(async (req, res) => {
  const [totalStudents, tasksCreated, reportsSubmitted, pendingReports] = await Promise.all([
    User.countDocuments({ role: "STUDENT" }),
    Task.countDocuments({}),
    ReportSubmission.countDocuments(),
    Task.countDocuments({ status: { $in: ["ASSIGNED", "IN_PROGRESS"] } })
  ]);

  res.status(StatusCodes.OK).json({
    stats: { totalStudents, tasksCreated, reportsSubmitted, pendingReports }
  });
});

const getSuperadminOverview = asyncHandler(async (_req, res) => {
  const [totalStudents, totalAdmins, totalBusinesses, totalTasks, totalReports] = await Promise.all([
    User.countDocuments({ role: "STUDENT" }),
    User.countDocuments({ role: "ADMIN" }),
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
    stats: { totalStudents, totalAdmins, totalBusinesses, totalTasks, totalReports },
    weeklySubmissions,
    completionRate
  });
});

const getActivityLogs = asyncHandler(async (req, res) => {
  const logs = await ActivityLog.find()
    .populate("userId", "name email role")
    .sort({ createdAt: -1 })
    .limit(200);

  res.status(StatusCodes.OK).json({ logs });
});

module.exports = {
  createUser,
  getUsers,
  assignStudentBusiness,
  getAdminOverview,
  getSuperadminOverview,
  getActivityLogs
};
