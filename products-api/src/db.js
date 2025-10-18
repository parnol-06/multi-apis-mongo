// src/db.js
import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME || "productsdb";

export async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI, {
      dbName: DB_NAME,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Conectado a Cosmos DB (MongoDB API)");
  } catch (error) {
    console.error("❌ Error al conectar con MongoDB:", error.message);
    process.exit(1);
  }
}
