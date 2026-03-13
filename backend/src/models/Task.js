const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: true }
);

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000
    },
    expectedOutcome: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    },
    daysRequired: {
      type: Number,
      required: true,
      min: 1,
      max: 365
    },
    deadlineDate: {
      type: Date,
      required: true
    },
    attachments: {
      type: [String],
      default: []
    },
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true
    },
    sprintId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sprint",
      required: true
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    comments: {
      type: [commentSchema],
      default: []
    },
    status: {
      type: String,
      enum: ["ASSIGNED", "IN_PROGRESS", "SUBMITTED", "COMPLETED", "REVIEWED"],
      default: "ASSIGNED"
    }
  },
  { timestamps: true }
);

taskSchema.index({ assignedTo: 1, deadlineDate: 1, status: 1 });
taskSchema.index({ businessId: 1, sprintId: 1 });

module.exports = mongoose.model("Task", taskSchema);
