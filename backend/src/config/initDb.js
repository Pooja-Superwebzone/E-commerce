const { getDb } = require("./db");
const bcrypt = require("bcryptjs");
const { ROLES } = require("../utils/roles");
const { defaultPermissionsByRole, normalizePermissions } = require("../utils/permissions");

async function ensureCollection(db, name) {
  const existing = await db.listCollections({ name }).toArray();
  if (existing.length === 0) {
    await db.createCollection(name);
  }
}

async function ensureDefaultSuperAdmin(db) {
  const email = String(process.env.SUPER_ADMIN_EMAIL || "")
    .trim()
    .toLowerCase();
  const password = String(process.env.SUPER_ADMIN_PASSWORD || "");
  const name = String(process.env.SUPER_ADMIN_NAME || "Super Admin").trim();

  if (!email || !password) return;
  if (password.length < 6) {
    throw new Error("SUPER_ADMIN_PASSWORD must be at least 6 characters.");
  }

  const users = db.collection("users");
  const now = new Date();
  const passwordHash = await bcrypt.hash(password, 10);
  const existing = await users.findOne({ email });

  if (!existing) {
    await users.insertOne({
      name,
      email,
      passwordHash,
      role: ROLES.SUPER_ADMIN,
      permissions: defaultPermissionsByRole(ROLES.SUPER_ADMIN),
      lastLoginAt: null,
      createdAt: now,
      updatedAt: now,
    });
    return;
  }

  await users.updateOne(
    { _id: existing._id },
    {
      $set: {
        name,
        passwordHash,
        role: ROLES.SUPER_ADMIN,
        permissions: defaultPermissionsByRole(ROLES.SUPER_ADMIN),
        updatedAt: now,
      },
    }
  );
}

async function ensurePermissionsOnExistingUsers(db) {
  const users = db.collection("users");
  const cursor = users.find({}, { projection: { role: 1, permissions: 1 } });
  const updates = [];

  await cursor.forEach((userDoc) => {
    const normalizedPermissions = normalizePermissions(userDoc.permissions, userDoc.role);
    const needsUpdate =
      JSON.stringify(normalizedPermissions) !==
      JSON.stringify(userDoc.permissions || {});

    if (needsUpdate) {
      updates.push({
        updateOne: {
          filter: { _id: userDoc._id },
          update: { $set: { permissions: normalizedPermissions } },
        },
      });
    }
  });

  if (updates.length > 0) {
    await users.bulkWrite(updates);
  }
}

async function initDb() {
  const db = await getDb();
  await ensureCollection(db, "users");
  await ensureCollection(db, "carts");
  await ensureCollection(db, "login_logs");
  await ensureCollection(db, "signup_logs");
  await ensureCollection(db, "products");
  await ensureCollection(db, "category_menu");
  await ensureCollection(db, "orders");
  await db.collection("users").createIndex({ email: 1 }, { unique: true });
  await db.collection("users").createIndex({ role: 1 });
  await db.collection("carts").createIndex({ userId: 1 }, { unique: true });
  await db.collection("carts").createIndex({ updatedAt: -1 });
  await db.collection("login_logs").createIndex({ userId: 1, loggedInAt: -1 });
  await db.collection("signup_logs").createIndex({ userId: 1, signedUpAt: -1 });
  await db.collection("signup_logs").createIndex({ email: 1 });
  await db.collection("products").createIndex({ id: 1 }, { unique: true });
  await db.collection("products").createIndex({ category: 1, subcategory: 1 });
  await db.collection("products").createIndex({ name: "text", description: "text" });
  await db.collection("category_menu").createIndex({ name: 1 }, { unique: true });
  await db.collection("orders").createIndex({ createdAt: -1 });
  await db.collection("orders").createIndex({ userId: 1, createdAt: -1 });
  await db.collection("orders").createIndex({ status: 1 });
  await ensurePermissionsOnExistingUsers(db);
  await ensureDefaultSuperAdmin(db);

  return db;
}

module.exports = { initDb };
