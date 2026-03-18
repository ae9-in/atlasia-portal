const mongoose = require("mongoose");

/**
 * Migration Note (2026-03-17):
 * We have shifted from local disk storage to Cloudinary.
 * The 'reportFile' field is kept for backward compatibility with older local files,
 * while 'cloudinaryUrl' and 'cloudinaryPublicId' are the new standard.
 */

const reportSubmissionSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true
    },
    // Old local filename (kept for legacy support)
    reportFile: {
      type: String,
      required: false 
    },
    // New Cloudinary Fields
    cloudinaryUrl: { 
      type: String, 
      required: true 
    },
    cloudinaryPublicId: { 
      type: String, 
      required: true 
    },
    originalFileName: { 
      type: String 
    },
    fileFormat: { 
      type: String 
    },
    fileSize: { 
      type: Number 
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ["SUBMITTED", "REVIEWED", "RESUBMIT_REQUESTED"],
      default: "SUBMITTED"
    }
  },
  { timestamps: true }
);

reportSubmissionSchema.index({ studentId: 1, taskId: 1 });
reportSubmissionSchema.index({ taskId: 1, submittedAt: -1 });

module.exports = mongoose.model("ReportSubmission", reportSubmissionSchema);
