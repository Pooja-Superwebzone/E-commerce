const { getDb } = require("../config/db");
const { getCache, setCache, delCache, delCacheByPrefix } = require("../config/cache");

const PRODUCTS_CACHE_TTL_SECONDS = 60 * 10;
const PRODUCT_CACHE_TTL_SECONDS = 60 * 10;
const CATEGORIES_CACHE_TTL_SECONDS = 60 * 30;
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
    brand: item.brand ?? "",
    sku: item.sku ?? "",
    hsnCode: item.hsnCode ?? "",
    gstPercent: Number(item.gstPercent || 0),
    stock: Number(item.stock || 0),
  };
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeImageInput(value) {
  const image = String(value || "").trim();
  if (!image) return "";
  if (
    image.startsWith("data:image/") ||
    image.startsWith("http://") ||
    image.startsWith("https://")
  ) {
    return image;
  }
  return "";
}

async function invalidateCatalogCache(productId) {
  await delCacheByPrefix("catalog:products:");
  await delCache("catalog:categories");
  if (productId) {
    await delCache(`catalog:product:${productId}`);
  }
}

async function listProducts(req, res) {
  try {
    const {
      search = "",
      category = "",
      subcategory = "",
      featured = "",
      limit = "",
    } = req.query;
    const cacheKey = [
      "catalog:products",
      String(search).trim().toLowerCase(),
      String(category).trim().toLowerCase(),
      String(subcategory).trim().toLowerCase(),
      String(featured).trim().toLowerCase(),
      String(limit).trim().toLowerCase(),
    ].join(":");

    const cached = await getCache(cacheKey);
    if (cached) {
      return ok(res, "Products fetched successfully.", cached);
    }

    const db = await getDb();
    const products = db.collection("products");
    const query = {};
    if (category) query.category = String(category).toLowerCase();
    if (subcategory) query.subcategory = String(subcategory).toLowerCase();
    if (search) {
      const regex = new RegExp(String(search), "i");
      query.$or = [{ name: regex }, { description: regex }, { category: regex }];
    }

    const parsedLimit = Number(limit);
    const cursor = products.find(query).sort({ id: 1 });

    let items;
    if (
      (featured === "true" && !Number.isNaN(parsedLimit) && parsedLimit > 0) ||
      (!Number.isNaN(parsedLimit) && parsedLimit > 0)
    ) {
      items = (await cursor.limit(parsedLimit).toArray()).map(serializeProduct);
    } else {
      items = (await cursor.toArray()).map(serializeProduct);
    }

    const payload = {
      items,
      count: items.length,
    };
    await setCache(cacheKey, payload, PRODUCTS_CACHE_TTL_SECONDS);
    return ok(res, "Products fetched successfully.", payload);
  } catch {
    return fail(res, "Failed to fetch products.");
  }
}

async function getProductById(req, res) {
  try {
    const id = Number(req.params.id);
    if (!id) return fail(res, "Invalid product id.", 400);
    const cacheKey = `catalog:product:${id}`;

    const cached = await getCache(cacheKey);
    if (cached) {
      return ok(res, "Product fetched successfully.", cached);
    }

    const db = await getDb();
    const products = db.collection("products");
    const item = await products.findOne({ id });

    if (!item) return fail(res, "Product not found.", 404);
    const payload = { item: serializeProduct(item) };
    await setCache(cacheKey, payload, PRODUCT_CACHE_TTL_SECONDS);
    return ok(res, "Product fetched successfully.", payload);
  } catch {
    return fail(res, "Failed to fetch product.");
  }
}

async function listCategories(req, res) {
  try {
    const cacheKey = "catalog:categories";
    const cached = await getCache(cacheKey);
    if (cached) {
      return ok(res, "Categories fetched successfully.", cached);
    }

    const db = await getDb();
    const categoryMenu = db.collection("category_menu");
    const products = db.collection("products");

    const menu = await categoryMenu.find({}).sort({ label: 1 }).toArray();
    const rawCategories = await products.distinct("category");
    const categories = [
      "All",
      ...rawCategories.map((c) => c.charAt(0).toUpperCase() + c.slice(1)),
    ];

    const payload = { menu, categories };
    await setCache(cacheKey, payload, CATEGORIES_CACHE_TTL_SECONDS);
    return ok(res, "Categories fetched successfully.", payload);
  } catch {
    return fail(res, "Failed to fetch categories.");
  }
}

async function createProduct(req, res) {
  try {
    const db = await getDb();
    const products = db.collection("products");
    const payload = req.body?.product || req.body || {};

    const id = Number(payload.id);
    if (!id) return fail(res, "Product id is required.", 400);

    const existing = await products.findOne({ id });
    if (existing) return fail(res, "Product id already exists.", 409);

    const doc = {
      id,
      name: String(payload.name || "").trim(),
      category: String(payload.category || "").trim().toLowerCase(),
      subcategory: String(payload.subcategory || "").trim().toLowerCase(),
      price: toNumber(payload.price, 0),
      originalPrice: toNumber(payload.originalPrice, 0),
      rating: toNumber(payload.rating, 0),
      reviews: toNumber(payload.reviews, 0),
      image: normalizeImageInput(payload.image),
      description: String(payload.description || "").trim(),
      badge: payload.badge ? String(payload.badge) : null,
      brand: String(payload.brand || "").trim(),
      sku: String(payload.sku || "").trim(),
      hsnCode: String(payload.hsnCode || "").trim(),
      gstPercent: toNumber(payload.gstPercent, 0),
      stock: toNumber(payload.stock, 0),
    };

    if (!doc.name || !doc.category || !doc.subcategory || !doc.image) {
      return fail(res, "name, category, subcategory and image are required.", 400);
    }
    if (doc.gstPercent < 0 || doc.gstPercent > 100) {
      return fail(res, "gstPercent must be between 0 and 100.", 400);
    }
    if (doc.stock < 0) {
      return fail(res, "stock cannot be negative.", 400);
    }
    if (doc.rating < 0 || doc.rating > 5) {
      return fail(res, "rating must be between 0 and 5.", 400);
    }
    if (doc.reviews < 0) {
      return fail(res, "reviews cannot be negative.", 400);
    }

    await products.insertOne(doc);
    await invalidateCatalogCache(id);
    return ok(res, "Product created successfully.", { item: serializeProduct(doc) }, 201);
  } catch (error) {
    console.error("createProduct failed:", error);
    return fail(res, "Failed to create product.");
  }
}

async function updateProduct(req, res) {
  try {
    const id = Number(req.params.id);
    if (!id) return fail(res, "Invalid product id.", 400);

    const payload = req.body?.product || req.body || {};
    const update = {};

    if (payload.name !== undefined) update.name = String(payload.name || "").trim();
    if (payload.category !== undefined) {
      update.category = String(payload.category || "").trim().toLowerCase();
    }
    if (payload.subcategory !== undefined) {
      update.subcategory = String(payload.subcategory || "").trim().toLowerCase();
    }
    if (payload.price !== undefined) update.price = toNumber(payload.price, 0);
    if (payload.originalPrice !== undefined) {
      update.originalPrice = toNumber(payload.originalPrice, 0);
    }
    if (payload.rating !== undefined) update.rating = toNumber(payload.rating, 0);
    if (payload.reviews !== undefined) update.reviews = toNumber(payload.reviews, 0);
    if (payload.image !== undefined) {
      const normalizedImage = normalizeImageInput(payload.image);
      if (!normalizedImage) {
        return fail(res, "Invalid image format.", 400);
      }
      update.image = normalizedImage;
    }
    if (payload.description !== undefined) {
      update.description = String(payload.description || "").trim();
    }
    if (payload.badge !== undefined) {
      update.badge = payload.badge ? String(payload.badge) : null;
    }
    if (payload.brand !== undefined) update.brand = String(payload.brand || "").trim();
    if (payload.sku !== undefined) update.sku = String(payload.sku || "").trim();
    if (payload.hsnCode !== undefined) update.hsnCode = String(payload.hsnCode || "").trim();
    if (payload.gstPercent !== undefined) {
      update.gstPercent = toNumber(payload.gstPercent, 0);
    }
    if (payload.stock !== undefined) update.stock = toNumber(payload.stock, 0);

    if (
      update.gstPercent !== undefined &&
      (update.gstPercent < 0 || update.gstPercent > 100)
    ) {
      return fail(res, "gstPercent must be between 0 and 100.", 400);
    }
    if (update.stock !== undefined && update.stock < 0) {
      return fail(res, "stock cannot be negative.", 400);
    }
    if (update.rating !== undefined && (update.rating < 0 || update.rating > 5)) {
      return fail(res, "rating must be between 0 and 5.", 400);
    }
    if (update.reviews !== undefined && update.reviews < 0) {
      return fail(res, "reviews cannot be negative.", 400);
    }

    if (Object.keys(update).length === 0) {
      return fail(res, "No updatable fields provided.", 400);
    }

    const db = await getDb();
    const products = db.collection("products");
    const result = await products.updateOne({ id }, { $set: update });
    if (result.matchedCount === 0) return fail(res, "Product not found.", 404);

    const item = await products.findOne({ id });
    await invalidateCatalogCache(id);
    return ok(res, "Product updated successfully.", { item: serializeProduct(item) });
  } catch {
    return fail(res, "Failed to update product.");
  }
}

async function deleteProduct(req, res) {
  try {
    const id = Number(req.params.id);
    if (!id) return fail(res, "Invalid product id.", 400);

    const db = await getDb();
    const products = db.collection("products");
    const result = await products.deleteOne({ id });
    if (result.deletedCount === 0) return fail(res, "Product not found.", 404);

    await invalidateCatalogCache(id);
    return ok(res, "Product deleted successfully.", { id });
  } catch {
    return fail(res, "Failed to delete product.");
  }
}

module.exports = {
  listProducts,
  getProductById,
  listCategories,
  createProduct,
  updateProduct,
  deleteProduct,
};
