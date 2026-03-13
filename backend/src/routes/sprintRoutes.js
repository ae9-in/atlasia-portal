const express = require("express");
const { createSprint, getSprints } = require("../controllers/sprintController");
const { verifyToken, requireCoordinatorOrSuperAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/create", verifyToken, requireCoordinatorOrSuperAdmin, createSprint);
router.get("/all", verifyToken, getSprints);

module.exports = router;
