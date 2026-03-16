const mongoose = require("mongoose");
const connectDatabase = require("./src/config/db");
const User = require("./src/models/User");
const Task = require("./src/models/Task");
const ReportSubmission = require("./src/models/ReportSubmission");
const fs = require("fs");

const removeRecentStudents = async () => {
  try {
    await connectDatabase();
    const students = await User.find({ role: "STUDENT" }).sort({ createdAt: -1 }).limit(5);

    if (students.length === 0) {
      console.log("No students found.");
      process.exit(0);
    }

    const studentIds = students.map(s => s._id);
    const delInfo = students.map(s => ({ name: s.name, email: s.email }));
    
    await Task.deleteMany({ assignedTo: { $in: studentIds } });
    await ReportSubmission.deleteMany({ userId: { $in: studentIds } });
    await User.deleteMany({ _id: { $in: studentIds } });

    fs.writeFileSync("removed.json", JSON.stringify(delInfo, null, 2));
    console.log("Deleted 5 students.");
    process.exit(0);
  } catch (error) {
    fs.writeFileSync("error_r.log", error.stack);
    process.exit(1);
  }
};

removeRecentStudents();
