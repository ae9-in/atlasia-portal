const mongoose = require("mongoose");

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
    reportFile: {
      type: String,
      required: true
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
