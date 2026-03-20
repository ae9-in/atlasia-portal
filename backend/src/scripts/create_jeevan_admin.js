const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const User = require("./src/models/User");

dotenv.config();

const createNewAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to database");

    const email = "jeevan@atlasia.com";
    const password = "jeevan@123";
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      console.log(`User ${email} already exists. Updating role and password...`);
      existingUser.role = "ADMIN";
      existingUser.password = password; // The model has a pre-save hook to hash this
      await existingUser.save();
      console.log(`Admin user ${email} updated successfully.`);
    } else {
      await User.create({
        name: "Jeevan Admin",
        email: email.toLowerCase(),
        password: password,
        role: "ADMIN",
        isActive: true
      });
      console.log(`Admin user ${email} created successfully.`);
    }
  } catch (error) {
    console.error("Error creating/updating admin user:", error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

createNewAdmin();
