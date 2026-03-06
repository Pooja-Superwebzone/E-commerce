const { ObjectId } = require("mongodb");
const { getDb } = require("../config/db");
const { setCache } = require("../config/cache");

const CART_CACHE_TTL_SECONDS = 60;
const getCartCacheKey = (userId) => `cart:${String(userId)}`;

function roundCurrency(value) {
  return Math.round(Number(value || 0) * 100) / 100;
}

function normalizeOrderItems(items) {
  return items.map((item) => {
    const quantity = Number(item.quantity || 0);
    const price = Number(item.price || 0);
    const originalPrice = Number(item.originalPrice || 0);
    return {
      id: Number(item.id),
      name: String(item.name || ""),
      image: String(item.image || ""),
      category: String(item.category || ""),
      subcategory: String(item.subcategory || ""),
      quantity,
      price,
      originalPrice,
      lineTotal: roundCurrency(quantity * price),
    };
  });
}

function normalizeString(value, fallback = "") {
  const text = String(value || "").trim();
  return text || fallback;
}

function buildShippingAddress(payload, authUser, savedAddress) {
  return {
    fullName: normalizeString(
      payload?.fullName,
      normalizeString(savedAddress?.fullName, normalizeString(authUser?.name, "Customer"))
    ),
    phone: normalizeString(payload?.phone, normalizeString(savedAddress?.phone)),
    addressLine1: normalizeString(payload?.addressLine1, normalizeString(savedAddress?.addressLine1)),
    addressLine2: normalizeString(payload?.addressLine2, normalizeString(savedAddress?.addressLine2)),
    city: normalizeString(payload?.city, normalizeString(savedAddress?.city)),
    state: normalizeString(payload?.state, normalizeString(savedAddress?.state)),
    postalCode: normalizeString(payload?.postalCode, normalizeString(savedAddress?.postalCode)),
    country: normalizeString(payload?.country, normalizeString(savedAddress?.country, "India")),
    landmark: normalizeString(payload?.landmark, normalizeString(savedAddress?.landmark)),
    locationNote: normalizeString(payload?.locationNote, normalizeString(savedAddress?.locationNote)),
  };
}

async function checkoutFromCart(req, res) {
  try {
    const userIdString = String(req.authUser?.userId || "");
    if (!ObjectId.isValid(userIdString)) {
      return res.status(400).json({ message: "Invalid user id." });
    }

    const userId = new ObjectId(userIdString);
    const db = await getDb();
    const carts = db.collection("carts");
    const orders = db.collection("orders");
    const users = db.collection("users");

    const cart = await carts.findOne({ userId });
    const userDoc = await users.findOne(
      { _id: userId },
      { projection: { name: 1, savedAddress: 1 } }
    );
    const items = Array.isArray(cart?.items) ? cart.items : [];
    if (items.length === 0) {
      return res.status(400).json({ message: "Cart is empty." });
    }

    const orderItems = normalizeOrderItems(items);
    const subtotal = roundCurrency(
      orderItems.reduce((sum, item) => sum + item.lineTotal, 0)
    );
    const taxAmount = roundCurrency(subtotal * 0.1);
    const deliveryCharge = subtotal > 50 ? 0 : 50;
    const totalAmount = roundCurrency(subtotal + taxAmount + deliveryCharge);
    const now = new Date();
    const shippingAddress = buildShippingAddress(
      req.body || {},
      { ...req.authUser, name: userDoc?.name || req.authUser?.name },
      userDoc?.savedAddress || null
    );

    if (
      !shippingAddress.fullName ||
      !shippingAddress.phone ||
      !shippingAddress.addressLine1 ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.postalCode
    ) {
      return res.status(400).json({ message: "Please fill all required delivery address fields." });
    }

    const order = {
      userId: userIdString,
      userName: String(req.authUser?.name || ""),
      email: String(req.authUser?.email || ""),
      status: "pending",
      items: orderItems,
      itemCount: orderItems.reduce((sum, item) => sum + item.quantity, 0),
      subtotal,
      discountAmount: 0,
      taxAmount,
      deliveryCharge,
      totalAmount,
      currency: "INR",
      source: "cart_checkout",
      shippingAddress,
      placedAt: now,
      createdAt: now,
      updatedAt: now,
    };

    const result = await orders.insertOne(order);
    await users.updateOne(
      { _id: userId },
      { $set: { savedAddress: shippingAddress, updatedAt: now } }
    );

    await carts.updateOne(
      { userId },
      {
        $set: { items: [], updatedAt: now },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true }
    );
    await setCache(getCartCacheKey(userIdString), [], CART_CACHE_TTL_SECONDS);

    return res.status(201).json({
      message: "Order placed successfully.",
      order: {
        _id: result.insertedId,
        userId: order.userId,
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt,
      },
    });
  } catch {
    return res.status(500).json({ message: "Failed to place order." });
  }
}

module.exports = {
  checkoutFromCart,
};
