const path = require("path");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");
const env = require("../config/env");

// Cloudinary migration — 2026-03-17

// Configuration for student report uploads to Cloudinary
const reportStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "atlasia-reports",
    // allowed_formats is removed because resource_type: "raw" handles all extensions
    resource_type: "raw", 
    public_id: (req, file) => {
      const sanitizedName = file.originalname.replace(/\s+/g, "_");
      return `${Date.now()}_${sanitizedName}`;
    }
  }
});

const reportUpload = multer({
  storage: reportStorage,
  limits: { fileSize: 50 * 1024 * 1024 } // Increased to 50MB for cloud storage
});

// We keep the old taskFilesRoot logic for internal/admin task attachments if still needed, 
// or you can migrate these to Cloudinary later as well.
const { taskFilesRoot } = require("../utils/paths");
const fs = require("fs");
if (!fs.existsSync(taskFilesRoot)) {
  fs.mkdirSync(taskFilesRoot, { recursive: true });
}

const taskStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, taskFilesRoot),
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname.replace(/\s+/g, "_")}`);
  }
});

const attachmentUpload = multer({
  storage: taskStorage,
  limits: { fileSize: env.maxFileSizeMb * 1024 * 1024 }
});

module.exports = {
  attachmentUpload,
  reportUpload
};
