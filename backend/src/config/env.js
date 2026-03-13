const path = require("path");
const dotenv = require("dotenv");

const envPaths = [
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "backend", ".env"),
  path.resolve(__dirname, "..", "..", ".env"),
  path.resolve(__dirname, "..", "..", "..", ".env")
];

for (const envPath of envPaths) {
  dotenv.config({ path: envPath, override: false });
}

const required = (name) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

module.exports = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(required("PORT")),
  clientUrl: required("CLIENT_URL"),
  mongoUri: required("MONGODB_URI"),
  jwtSecret: required("JWT_SECRET"),
  jwtExpiresIn: required("JWT_EXPIRES_IN"),
  cookieSecret: required("COOKIE_SECRET"),
  maxFileSizeMb: Number(required("MAX_FILE_SIZE_MB")),
  atlasiaName: process.env.APP_NAME || "Atlasia Workbook"
};
