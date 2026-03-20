const mongoose = require("mongoose");
const dotenv = require("dotenv");
const fs = require("fs");
const User = require("./src/models/User");

dotenv.config();

const log = (msg) => {
  console.log(msg);
  fs.appendFileSync("jeevan_admin_log.txt", msg + "\n");
};

if (fs.existsSync("jeevan_admin_log.txt")) {
  fs.unlinkSync("jeevan_admin_log.txt");
}

const createNewAdmin = async () => {
  try {
    log("Checking URI...");
    if (!process.env.MONGODB_URI) {
      log("MONGODB_URI is not defined in .env file");
      process.exit(1);
    }

    log("Connecting to database...");
    await mongoose.connect(process.env.MONGODB_URI);
    log("Connected to database");

    const email = "jeevan@atlasia.com";
    const password = "jeevan@123";
    const name = "Jeevan Admin";
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      log(`User ${email} already exists. Updating role and password...`);
      existingUser.role = "ADMIN";
      existingUser.password = password;
      await existingUser.save();
      log(`Admin user ${email} updated successfully.`);
    } else {
      await User.create({
        name: name,
        email: email.toLowerCase(),
        password: password,
        role: "ADMIN",
        isActive: true
      });
      log(`Admin user ${email} created successfully.`);
    }
  } catch (error) {
    log("Error: " + error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

createNewAdmin();
