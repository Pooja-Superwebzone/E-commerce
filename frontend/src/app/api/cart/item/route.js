import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getAuthUserFromRequest } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
}

async function getUserCartItems(userId) {
  const db = await getDb();
  const carts = db.collection("carts");
  const cart = await carts.findOne({ userId });
  return { carts, items: cart?.items || [] };
}

export async function PATCH(request) {
  try {
    const authUser = getAuthUserFromRequest(request);
    if (!authUser?.userId) return unauthorized();

    const { productId, quantity } = await request.json();
    if (!productId || typeof quantity !== "number") {
      return NextResponse.json(
        { message: "productId and quantity are required." },
        { status: 400 }
      );
    }

    const userId = new ObjectId(authUser.userId);
    const { carts, items } = await getUserCartItems(userId);
    const normalizedProductId = Number(productId);

    const nextItems =
      quantity <= 0
        ? items.filter((item) => Number(item.id) !== normalizedProductId)
        : items.map((item) =>
            Number(item.id) === normalizedProductId
              ? { ...item, quantity }
              : item
          );

    await carts.updateOne(
      { userId },
      {
        $set: { items: nextItems, updatedAt: new Date() },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true }
    );

    return NextResponse.json({ items: nextItems }, { status: 200 });
  } catch {
    return NextResponse.json({ message: "Failed to update item." }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const authUser = getAuthUserFromRequest(request);
    if (!authUser?.userId) return unauthorized();

    const { searchParams } = new URL(request.url);
    const productId = Number(searchParams.get("productId"));
    if (!productId) {
      return NextResponse.json(
        { message: "productId is required." },
        { status: 400 }
      );
    }

    const userId = new ObjectId(authUser.userId);
    const { carts, items } = await getUserCartItems(userId);
    const nextItems = items.filter((item) => Number(item.id) !== productId);

    await carts.updateOne(
      { userId },
      {
        $set: { items: nextItems, updatedAt: new Date() },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true }
    );

    return NextResponse.json({ items: nextItems }, { status: 200 });
  } catch {
    return NextResponse.json({ message: "Failed to remove item." }, { status: 500 });
  }
}
