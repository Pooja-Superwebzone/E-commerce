const express = require("express");
const bcrypt = require("bcryptjs");
const { getDb } = require("../config/db");
const { authCookieOptions, signAuthToken, verifyAuthToken } = require("../utils/auth");

const router = express.Router();

router.post("/signup", async (req, res) => {
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
    const result = await users.insertOne({
      name: String(name).trim(),
      email: normalizedEmail,
      passwordHash,
      lastLoginAt: now,
      createdAt: now,
      updatedAt: now,
    });

    const user = {
      userId: result.insertedId.toString(),
      name: String(name).trim(),
      email: normalizedEmail,
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
});

router.post("/login", async (req, res) => {
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
});

router.get("/me", async (req, res) => {
  const token = req.cookies?.auth_token;
  if (!token) {
    return res.status(200).json({ user: null });
  }

  const authUser = verifyAuthToken(token);
  if (!authUser?.userId) {
    return res.status(200).json({ user: null });
  }

  return res.status(200).json({
    user: {
      userId: authUser.userId,
      name: authUser.name,
      email: authUser.email,
    },
  });
});

router.post("/logout", async (req, res) => {
  res.clearCookie("auth_token", {
    ...authCookieOptions,
    maxAge: undefined,
  });
  return res.status(200).json({ ok: true });
});

module.exports = router;
