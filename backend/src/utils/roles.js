const ROLES = Object.freeze({
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  SUB_ADMIN: "sub_admin",
  USER: "user",
});

const ROLE_VALUES = new Set(Object.values(ROLES));

function normalizeRole(role) {
  const value = String(role || "").trim().toLowerCase();
  if (!ROLE_VALUES.has(value)) return ROLES.USER;
  return value;
}

function isAdminRole(role) {
  const normalized = normalizeRole(role);
  return (
    normalized === ROLES.SUPER_ADMIN ||
    normalized === ROLES.ADMIN ||
    normalized === ROLES.SUB_ADMIN
  );
}

module.exports = {
  ROLES,
  normalizeRole,
  isAdminRole,
};
