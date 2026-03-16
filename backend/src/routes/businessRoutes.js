const express = require("express");
const { createBusiness, getBusinesses, deleteBusiness } = require("../controllers/businessController");
const { verifyToken, requireAdminOrSuperadmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/create", verifyToken, requireAdminOrSuperadmin, createBusiness);
router.get("/all", verifyToken, getBusinesses);
router.delete("/:id", verifyToken, requireAdminOrSuperadmin, deleteBusiness);

module.exports = router;
