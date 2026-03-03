const express = require("express");
const { ObjectId } = require("mongodb");
const { getDb } = require("../config/db");
const { requireAuth } = require("../middleware/auth");
const { getCache, setCache } = require("../config/cache");

const router = express.Router();
const CART_CACHE_TTL_SECONDS = 60;
const getCartCacheKey = (userId) => `cart:${String(userId)}`;

function normalizeProduct(product) {
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

async function getUserCart(userId) {
  const db = await getDb();
  const carts = db.collection("carts");
  const cart = await carts.findOne({ userId });
  return { carts, items: cart?.items || [] };
}

router.get("/", requireAuth, async (req, res) => {
  try {
    const cacheKey = getCartCacheKey(req.authUser.userId);
    const cachedItems = await getCache(cacheKey);
    if (Array.isArray(cachedItems)) {
      return res.status(200).json({ items: cachedItems });
    }

    const userId = new ObjectId(req.authUser.userId);
    const { items } = await getUserCart(userId);
    await setCache(cacheKey, items, CART_CACHE_TTL_SECONDS);
    return res.status(200).json({ items });
  } catch {
    return res.status(500).json({ message: "Failed to load cart." });
  }
});

router.delete("/", requireAuth, async (req, res) => {
  try {
    const db = await getDb();
    const carts = db.collection("carts");
    const userIdString = req.authUser.userId;
    const userId = new ObjectId(userIdString);
    await carts.updateOne(
      { userId },
      { $set: { items: [], updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
      { upsert: true }
    );
    await setCache(getCartCacheKey(userIdString), [], CART_CACHE_TTL_SECONDS);
    return res.status(200).json({ items: [] });
  } catch {
    return res.status(500).json({ message: "Failed to clear cart." });
  }
});

router.post("/add", requireAuth, async (req, res) => {
  try {
    const { product } = req.body;
    if (!product?.id) {
      return res.status(400).json({ message: "Product payload is required." });
    }

    const userIdString = req.authUser.userId;
    const userId = new ObjectId(userIdString);
    const { carts, items } = await getUserCart(userId);
    const productId = Number(product.id);
    const index = items.findIndex((item) => Number(item.id) === productId);

    if (index >= 0) {
      items[index].quantity += 1;
    } else {
      items.push({ ...normalizeProduct(product), quantity: 1 });
    }

    await carts.updateOne(
      { userId },
      {
        $set: { items, updatedAt: new Date() },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true }
    );

    await setCache(getCartCacheKey(userIdString), items, CART_CACHE_TTL_SECONDS);
    return res.status(200).json({ items });
  } catch {
    return res.status(500).json({ message: "Failed to add item." });
  }
});

router.patch("/item", requireAuth, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId || typeof quantity !== "number") {
      return res
        .status(400)
        .json({ message: "productId and quantity are required." });
    }

    const userIdString = req.authUser.userId;
    const userId = new ObjectId(userIdString);
    const { carts, items } = await getUserCart(userId);
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

    await setCache(getCartCacheKey(userIdString), nextItems, CART_CACHE_TTL_SECONDS);
    return res.status(200).json({ items: nextItems });
  } catch {
    return res.status(500).json({ message: "Failed to update item." });
  }
});

router.delete("/item", requireAuth, async (req, res) => {
  try {
    const productId = Number(req.query.productId);
    if (!productId) {
      return res.status(400).json({ message: "productId is required." });
    }

    const userIdString = req.authUser.userId;
    const userId = new ObjectId(userIdString);
    const { carts, items } = await getUserCart(userId);
    const nextItems = items.filter((item) => Number(item.id) !== productId);

    await carts.updateOne(
      { userId },
      {
        $set: { items: nextItems, updatedAt: new Date() },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true }
    );

    await setCache(getCartCacheKey(userIdString), nextItems, CART_CACHE_TTL_SECONDS);
    return res.status(200).json({ items: nextItems });
  } catch {
    return res.status(500).json({ message: "Failed to remove item." });
  }
});

module.exports = router;
