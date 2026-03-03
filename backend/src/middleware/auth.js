const { verifyAuthToken } = require("../utils/auth");

function requireAuth(req, res, next) {
  const token = req.cookies?.auth_token;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const authUser = verifyAuthToken(token);
  if (!authUser?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  req.authUser = authUser;
  next();
}

module.exports = { requireAuth };
