const express = require("express");
const {
  createUser,
  getUsers,
  assignStudentBusiness,
  getCoordinatorOverview,
  getSuperAdminOverview
} = require("../controllers/adminController");
const {
  verifyToken,
  requireCoordinatorOrSuperAdmin,
  requireSuperAdmin
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/users", verifyToken, requireCoordinatorOrSuperAdmin, createUser);
router.get("/users", verifyToken, requireCoordinatorOrSuperAdmin, getUsers);
router.patch("/users/:id/business", verifyToken, requireCoordinatorOrSuperAdmin, assignStudentBusiness);
router.get("/coordinator-overview", verifyToken, requireCoordinatorOrSuperAdmin, getCoordinatorOverview);
router.get("/super-overview", verifyToken, requireSuperAdmin, getSuperAdminOverview);

module.exports = router;
