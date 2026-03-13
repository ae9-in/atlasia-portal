const User = require("../models/User");
const Business = require("../models/Business");
const Sprint = require("../models/Sprint");
const Task = require("../models/Task");
const ReportSubmission = require("../models/ReportSubmission");

const initializeDatabase = async () => {
  await Promise.all([
    User.syncIndexes(),
    Business.syncIndexes(),
    Sprint.syncIndexes(),
    Task.syncIndexes(),
    ReportSubmission.syncIndexes()
  ]);
};

module.exports = {
  initializeDatabase
};
