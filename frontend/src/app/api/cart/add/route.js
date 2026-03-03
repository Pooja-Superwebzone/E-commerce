import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getAuthUserFromRequest } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
}

function sanitizeProduct(product) {
  return {
    id: Number(product.id),
    name: String(product.name || ""),
    image: String(product.image || ""),
    category: String(product.category || ""),
    subcategory: String(product.subcategory || ""),
    price: Number(product.price || 0),
    originalPrice: Number(product.originalPrice || 0),
  };
}

export async function POST(request) {
  try {
    const authUser = getAuthUserFromRequest(request);
    if (!authUser?.userId) return unauthorized();

    const { product } = await request.json();
    if (!product?.id) {
      return NextResponse.json(
        { message: "Product payload is required." },
        { status: 400 }
      );
    }

    const db = await getDb();
    const carts = db.collection("carts");
    const userId = new ObjectId(authUser.userId);

    const existingCart = await carts.findOne({ userId });
    const items = existingCart?.items || [];
    const productId = Number(product.id);

    const index = items.findIndex((item) => Number(item.id) === productId);
    if (index >= 0) {
      items[index].quantity += 1;
    } else {
      items.push({ ...sanitizeProduct(product), quantity: 1 });
    }

    await carts.updateOne(
      { userId },
      {
        $set: { items, updatedAt: new Date() },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true }
    );

    return NextResponse.json({ items }, { status: 200 });
  } catch {
    return NextResponse.json({ message: "Failed to add item." }, { status: 500 });
  }
}
