const express = require("express");
const {
  createTask,
  getMyTasks,
  getAllTasks,
  addComment,
  deleteTask
} = require("../controllers/taskController");
const {
  verifyToken,
  requireCoordinatorOrSuperAdmin
} = require("../middleware/authMiddleware");
const { attachmentUpload } = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post(
  "/create",
  verifyToken,
  requireCoordinatorOrSuperAdmin,
  attachmentUpload.array("attachments", 5),
  createTask
);
router.get("/my-tasks", verifyToken, getMyTasks);
router.get("/all", verifyToken, getAllTasks);
router.post("/comment", verifyToken, addComment);
router.delete("/:id", verifyToken, requireCoordinatorOrSuperAdmin, deleteTask);

module.exports = router;
