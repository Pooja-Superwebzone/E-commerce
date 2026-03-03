import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { authCookieOptions, signAuthToken } from "@/lib/auth";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function POST(request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required." },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const db = await getDb();
    const users = db.collection("users");
    const userDoc = await users.findOne({ email: normalizedEmail });
    if (!userDoc) {
      return NextResponse.json(
        { message: "Invalid email or password." },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, userDoc.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { message: "Invalid email or password." },
        { status: 401 }
      );
    }

    const user = {
      userId: userDoc._id.toString(),
      name: userDoc.name,
      email: userDoc.email,
    };

    const token = signAuthToken(user);
    const response = NextResponse.json({ user }, { status: 200 });
    response.cookies.set("auth_token", token, authCookieOptions);
    return response;
  } catch {
    return NextResponse.json({ message: "Login failed." }, { status: 500 });
  }
}
