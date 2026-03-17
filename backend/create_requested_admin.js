const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");
const User = require("./src/models/User");

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to database");

    const email = "yuvan@atlasia.com";
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      console.log(`User ${email} already exists.`);
    } else {
      await User.create({
        name: "Yuvan Admin",
        email: email.toLowerCase(),
        password: "yuvan@123",
        role: "ADMIN",
        isActive: true
      });
      console.log(`Admin user ${email} created successfully.`);
    }
  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

createAdmin();
