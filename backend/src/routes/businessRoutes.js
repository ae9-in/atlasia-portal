const express = require("express");
const { createBusiness, getBusinesses, deleteBusiness } = require("../controllers/businessController");
const { verifyToken, requireCoordinatorOrSuperAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/create", verifyToken, requireCoordinatorOrSuperAdmin, createBusiness);
router.get("/all", verifyToken, getBusinesses);
router.delete("/:id", verifyToken, requireCoordinatorOrSuperAdmin, deleteBusiness);

module.exports = router;
