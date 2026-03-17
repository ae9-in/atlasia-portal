const mongoose = require("mongoose");
const dotenv = require("dotenv");
const fs = require("fs");
const User = require("./src/models/User");

dotenv.config();

const verify = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const user = await User.findOne({ email: "yuvan@atlasia.com" });
    if (user) {
      fs.writeFileSync("admin_status.txt", `FOUND: ${user.email} with role ${user.role}`);
    } else {
      fs.writeFileSync("admin_status.txt", "NOT FOUND");
    }
  } catch (err) {
    fs.writeFileSync("admin_status.txt", "ERROR: " + err.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};
verify();
