import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getAuthUserFromRequest } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
}

export async function GET(request) {
  try {
    const authUser = getAuthUserFromRequest(request);
    if (!authUser?.userId) return unauthorized();

    const db = await getDb();
    const carts = db.collection("carts");
    const userId = new ObjectId(authUser.userId);

    const cart = await carts.findOne({ userId });
    return NextResponse.json({ items: cart?.items || [] }, { status: 200 });
  } catch {
    return NextResponse.json({ message: "Failed to load cart." }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const authUser = getAuthUserFromRequest(request);
    if (!authUser?.userId) return unauthorized();

    const db = await getDb();
    const carts = db.collection("carts");
    const userId = new ObjectId(authUser.userId);

    await carts.updateOne(
      { userId },
      { $set: { items: [], updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
      { upsert: true }
    );

    return NextResponse.json({ items: [] }, { status: 200 });
  } catch {
    return NextResponse.json({ message: "Failed to clear cart." }, { status: 500 });
  }
}
