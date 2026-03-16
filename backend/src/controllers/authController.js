const { StatusCodes } = require("http-status-codes");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { signToken, buildCookieOptions } = require("../services/tokenService");
const { normalizeRole } = require("../utils/roles");

const sendAuthResponse = (res, user, statusCode) => {
  const normalizedRole = normalizeRole(user.role);
  const token = signToken({ id: user._id, role: normalizedRole });

  res.cookie("token", token, buildCookieOptions());
  res.status(statusCode).json({
    message: "Authentication successful",
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: normalizedRole,
      businessId: user.businessId,
      isActive: user.isActive
    }
  });
};

const register = asyncHandler(async (req, res) => {
  const { name, email, password, role = "STUDENT", businessId = null, college } = req.body;

  if (!name || !email || !password || !college) {
    throw new AppError("Name, email, password, and college are required", StatusCodes.BAD_REQUEST);
  }

  if (normalizeRole(role) !== "STUDENT") {
    throw new AppError("Public registration is restricted to students", StatusCodes.FORBIDDEN);
  }

  const normalizedEmail = email.toLowerCase();
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    throw new AppError("Email is already registered", StatusCodes.CONFLICT);
  }

  const user = await User.create({ name, email: normalizedEmail, password, role: "STUDENT", businessId, college });
  sendAuthResponse(res, user, StatusCodes.CREATED);
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError("Email and password are required", StatusCodes.BAD_REQUEST);
  }

  const normalizedEmail = email.toLowerCase();
  const user = await User.findOne({ email: normalizedEmail }).select("+password");

  if (!user || !(await user.comparePassword(password)) || !user.isActive) {
    throw new AppError("Invalid email or password", StatusCodes.UNAUTHORIZED);
  }

  sendAuthResponse(res, user, StatusCodes.OK);
});

const me = asyncHandler(async (req, res) => {
  res.status(StatusCodes.OK).json({
    user: {
      ...req.user.toObject(),
      role: normalizeRole(req.user.role)
    },
    appName: "Atlasia Workbook"
  });
});

const logout = asyncHandler(async (_req, res) => {
  res.clearCookie("token", buildCookieOptions());
  res.status(StatusCodes.OK).json({ message: "Logged out" });
});

module.exports = {
  register,
  login,
  me,
  logout
};
