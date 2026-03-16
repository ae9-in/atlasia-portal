const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");
const env = require("../config/env");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { normalizeRole } = require("../utils/roles");

const verifyToken = asyncHandler(async (req, _res, next) => {
  const headerToken = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.split(" ")[1]
    : null;
  const token = req.cookies.token || headerToken;

  if (!token) {
    throw new AppError("Authentication required", StatusCodes.UNAUTHORIZED);
  }

  const payload = jwt.verify(token, env.jwtSecret);
  const user = await User.findById(payload.id).select("-password").populate("businessId", "name description");

  if (!user || !user.isActive) {
    throw new AppError("User account is not available", StatusCodes.UNAUTHORIZED);
  }

  user.role = normalizeRole(user.role);
  req.user = user;
  next();
});

const requireRole = (...roles) => (req, _res, next) => {
  const normalizedUserRole = normalizeRole(req.user.role);
  const normalizedAllowedRoles = roles.map(normalizeRole);

  if (!normalizedAllowedRoles.includes(normalizedUserRole)) {
    return next(new AppError("Access denied", StatusCodes.FORBIDDEN));
  }

  req.user.role = normalizedUserRole;
  return next();
};

module.exports = {
  verifyToken,
  requireRole,
  requireSuperadmin: requireRole("SUPERADMIN"),
  requireAdmin: requireRole("ADMIN"),
  requireStudent: requireRole("STUDENT"),
  requireAdminOrSuperadmin: requireRole("ADMIN", "SUPERADMIN")
};
