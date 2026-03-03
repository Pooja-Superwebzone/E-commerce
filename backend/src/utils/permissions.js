const { ROLES, normalizeRole } = require("./roles");

const PERMISSION_KEYS = Object.freeze([
  "dashboard",
  "product_add",
  "product_edit",
  "product_delete",
  "manage_users",
  "manage_admins",
  "orders",
]);

function defaultPermissionsByRole(role) {
  const normalizedRole = normalizeRole(role);
  if (normalizedRole === ROLES.SUPER_ADMIN) {
    return {
      dashboard: true,
      product_add: true,
      product_edit: true,
      product_delete: true,
      manage_users: true,
      manage_admins: true,
      orders: true,
    };
  }

  if (normalizedRole === ROLES.ADMIN) {
    return {
      dashboard: true,
      product_add: true,
      product_edit: true,
      product_delete: true,
      manage_users: true,
      manage_admins: false,
      orders: true,
    };
  }

  if (normalizedRole === ROLES.SUB_ADMIN) {
    return {
      dashboard: true,
      product_add: true,
      product_edit: false,
      product_delete: false,
      manage_users: false,
      manage_admins: false,
      orders: true,
    };
  }

  return {
    dashboard: false,
    product_add: false,
    product_edit: false,
    product_delete: false,
    manage_users: false,
    manage_admins: false,
    orders: false,
  };
}

function normalizePermissions(input, role) {
  return defaultPermissionsByRole(role);
}

function hasPermission(permissions, key) {
  if (!PERMISSION_KEYS.includes(key)) return false;
  if (!permissions || typeof permissions !== "object") return false;
  return Boolean(permissions[key]);
}

module.exports = {
  PERMISSION_KEYS,
  defaultPermissionsByRole,
  normalizePermissions,
  hasPermission,
};
