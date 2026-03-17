const mongoose = require("mongoose");
const connectDatabase = require("./src/config/db");
const User = require("./src/models/User");

async function check() {
  await connectDatabase();
  const students = await User.find({ role: "STUDENT" }).select("name email");
  console.log(`STU_COUNT:${students.length}`);
  students.forEach(s => console.log(`STU_NAME:${s.name}`));
  process.exit(0);
}
check();
