const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const { initDb } = require("./config/initDb");
const { initCache } = require("./config/cache");
const authRoutes = require("./routes/auth.routes");
const cartRoutes = require("./routes/cart.routes");
const orderRoutes = require("./routes/order.routes");
const catalogRoutes = require("./routes/catalog.routes");
const adminRoutes = require("./routes/admin.routes");

const app = express();
const PORT = Number(process.env.PORT || 5000);

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

app.get("/api/health", (req, res) => {
  res.status(200).json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", catalogRoutes);

initDb()
  .then(async () => {
    await initCache();
    app.listen(PORT, () => {
      console.log(`Backend running on http://localhost:${PORT}`);
      console.log("MongoDB ready: collections users, carts");
    });
  })
  .catch((error) => {
    console.error("Failed to initialize backend:", error?.message || error);
    process.exit(1);
  });
