const express = require("express");
const { requireAuth, requireAdminPermission } = require("../middleware/auth");
const {
  listProducts,
  getProductById,
  listCategories,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/catalog.controller");

const router = express.Router();
router.get("/products", listProducts);
router.get("/products/:id", getProductById);
router.get("/categories", listCategories);
router.post("/products", requireAuth, requireAdminPermission("product_add"), createProduct);
router.patch("/products/:id", requireAuth, requireAdminPermission("product_edit"), updateProduct);
router.delete("/products/:id", requireAuth, requireAdminPermission("product_delete"), deleteProduct);

module.exports = router;
