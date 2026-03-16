const express = require("express");
const {
  createUser,
  getUsers,
  assignStudentBusiness,
  getAdminOverview,
  getSuperadminOverview,
  getActivityLogs
} = require("../controllers/adminController");
const {
  verifyToken,
  requireAdminOrSuperadmin,
  requireSuperadmin
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/users", verifyToken, requireAdminOrSuperadmin, createUser);
router.get("/users", verifyToken, requireAdminOrSuperadmin, getUsers);
router.patch("/users/:id/business", verifyToken, requireAdminOrSuperadmin, assignStudentBusiness);
router.get("/coordinator-overview", verifyToken, requireAdminOrSuperadmin, getAdminOverview);
router.get("/super-overview", verifyToken, requireSuperadmin, getSuperadminOverview);
router.get("/activity-logs", verifyToken, requireSuperadmin, getActivityLogs);

module.exports = router;
