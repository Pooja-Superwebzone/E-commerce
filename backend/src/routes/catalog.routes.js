const express = require("express");
const { getDb } = require("../config/db");

const router = express.Router();
const ok = (res, message, data, status = 200) =>
  res.status(status).json({ success: true, message, data });
const fail = (res, message, status = 500) =>
  res.status(status).json({ success: false, message, data: null });

function serializeProduct(item) {
  return {
    id: item.id,
    name: item.name,
    category: item.category,
    subcategory: item.subcategory,
    price: item.price,
    originalPrice: item.originalPrice,
    rating: item.rating,
    reviews: item.reviews,
    image: item.image,
    description: item.description,
    badge: item.badge ?? null,
  };
}

router.get("/products", async (req, res) => {
  try {
    const db = await getDb();
    const products = db.collection("products");
    const { search = "", category = "", subcategory = "", featured = "", limit = "" } = req.query;
    const query = {};
    if (category) query.category = String(category).toLowerCase();
    if (subcategory) query.subcategory = String(subcategory).toLowerCase();
    if (search) {
      const regex = new RegExp(String(search), "i");
      query.$or = [{ name: regex }, { description: regex }, { category: regex }];
    }

    const parsedLimit = Number(limit);
    const cursor = products.find(query).sort({ id: 1 });

    if (featured === "true" && !Number.isNaN(parsedLimit) && parsedLimit > 0) {
      const items = (await cursor.limit(parsedLimit).toArray()).map(serializeProduct);
      return ok(res, "Products fetched successfully.", {
        items,
        count: items.length,
      });
    }

    if (!Number.isNaN(parsedLimit) && parsedLimit > 0) {
      const items = (await cursor.limit(parsedLimit).toArray()).map(serializeProduct);
      return ok(res, "Products fetched successfully.", {
        items,
        count: items.length,
      });
    }

    const items = (await cursor.toArray()).map(serializeProduct);
    return ok(res, "Products fetched successfully.", {
      items,
      count: items.length,
    });
  } catch {
    return fail(res, "Failed to fetch products.");
  }
});

router.get("/products/:id", async (req, res) => {
  try {
    const db = await getDb();
    const products = db.collection("products");
    const id = Number(req.params.id);
    if (!id) return fail(res, "Invalid product id.", 400);

    const item = await products.findOne({ id });
    if (!item) return fail(res, "Product not found.", 404);
    return ok(res, "Product fetched successfully.", { item: serializeProduct(item) });
  } catch {
    return fail(res, "Failed to fetch product.");
  }
});

router.get("/categories", async (req, res) => {
  try {
    const db = await getDb();
    const categoryMenu = db.collection("category_menu");
    const products = db.collection("products");

    const menu = await categoryMenu.find({}).sort({ label: 1 }).toArray();
    const rawCategories = await products.distinct("category");
    const categories = ["All", ...rawCategories.map((c) => c.charAt(0).toUpperCase() + c.slice(1))];

    return ok(res, "Categories fetched successfully.", { menu, categories });
  } catch {
    return fail(res, "Failed to fetch categories.");
  }
});

module.exports = router;
