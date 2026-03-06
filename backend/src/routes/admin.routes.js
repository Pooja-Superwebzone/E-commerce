const express = require("express");
const { requireAuth, requireAdminPermission } = require("../middleware/auth");
const {
  listOrders,
  updateOrderStatus,
} = require("../controllers/admin.controller");

const router = express.Router();

router.get(
  "/orders",
  requireAuth,
  requireAdminPermission("orders"),
  listOrders
);

router.patch(
  "/orders/:id/status",
  requireAuth,
  requireAdminPermission("orders"),
  updateOrderStatus
);

module.exports = router;
