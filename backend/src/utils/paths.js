const path = require("path");

const projectRoot = path.resolve(__dirname, "..", "..", "..");
const uploadsRoot = path.join(projectRoot, "uploads");
const taskFilesRoot = path.join(uploadsRoot, "task-files");
const reportFilesRoot = path.join(uploadsRoot, "report-files");

module.exports = {
  projectRoot,
  uploadsRoot,
  taskFilesRoot,
  reportFilesRoot
};
