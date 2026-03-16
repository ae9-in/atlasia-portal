const mongoose = require("mongoose");
const connectDatabase = require("../config/db");
const User = require("../models/User");
const Task = require("../models/Task");
const Report = require("../models/Report");
const ReportSubmission = require("../models/ReportSubmission");
const fs = require("fs");
const path = require("path");

const removeRecentStudents = async () => {
  try {
    await connectDatabase();
    console.log("Connected to MongoDB.");

    // Find 5 most recent students
    const students = await User.find({ role: "STUDENT" })
      .sort({ createdAt: -1 })
      .limit(5);

    if (students.length === 0) {
      console.log("No students found to delete.");
      process.exit(0);
    }

    const studentIds = students.map(s => s._id);
    const studentInfo = students.map(s => ({ name: s.name, email: s.email, id: s._id }));

    console.log("Preparing to delete the following students:", JSON.stringify(studentInfo, null, 2));
    
    // Log to a file for confirmation
    fs.writeFileSync("deleted_students_info.json", JSON.stringify(studentInfo, null, 2));

    // Delete related entities first
    const delTasks = await Task.deleteMany({ assignedTo: { $in: studentIds } });
    console.log(`Deleted ${delTasks.deletedCount} tasks assigned to these students.`);

    // Note: User.js doesn't show a Report model, but removeDummyStudents.js referenced it. 
    // I'll keep it just in case it exists in the filesystem but I haven't seen it.
    try {
      const delReports = await Report.deleteMany({ userId: { $in: studentIds } });
      console.log(`Deleted ${delReports.deletedCount} reports.`);
    } catch (e) {
      console.log("Report model not found or error deleting reports:", e.message);
    }

    const delSubs = await ReportSubmission.deleteMany({ userId: { $in: studentIds } });
    console.log(`Deleted ${delSubs.deletedCount} report submissions.`);

    // Delete the users
    const delStudents = await User.deleteMany({ _id: { $in: studentIds } });
    console.log(`Deleted ${delStudents.deletedCount} students.`);

    console.log("Done.");
    process.exit(0);
  } catch (error) {
    console.error("Error removing students:", error);
    process.exit(1);
  }
};

removeRecentStudents();
