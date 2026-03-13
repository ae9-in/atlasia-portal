const connectDatabase = require("../config/db");
const User = require("../models/User");

const superAdmins = [
  { name: "Atlasia Super Admin 01", email: "superadmin01@atlasia.local", password: "AtlasiaSuper01!", role: "SUPER_ADMIN" },
  { name: "Atlasia Super Admin 02", email: "superadmin02@atlasia.local", password: "AtlasiaSuper02!", role: "SUPER_ADMIN" }
];

const coordinators = [
  { name: "Atlasia Coordinator 01", email: "coord01@atlasia.local", password: "AtlasiaCoord01!", role: "COORDINATOR" },
  { name: "Atlasia Coordinator 02", email: "coord02@atlasia.local", password: "AtlasiaCoord02!", role: "COORDINATOR" },
  { name: "Atlasia Coordinator 03", email: "coord03@atlasia.local", password: "AtlasiaCoord03!", role: "COORDINATOR" },
  { name: "Atlasia Coordinator 04", email: "coord04@atlasia.local", password: "AtlasiaCoord04!", role: "COORDINATOR" },
  { name: "Atlasia Coordinator 05", email: "coord05@atlasia.local", password: "AtlasiaCoord05!", role: "COORDINATOR" },
  { name: "Atlasia Coordinator 06", email: "coord06@atlasia.local", password: "AtlasiaCoord06!", role: "COORDINATOR" },
  { name: "Atlasia Coordinator 07", email: "coord07@atlasia.local", password: "AtlasiaCoord07!", role: "COORDINATOR" },
  { name: "Atlasia Coordinator 08", email: "coord08@atlasia.local", password: "AtlasiaCoord08!", role: "COORDINATOR" },
  { name: "Atlasia Coordinator 09", email: "coord09@atlasia.local", password: "AtlasiaCoord09!", role: "COORDINATOR" },
  { name: "Atlasia Coordinator 10", email: "coord10@atlasia.local", password: "AtlasiaCoord10!", role: "COORDINATOR" }
];

const desiredUsers = [...superAdmins, ...coordinators];
const desiredEmails = desiredUsers.map((account) => account.email.toLowerCase());

const resetPlatformUsers = async () => {
  await connectDatabase();

  const deleteResult = await User.deleteMany({
    $or: [
      { role: "admin" },
      { role: { $in: ["SUPER_ADMIN", "COORDINATOR"] }, email: { $nin: desiredEmails } }
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

  const [superAdminCount, coordinatorCount] = await Promise.all([
    User.countDocuments({ role: "SUPER_ADMIN" }),
    User.countDocuments({ role: "COORDINATOR" })
  ]);

  console.log(`Removed ${deleteResult.deletedCount} old admin/coordinator accounts.`);
  console.log(`Platform users ready: ${superAdminCount} super admins, ${coordinatorCount} coordinators.`);
  process.exit(0);
};

resetPlatformUsers().catch((error) => {
  console.error("Failed to reset Atlasia platform users", error);
  process.exit(1);
});
