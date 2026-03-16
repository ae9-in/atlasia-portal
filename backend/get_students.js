const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

async function run() {
  try {
    const backendDir = 'w:/V S Code files/project-student-dtr/backend';
    require(path.join(backendDir, 'src/models/User'));
    const User = mongoose.model('User');

    await mongoose.connect(process.env.MONGODB_URI);
    const students = await User.find({ role: 'STUDENT' }).sort({ createdAt: -1 });
    
    fs.writeFileSync(path.join(backendDir, 'students_list.json'), JSON.stringify(students, null, 2));
    process.exit(0);
  } catch (err) {
    fs.writeFileSync('error.log', err.stack);
    process.exit(1);
  }
}

run();
