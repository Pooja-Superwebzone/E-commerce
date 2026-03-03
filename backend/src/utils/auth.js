const jwt = require("jsonwebtoken");
const { normalizeRole } = require("./roles");
const { normalizePermissions } = require("./permissions");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

function signAuthToken(user) {
  return jwt.sign(
    {
      userId: user.userId,
      email: user.email,
      name: user.name,
      role: normalizeRole(user.role),
      permissions: normalizePermissions(user.permissions, user.role),
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function verifyAuthToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

const authCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 1000 * 60 * 60 * 24 * 7,
  path: "/",
};

module.exports = {
  signAuthToken,
  verifyAuthToken,
  authCookieOptions,
};
