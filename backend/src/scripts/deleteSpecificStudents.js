const mongoose = require("mongoose");
const connectDatabase = require("../config/db");
const User = require("../models/User");
const Task = require("../models/Task");
const ReportSubmission = require("../models/ReportSubmission");
const Report = require("../models/Report");
const ActivityLog = require("../models/ActivityLog");
const fs = require("fs");

const studentNamesToDelete = [
  "Divya Sudeer Gaonkar",
  "Chudasama jenish",
  "Shanmuka Skanda A",
  "Bhoomika R",
  "Jananya M S",
  "Test Student 02",
  "TESTUSER005"
];

const deleteSpecificStudents = async () => {
  try {
    await connectDatabase();
    console.log("Connected to MongoDB.");

    // Find students by name
    const students = await User.find({ 
      name: { $in: studentNamesToDelete },
      role: "STUDENT" 
    });

    if (students.length === 0) {
      console.log("No matching students found to delete.");
      process.exit(0);
    }

    const studentIds = students.map(s => s._id);
    const foundNames = students.map(s => s.name);
    
    console.log(`Found ${students.length} students to delete: ${foundNames.join(", ")}`);
    console.log("Starting cleanup of associated data...");

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
    console.log(`Successfully deleted ${delStudents.deletedCount} student records.`);

    fs.writeFileSync("deletion_success.txt", `Successfully deleted ${delStudents.deletedCount} students at ${new Date().toISOString()}`);

    console.log("Cleanup complete.");
    process.exit(0);
  } catch (error) {
    console.error("Error during deletion:", error);
    process.exit(1);
  }
};

deleteSpecificStudents();
