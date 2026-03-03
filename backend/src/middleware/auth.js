const { verifyAuthToken } = require("../utils/auth");
const { normalizeRole } = require("../utils/roles");
const { normalizePermissions, hasPermission } = require("../utils/permissions");

function requireAuth(req, res, next) {
  const token = req.cookies?.auth_token;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const authUser = verifyAuthToken(token);
  if (!authUser?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  authUser.role = normalizeRole(authUser.role);
  authUser.permissions = normalizePermissions(authUser.permissions, authUser.role);
  req.authUser = authUser;
  next();
}

function requireRoles(...allowedRoles) {
  const normalizedAllowed = new Set(
    allowedRoles.map((role) => normalizeRole(role))
  );

  return (req, res, next) => {
    const userRole = normalizeRole(req.authUser?.role);
    if (!normalizedAllowed.has(userRole)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
}

function requireAdminPermission(permissionKey) {
  return (req, res, next) => {
    const role = normalizeRole(req.authUser?.role);
    if (role === "super_admin") return next();

    const permissions = normalizePermissions(req.authUser?.permissions, role);
    if (!hasPermission(permissions, permissionKey)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  };
}

module.exports = { requireAuth, requireRoles, requireAdminPermission };
