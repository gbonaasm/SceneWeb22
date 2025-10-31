import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import cloudinary from "cloudinary";

// 🧠 Path setup (karena ES Module)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 📦 Load .env dari folder ini
dotenv.config({ path: path.join(__dirname, ".env") });

// 🛠 Debug: cek apakah env terbaca
console.log("🔍 Loaded ENV:");
console.log({
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI ? "✅ Loaded" : "❌ Missing",
  CLOUDINARY: process.env.CLOUDINARY_CLOUD_NAME ? "✅ Loaded" : "❌ Missing",
});

import filmRoutes from "./routes/filmRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";

// 🚀 Express setup
const app = express();
app.use(cors());
app.use(express.json());

// ☁️ Cloudinary setup
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 🧩 MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err.message));

// 🧭 Routes
app.get("/", (req, res) => {
  res.send("🎬 SceneWeb API is running...");
});

app.use("/api/films", filmRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);

// 🧱 Handle unknown routes
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// 🚀 Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
