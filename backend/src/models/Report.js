const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    reportFile: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ["submitted", "reviewed"],
      default: "submitted"
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

reportSchema.index({ studentId: 1, date: 1 }, { unique: true });
reportSchema.index({ date: -1 });

module.exports = mongoose.model("Report", reportSchema);
