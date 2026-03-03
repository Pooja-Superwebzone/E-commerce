const { getDb } = require("./db");

async function ensureCollection(db, name) {
  const existing = await db.listCollections({ name }).toArray();
  if (existing.length === 0) {
    await db.createCollection(name);
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
  await db.collection("users").createIndex({ email: 1 }, { unique: true });
  await db.collection("carts").createIndex({ userId: 1 }, { unique: true });
  await db.collection("carts").createIndex({ updatedAt: -1 });
  await db.collection("login_logs").createIndex({ userId: 1, loggedInAt: -1 });
  await db.collection("signup_logs").createIndex({ userId: 1, signedUpAt: -1 });
  await db.collection("signup_logs").createIndex({ email: 1 });
  await db.collection("products").createIndex({ id: 1 }, { unique: true });
  await db.collection("products").createIndex({ category: 1, subcategory: 1 });
  await db.collection("products").createIndex({ name: "text", description: "text" });
  await db.collection("category_menu").createIndex({ name: 1 }, { unique: true });

  return db;
}

module.exports = { initDb };
