const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    action: {
      type: String,
      required: true
    },
    details: {
      type: String,
      required: true
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    ip: {
      type: String
    }
  },
  { timestamps: true }
);

activityLogSchema.index({ userId: 1, action: 1, createdAt: -1 });

module.exports = mongoose.model("ActivityLog", activityLogSchema);
