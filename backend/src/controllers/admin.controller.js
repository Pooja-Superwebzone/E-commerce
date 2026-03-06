const { ObjectId } = require("mongodb");
const { getDb } = require("../config/db");

function parseOrderStatus(value) {
  return String(value || "").trim().toLowerCase();
}

async function listOrders(req, res) {
  try {
    const db = await getDb();
    const orders = db.collection("orders");
    const items = await orders.find({}).sort({ createdAt: -1 }).toArray();
    return res.status(200).json({ orders: items });
  } catch {
    return res.status(500).json({ message: "Failed to fetch orders." });
  }
}

async function updateOrderStatus(req, res) {
  try {
    const id = req.params.id;
    const status = parseOrderStatus(req.body?.status);
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid order id." });
    }
    if (!status) {
      return res.status(400).json({ message: "Order status is required." });
    }

    const db = await getDb();
    const orders = db.collection("orders");
    const result = await orders.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { status, updatedAt: new Date() } },
      { returnDocument: "after" }
    );

    if (!result) {
      return res.status(404).json({ message: "Order not found." });
    }
    return res.status(200).json({ order: result });
  } catch {
    return res.status(500).json({ message: "Failed to update order." });
  }
}

module.exports = {
  listOrders,
  updateOrderStatus,
};
