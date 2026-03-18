const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const User = require("./src/models/User");

dotenv.config();

const createNewAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to database");

    const email = "ujwalr@atlasia.com";
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      console.log(`User ${email} already exists.`);
    } else {
      await User.create({
        name: "Ujwal Admin",
        email: email.toLowerCase(),
        password: "ujwal@123",
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

createNewAdmin();
