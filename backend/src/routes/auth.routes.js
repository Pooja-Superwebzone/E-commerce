const express = require("express");
const { requireAuth, requireAdminPermission } = require("../middleware/auth");
const {
  signup,
  login,
  me,
  listUsers,
  createAdminUser,
  updateUserRole,
  updateUserPermissions,
  logout,
} = require("../controllers/auth.controller");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", me);

router.get(
  "/users",
  requireAuth,
  requireAdminPermission("manage_users"),
  listUsers
);

router.post(
  "/admin/users",
  requireAuth,
  requireAdminPermission("manage_users"),
  createAdminUser
);

router.patch(
  "/users/:id/role",
  requireAuth,
  requireAdminPermission("manage_users"),
  updateUserRole
);

router.patch(
  "/users/:id/permissions",
  requireAuth,
  requireAdminPermission("manage_users"),
  updateUserPermissions
);

router.post("/logout", logout);

module.exports = router;
