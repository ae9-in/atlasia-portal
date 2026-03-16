const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { StatusCodes } = require("http-status-codes");
const env = require("../config/env");
const AppError = require("../utils/AppError");
const { taskFilesRoot, reportFilesRoot } = require("../utils/paths");

fs.mkdirSync(taskFilesRoot, { recursive: true });
fs.mkdirSync(reportFilesRoot, { recursive: true });

const createStorage = (destinationDir, filenameBuilder) =>
  multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, destinationDir),
    filename: filenameBuilder
  });

const attachmentUpload = multer({
  storage: createStorage(taskFilesRoot, (_req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname.replace(/\s+/g, "_")}`);
  }),
  limits: { fileSize: env.maxFileSizeMb * 1024 * 1024 }
});

const reportUpload = multer({
  storage: createStorage(reportFilesRoot, (req, file, cb) => {
    const today = new Date().toISOString().slice(0, 10);
    cb(
      null,
      `${req.params.taskId || req.body.taskId}_${req.user._id}_${today}${path.extname(file.originalname).toLowerCase()}`
    );
  }),
  limits: { fileSize: 25 * 1024 * 1024 }
});

module.exports = {
  attachmentUpload,
  reportUpload
};
