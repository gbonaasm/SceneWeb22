import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import router from "./routes/index.js"; // pastikan ada file index.js di routes

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes utama
app.use("/api", router);

// Untuk cek server
app.get("/", (req, res) => {
  res.send("🚀 API is running successfully!");
});

// Jalankan server
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
