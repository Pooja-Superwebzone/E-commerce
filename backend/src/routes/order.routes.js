const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { checkoutFromCart } = require("../controllers/order.controller");

const router = express.Router();

router.post("/checkout", requireAuth, checkoutFromCart);

module.exports = router;
