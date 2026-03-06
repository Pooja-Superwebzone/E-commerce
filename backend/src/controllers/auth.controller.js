const bcrypt = require("bcryptjs");
const { ObjectId } = require("mongodb");
const { getDb } = require("../config/db");
const {
  authCookieOptions,
  signAuthToken,
  verifyAuthToken,
} = require("../utils/auth");
const { ROLES, normalizeRole } = require("../utils/roles");
const {
  normalizePermissions,
  defaultPermissionsByRole,
} = require("../utils/permissions");

function toPublicUser(userDoc) {
  return {
    userId: userDoc._id?.toString?.() || String(userDoc.userId || ""),
    name: userDoc.name,
    email: userDoc.email,
    role: normalizeRole(userDoc.role),
    permissions: normalizePermissions(userDoc.permissions, userDoc.role),
    savedAddress: userDoc.savedAddress || null,
    lastLoginAt: userDoc.lastLoginAt || null,
    createdAt: userDoc.createdAt || null,
  };
}

async function signup(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required." });
    }

    if (String(password).length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters." });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const db = await getDb();
    const users = db.collection("users");
    const signupLogs = db.collection("signup_logs");
    await users.createIndex({ email: 1 }, { unique: true });
    const existingUser = await users.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: "Email is already registered." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const now = new Date();
    const role = ROLES.USER;
    const permissions = defaultPermissionsByRole(role);
    const result = await users.insertOne({
      name: String(name).trim(),
      email: normalizedEmail,
      passwordHash,
      role,
      permissions,
      lastLoginAt: now,
      createdAt: now,
      updatedAt: now,
    });

    const user = {
      userId: result.insertedId.toString(),
      name: String(name).trim(),
      email: normalizedEmail,
      role,
      permissions,
      savedAddress: null,
    };

    const token = signAuthToken(user);
    await signupLogs.insertOne({
      userId: result.insertedId.toString(),
      name: String(name).trim(),
      email: normalizedEmail,
      signedUpAt: now,
      
    });
    res.cookie("auth_token", token, authCookieOptions);
    return res.status(201).json({ user });
  } catch {
    return res.status(500).json({ message: "Failed to create account." });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const db = await getDb();
    const users = db.collection("users");
    const loginLogs = db.collection("login_logs");
    const userDoc = await users.findOne({ email: normalizedEmail });

    if (!userDoc) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isValid = await bcrypt.compare(password, userDoc.passwordHash);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const user = {
      userId: userDoc._id.toString(),
      name: userDoc.name,
      email: userDoc.email,
      role: normalizeRole(userDoc.role || ROLES.USER),
      permissions: normalizePermissions(
        userDoc.permissions,
        userDoc.role || ROLES.USER
      ),
      savedAddress: userDoc.savedAddress || null,
    };

    const now = new Date();
    await users.updateOne(
      { _id: userDoc._id },
      { $set: { lastLoginAt: now, updatedAt: now } }
    );
    await loginLogs.insertOne({
      userId: userDoc._id.toString(),
      email: userDoc.email,
      loggedInAt: now,
      source: "login",
    });

    const token = signAuthToken(user);
    res.cookie("auth_token", token, authCookieOptions);
    return res.status(200).json({ user });
  } catch {
    return res.status(500).json({ message: "Login failed." });
  }
}

async function me(req, res) {
  const token = req.cookies?.auth_token;
  if (!token) {
    return res.status(200).json({ user: null });
  }

  const authUser = verifyAuthToken(token);
  if (!authUser?.userId) {
    return res.status(200).json({ user: null });
  }

  try {
    const db = await getDb();
    const users = db.collection("users");
    const userDoc = ObjectId.isValid(authUser.userId)
      ? await users.findOne(
          { _id: new ObjectId(authUser.userId) },
          { projection: { name: 1, email: 1, role: 1, permissions: 1, savedAddress: 1 } }
        )
      : null;

    if (!userDoc) {
      return res.status(200).json({ user: null });
    }

    return res.status(200).json({
      user: {
        userId: authUser.userId,
        name: userDoc.name,
        email: userDoc.email,
        role: normalizeRole(userDoc.role),
        permissions: normalizePermissions(userDoc.permissions, userDoc.role),
        savedAddress: userDoc.savedAddress || null,
      },
    });
  } catch {
    return res.status(200).json({
      user: {
        userId: authUser.userId,
        name: authUser.name,
        email: authUser.email,
        role: normalizeRole(authUser.role),
        permissions: normalizePermissions(authUser.permissions, authUser.role),
        savedAddress: null,
      },
    });
  }
}

async function listUsers(req, res) {
  try {
    const db = await getDb();
    const users = db.collection("users");
    const docs = await users
      .find(
        {},
        {
          projection: {
            name: 1,
            email: 1,
            role: 1,
            permissions: 1,
            lastLoginAt: 1,
            createdAt: 1,
          },
        }
      )
      .sort({ createdAt: -1 })
      .toArray();

    return res.status(200).json({
      users: docs.map(toPublicUser),
    });
  } catch {
    return res.status(500).json({ message: "Failed to fetch users." });
  }
}

async function createAdminUser(req, res) {
  try {
    const actorRole = normalizeRole(req.authUser.role);
    const { name, email, password, role, permissions } = req.body || {};

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "name, email and password are required." });
    }
    if (String(password).length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters." });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const requestedRole = normalizeRole(role || ROLES.USER);

    const requestedPermissions = normalizePermissions(permissions, requestedRole);

    const canManageAdmins =
      actorRole === ROLES.SUPER_ADMIN ||
      Boolean(req.authUser.permissions?.manage_admins);
    if (
      !canManageAdmins &&
      (requestedRole === ROLES.SUPER_ADMIN || requestedRole === ROLES.ADMIN)
    ) {
      return res.status(403).json({
        message:
          "You do not have permission to create admin or super admin users.",
      });
    }

    const db = await getDb();
    const users = db.collection("users");
    const existing = await users.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ message: "Email is already registered." });
    }

    const now = new Date();
    const passwordHash = await bcrypt.hash(password, 10);
    const result = await users.insertOne({
      name: String(name).trim(),
      email: normalizedEmail,
      passwordHash,
      role: requestedRole,
      permissions: requestedPermissions,
      lastLoginAt: null,
      createdAt: now,
      updatedAt: now,
    });

    const created = await users.findOne({ _id: result.insertedId });
    return res.status(201).json({ user: toPublicUser(created) });
  } catch {
    return res.status(500).json({ message: "Failed to create user." });
  }
}

async function updateUserRole(req, res) {
  try {
    const targetId = req.params.id;
    const requestedRole = normalizeRole(req.body?.role);
    if (!ObjectId.isValid(targetId)) {
      return res.status(400).json({ message: "Invalid user id." });
    }

    const db = await getDb();
    const users = db.collection("users");
    const targetUser = await users.findOne({ _id: new ObjectId(targetId) });
    if (!targetUser) {
      return res.status(404).json({ message: "User not found." });
    }

    const actorRole = normalizeRole(req.authUser.role);
    const targetCurrentRole = normalizeRole(targetUser.role);

    const canManageAdmins =
      actorRole === ROLES.SUPER_ADMIN ||
      Boolean(req.authUser.permissions?.manage_admins);
    if (!canManageAdmins) {
      if (
        requestedRole === ROLES.SUPER_ADMIN ||
        requestedRole === ROLES.ADMIN ||
        targetCurrentRole === ROLES.SUPER_ADMIN ||
        targetCurrentRole === ROLES.ADMIN
      ) {
        return res.status(403).json({
          message:
            "You do not have permission to manage admin and super admin roles.",
        });
      }
    }

    const update = {
      role: requestedRole,
      permissions: defaultPermissionsByRole(requestedRole),
      updatedAt: new Date(),
    };
    await users.updateOne({ _id: targetUser._id }, { $set: update });

    const updatedUser = await users.findOne({ _id: targetUser._id });
    return res.status(200).json({ user: toPublicUser(updatedUser) });
  } catch {
    return res.status(500).json({ message: "Failed to update role." });
  }
}

async function updateUserPermissions(req, res) {
  try {
    const targetId = req.params.id;
    if (!ObjectId.isValid(targetId)) {
      return res.status(400).json({ message: "Invalid user id." });
    }

    const db = await getDb();
    const users = db.collection("users");
    const targetUser = await users.findOne({ _id: new ObjectId(targetId) });
    if (!targetUser) {
      return res.status(404).json({ message: "User not found." });
    }

    const actorRole = normalizeRole(req.authUser.role);
    const targetRole = normalizeRole(targetUser.role);

    const canManageAdmins =
      actorRole === ROLES.SUPER_ADMIN ||
      Boolean(req.authUser.permissions?.manage_admins);
    if (
      !canManageAdmins &&
      (targetRole === ROLES.ADMIN || targetRole === ROLES.SUPER_ADMIN)
    ) {
      return res.status(403).json({
        message:
          "You do not have permission to manage admin/super admin permissions.",
      });
    }

    const requestedPermissions = normalizePermissions(
      req.body?.permissions,
      targetRole
    );

    await users.updateOne(
      { _id: targetUser._id },
      { $set: { permissions: requestedPermissions, updatedAt: new Date() } }
    );

    const updatedUser = await users.findOne({ _id: targetUser._id });
    return res.status(200).json({ user: toPublicUser(updatedUser) });
  } catch {
    return res.status(500).json({ message: "Failed to update permissions." });
  }
}

async function logout(req, res) {
  res.clearCookie("auth_token", {
    ...authCookieOptions,
    maxAge: undefined,
  });
  return res.status(200).json({ ok: true });
}

module.exports = {
  signup,
  login,
  me,
  listUsers,
  createAdminUser,
  updateUserRole,
  updateUserPermissions,
  logout,
};
