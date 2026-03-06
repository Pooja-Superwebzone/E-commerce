const express = require("express");
const { requireAuth } = require("../middleware/auth");
const {
  getCart,
  clearCart,
  addItem,
  updateItem,
  removeItem,
} = require("../controllers/cart.controller");

const router = express.Router();

router.get("/", requireAuth, getCart);
router.post("/add", requireAuth, addItem);
router.patch("/item", requireAuth, updateItem);
router.delete("/item", requireAuth, removeItem);
router.delete("/", requireAuth, clearCart);

module.exports = router;
