const ActivityLog = require("../models/ActivityLog");

const logActivity = async ({ userId, action, details, metadata = {}, ip = "" }) => {
  try {
    await ActivityLog.create({
      userId,
      action,
      details,
      metadata,
      ip
    });
  } catch (error) {
    console.error("Activity logging failed:", error);
    // We don't throw error here to prevent blocking the main action
  }
};

module.exports = {
  logActivity
};
