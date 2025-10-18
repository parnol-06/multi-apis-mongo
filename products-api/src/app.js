import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import { pool } from "./db.js"; // 🔹 conexión a PostgreSQL (usa PRODUCTS_DATABASE_URL del .env)

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4002;
const SERVICE = process.env.SERVICE_NAME || "products-api";
const USERS_API_URL = process.env.USERS_API_URL || "http://users-api:4001";

/// Health del servicio
app.get("/health", (_req, res) => res.json({ status: "ok", service: SERVICE }));

/// Health DB
app.get("/db/health", async (_req, res) => {
  try {
    const r = await pool.query("SELECT 1 AS ok");
    res.json({ ok: r.rows[0].ok === 1 });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

/// GET /products/with-users
app.get("/products/with-users", async (_req, res) => {
  try {
    const r = await pool.query("SELECT id, name, price FROM products_schema.products ORDER BY id ASC");
    const products = r.rows;

    const usersRes = await fetch(`${USERS_API_URL}/users`);
    const users = await usersRes.json();

    res.json({
      products,
      usersCount: Array.isArray(users) ? users.length : 0
    });
  } catch (e) {
    res.status(502).json({ error: "No se pudo consultar users-api o DB", detail: String(e) });
  }
});

/// GET /products
app.get("/products", async (_req, res) => {
  try {
    const r = await pool.query("SELECT id, name, price FROM products_schema.products ORDER BY id ASC");
    res.json(r.rows);
  } catch (e) {
    res.status(500).json({ error: "query failed", detail: String(e) });
  }
});

// GET /products/:id
app.get("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const r = await pool.query("SELECT id, name, price FROM products_schema.products WHERE id = $1", [id]);
    if (r.rows.length === 0) return res.status(404).json({ error: "Product not found" });
    res.json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: "query failed", detail: String(e) });
  }
});

/// POST /products
app.post("/products", async (req, res) => {
  try {
    const { name, price } = req.body;
    if (!name || !price) return res.status(400).json({ error: "name & price required" });

    const r = await pool.query(
      "INSERT INTO products_schema.products(name, price) VALUES($1, $2) RETURNING id, name, price",
      [name, price]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: "insert failed", detail: String(e) });
  }
});

//// PUT /products/:id
app.put("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price } = req.body;
    if (!name || !price) return res.status(400).json({ error: "name & price required" });

    const r = await pool.query(
      "UPDATE products_schema.products SET name = $1, price = $2 WHERE id = $3 RETURNING id, name, price",
      [name, price, id]
    );
    if (r.rows.length === 0) return res.status(404).json({ error: "Product not found" });
    res.json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: "update failed", detail: String(e) });
  }
});

/// DELETE /products/:id
app.delete("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const r = await pool.query("DELETE FROM products_schema.products WHERE id = $1 RETURNING id", [id]);
    if (r.rows.length === 0) return res.status(404).json({ error: "Product not found" });
    res.json({ message: "Product deleted", id });
  } catch (e) {
    res.status(500).json({ error: "delete failed", detail: String(e) });
  }
});

app.listen(PORT, () => {
  console.log(`✅ ${SERVICE} listening on http://localhost:${PORT}`);
  console.log(`↔️  USERS_API_URL=${USERS_API_URL}`);
});
