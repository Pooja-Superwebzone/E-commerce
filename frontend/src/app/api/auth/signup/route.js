import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { authCookieOptions, signAuthToken } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const db = await getDb();
    const users = db.collection("users");

    await users.createIndex({ email: 1 }, { unique: true });

    const existingUser = await users.findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json(
        { message: "Email is already registered." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const now = new Date();

    const result = await users.insertOne({
      name: String(name).trim(),
      email: normalizedEmail,
      passwordHash,
      createdAt: now,
      updatedAt: now,
    });

    const user = {
      userId: result.insertedId.toString(),
      name: String(name).trim(),
      email: normalizedEmail,
    };

    const token = signAuthToken(user);
    const response = NextResponse.json({ user }, { status: 201 });
    response.cookies.set("auth_token", token, authCookieOptions);
    return response;
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to create account." },
      { status: 500 }
    );
  }
}
