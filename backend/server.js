const http = require("http");
const app = require("./src/app");
const connectDatabase = require("./src/config/db");
const env = require("./src/config/env");
const { initializeDatabase } = require("./src/services/bootstrapService");

const server = http.createServer(app);

const startServer = async () => {
  await connectDatabase();
  await initializeDatabase();

  server.listen(env.port, () => {
    console.log(`API listening on port ${env.port}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});

process.on("SIGINT", () => {
  server.close(() => process.exit(0));
});

process.on("SIGTERM", () => {
  server.close(() => process.exit(0));
});
