const mongoose = require("mongoose");
const connectDatabase = require("./src/config/db");
const User = require("./src/models/User");
const fs = require("fs");

async function check() {
  try {
    console.log("Connecting...");
    await connectDatabase();
    console.log("Connected.");
    const students = await User.find({ role: "STUDENT" }).select("name email");
    const output = {
      count: students.length,
      students: students.map(s => ({ name: s.name, email: s.email }))
    };
    fs.writeFileSync("final_check.json", JSON.stringify(output, null, 2));
    console.log("Check complete. File written.");
    process.exit(0);
  } catch (err) {
    fs.writeFileSync("final_check_error.txt", err.stack);
    process.exit(1);
  }
}
check();
