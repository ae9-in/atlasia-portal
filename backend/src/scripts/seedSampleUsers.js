const connectDatabase = require("../config/db");
const Business = require("../models/Business");
const User = require("../models/User");

const sampleBusinesses = [
  { name: "Atlasia Health", description: "Healthcare initiatives and delivery tasks." },
  { name: "Atlasia Education", description: "Learning programs and workbook execution." },
  { name: "Atlasia Fitness", description: "Fitness and engagement task cycles." }
];

const sampleStudents = [
  { name: "Student 01", email: "student01@atlasia.local", password: "Student01!Atlasia", businessName: "Atlasia Health" },
  { name: "Student 02", email: "student02@atlasia.local", password: "Student02!Atlasia", businessName: "Atlasia Health" },
  { name: "Student 03", email: "student03@atlasia.local", password: "Student03!Atlasia", businessName: "Atlasia Health" },
  { name: "Student 04", email: "student04@atlasia.local", password: "Student04!Atlasia", businessName: "Atlasia Education" },
  { name: "Student 05", email: "student05@atlasia.local", password: "Student05!Atlasia", businessName: "Atlasia Education" },
  { name: "Student 06", email: "student06@atlasia.local", password: "Student06!Atlasia", businessName: "Atlasia Education" },
  { name: "Student 07", email: "student07@atlasia.local", password: "Student07!Atlasia", businessName: "Atlasia Fitness" },
  { name: "Student 08", email: "student08@atlasia.local", password: "Student08!Atlasia", businessName: "Atlasia Fitness" },
  { name: "Student 09", email: "student09@atlasia.local", password: "Student09!Atlasia", businessName: "Atlasia Fitness" },
  { name: "Student 10", email: "student10@atlasia.local", password: "Student10!Atlasia", businessName: "Atlasia Health" }
];

const ensureBusinesses = async () => {
  const businessMap = new Map();

  for (const business of sampleBusinesses) {
    const existing = await Business.findOne({ name: business.name });

    if (existing) {
      existing.description = business.description;
      await existing.save();
      businessMap.set(business.name, existing);
      continue;
    }

    const created = await Business.create(business);
    businessMap.set(business.name, created);
  }

  return businessMap;
};

const seedSampleStudents = async () => {
  await connectDatabase();
  const businessMap = await ensureBusinesses();

  for (const student of sampleStudents) {
    const existing = await User.findOne({ email: student.email.toLowerCase() });
    const business = businessMap.get(student.businessName);

    if (existing) {
      existing.name = student.name;
      existing.role = "STUDENT";
      existing.isActive = true;
      existing.password = student.password;
      existing.businessId = business._id;
      await existing.save();
      continue;
    }

    await User.create({
      name: student.name,
      email: student.email.toLowerCase(),
      password: student.password,
      role: "STUDENT",
      businessId: business._id,
      isActive: true
    });
  }

  console.log("Seeded 10 sample student users.");
  process.exit(0);
};

seedSampleStudents().catch((error) => {
  console.error("Failed to seed sample students", error);
  process.exit(1);
});
