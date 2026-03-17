const mongoose = require("mongoose");
const connectDatabase = require("../config/db");
const User = require("../models/User");
const Task = require("../models/Task");
const ReportSubmission = require("../models/ReportSubmission");
const Report = require("../models/Report");
const ActivityLog = require("../models/ActivityLog");

const removeAllStudents = async () => {
  try {
    await connectDatabase();
    console.log("Connected to MongoDB.");

    // Find all students
    const students = await User.find({ role: "STUDENT" });

    if (students.length === 0) {
      console.log("No students found to delete.");
      process.exit(0);
    }

    const studentIds = students.map(s => s._id);
    console.log(`Found ${studentIds.length} students. Starting cleanup...`);

    // Delete associated items
    const delTasks = await Task.deleteMany({ assignedTo: { $in: studentIds } });
    console.log(`Deleted ${delTasks.deletedCount} tasks.`);

    const delSubs = await ReportSubmission.deleteMany({ studentId: { $in: studentIds } });
    console.log(`Deleted ${delSubs.deletedCount} report submissions.`);

    const delReports = await Report.deleteMany({ studentId: { $in: studentIds } });
    console.log(`Deleted ${delReports.deletedCount} reports.`);

    const delLogs = await ActivityLog.deleteMany({ userId: { $in: studentIds } });
    console.log(`Deleted ${delLogs.deletedCount} activity logs.`);

    // Delete users
    const delStudents = await User.deleteMany({ _id: { $in: studentIds } });
    console.log(`Successfully deleted ${delStudents.deletedCount} students.`);

    console.log("Cleanup complete.");
    process.exit(0);
  } catch (error) {
    console.error("Error removing all students:", error);
    process.exit(1);
  }
};

removeAllStudents();
