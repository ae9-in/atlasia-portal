const mongoose = require("mongoose");

const dailyReportSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    reportDate: {
      type: Date,
      required: true
    },
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
    status: {
      type: String,
      enum: ["SUBMITTED", "REVIEWED", "RESUBMIT_REQUESTED"],
      default: "SUBMITTED"
    },
    adminNote: {
      type: String,
      optional: true
    },
    submittedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Enforce one report per student per day
dailyReportSchema.index({ studentId: 1, reportDate: 1 }, { unique: true });

/**
 * Helper to get the UTC midnight equivalent of today's IST date (UTC+5:30)
 * This ensures consistency regardless of server location.
 */
dailyReportSchema.statics.getTodayDateIST = function() {
  const now = new Date();
  // IST is UTC + 5.5 hours
  const offset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(now.getTime() + offset);
  
  const year = istDate.getUTCFullYear();
  const month = istDate.getUTCMonth();
  const date = istDate.getUTCDate();
  
  // Create a UTC date at midnight for that IST day
  return new Date(Date.UTC(year, month, date, 0, 0, 0, 0));
};

module.exports = mongoose.model("DailyReport", dailyReportSchema);
