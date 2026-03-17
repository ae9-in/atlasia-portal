const jwt = require("jsonwebtoken");
const env = require("../config/env");

const signToken = (payload) => jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

const buildCookieOptions = () => ({
  httpOnly: true,
  sameSite: env.nodeEnv === "production" ? "none" : "lax",
  secure: env.nodeEnv === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000
});

module.exports = {
  signToken,
  buildCookieOptions
};
