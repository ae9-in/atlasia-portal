const express = require("express");
const { createSprint, getSprints } = require("../controllers/sprintController");
const { verifyToken, requireAdminOrSuperadmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/create", verifyToken, requireAdminOrSuperadmin, createSprint);
router.get("/all", verifyToken, getSprints);

module.exports = router;
