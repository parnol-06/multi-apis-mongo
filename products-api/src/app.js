import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import mongoose from "mongoose";
import { Product } from "./models/Product.js"; // nuevo modelo mongoose
import { connectDB } from "./db.js"; // conexión a Cosmos DB (MongoDB API)

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4002;
const SERVICE = process.env.SERVICE_NAME || "products-api";
const USERS_API_URL = process.env.USERS_API_URL || "http://users-api:4001";

// 🔹 Conectar a Cosmos DB al iniciar el servicio
await connectDB();

///? Health del servicio
app.get("/health", (_req, res) => res.json({ status: "ok", service: SERVICE }));

/// Health DB
app.get("/db/health", async (_req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState; // 1 = conectado
    res.json({ ok: dbStatus === 1 });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

/// GET /products/with-users
app.get("/products/with-users", async (_req, res) => {
  try {
    const products = await Product.find().lean();
    const usersRes = await fetch(`${USERS_API_URL}/users`);
    const users = await usersRes.json();

    res.json({
      products,
      usersCount: Array.isArray(users) ? users.length : 0,
    });
  } catch (e) {
    res.status(502).json({
      error: "No se pudo consultar users-api o DB",
      detail: String(e),
    });
  }
});

/// GET /products
app.get("/products", async (_req, res) => {
  try {
    const products = await Product.find().lean();
    res.json(products);
  } catch (e) {
    res.status(500).json({ error: "query failed", detail: String(e) });
  }
});

/// GET /products/:id
app.get("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (e) {
    res.status(500).json({ error: "query failed", detail: String(e) });
  }
});

/// POST /products
app.post("/products", async (req, res) => {
  try {
    const { name, price } = req.body;
    if (!name || !price)
      return res.status(400).json({ error: "name & price required" });

    const newProduct = new Product({ name, price });
    await newProduct.save();

    res.status(201).json(newProduct);
  } catch (e) {
    res.status(500).json({ error: "insert failed", detail: String(e) });
  }
});

/// PUT /products/:id
app.put("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price } = req.body;
    if (!name || !price)
      return res.status(400).json({ error: "name & price required" });

    const updated = await Product.findByIdAndUpdate(
      id,
      { name, price },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: "Product not found" });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: "update failed", detail: String(e) });
  }
});

/// DELETE /products/:id
app.delete("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Product not found" });
    res.json({ message: "Product deleted", id });
  } catch (e) {
    res.status(500).json({ error: "delete failed", detail: String(e) });
  }
});

app.listen(PORT, () => {
  console.log(`✅ ${SERVICE} listening on http://localhost:${PORT}`);
  console.log(`↔️  USERS_API_URL=${USERS_API_URL}`);
});
