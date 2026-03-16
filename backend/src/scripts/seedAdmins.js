const connectDatabase = require("../config/db");
const User = require("../models/User");

const superAdmins = [
  { name: "Atlasia Superadmin 01", email: "superadmin01@atlasia.local", password: "AtlasiaSuper01!", role: "SUPERADMIN" },
  { name: "Atlasia Superadmin 02", email: "superadmin02@atlasia.local", password: "AtlasiaSuper02!", role: "SUPERADMIN" }
];

const admins = [
  { name: "Suhas Krishna", email: "suhaskrishna@atlasia.com", password: "suhas@123", role: "ADMIN" },
  { name: "Pramukh", email: "pramukh@atlasia.com", password: "pramukh@123", role: "ADMIN" },
  { name: "Rahul Vaishnav", email: "rahulvaishnav@atlasia.com", password: "rahul@123", role: "ADMIN" },
  { name: "Vishnu", email: "vishnu@atlasia.com", password: "vishnu@123", role: "ADMIN" },
  { name: "Yogesh", email: "yogesh@atlasia.com", password: "yogesh@123", role: "ADMIN" },
  { name: "Vedanth", email: "vedanth@atlasia.com", password: "vedanth@123", role: "ADMIN" },
  { name: "Tanvi", email: "tanvi@atlasia.com", password: "tanvi@123", role: "ADMIN" },
  { name: "Test Admin", email: "testadmin@atlasia.com", password: "test@123", role: "ADMIN" }
];

const desiredUsers = [...superAdmins, ...admins];
const desiredEmails = desiredUsers.map((account) => account.email.toLowerCase());

const resetPlatformUsers = async () => {
  await connectDatabase();

  const deleteResult = await User.deleteMany({
    $or: [
      { role: "admin" },
      { role: { $in: ["SUPERADMIN", "ADMIN"] }, email: { $nin: desiredEmails } }
    ]
  });

  for (const account of desiredUsers) {
    const normalizedEmail = account.email.toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });

    if (existing) {
      existing.name = account.name;
      existing.role = account.role;
      existing.isActive = true;
      existing.password = account.password;
      existing.businessId = null;
      await existing.save();
      continue;
    }

    await User.create({
      name: account.name,
      email: normalizedEmail,
      password: account.password,
      role: account.role,
      isActive: true,
      businessId: null
    });
  }

  const [superadminCount, adminCount] = await Promise.all([
    User.countDocuments({ role: "SUPERADMIN" }),
    User.countDocuments({ role: "ADMIN" })
  ]);

  console.log(`Removed ${deleteResult.deletedCount} old admin accounts.`);
  console.log(`Platform users ready: ${superadminCount} superadmins, ${adminCount} admins.`);
  process.exit(0);
};

resetPlatformUsers().catch((error) => {
  console.error("Failed to reset Atlasia platform users", error);
  process.exit(1);
});
