import connectDB from "../config/db.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export default async function handler(req, res) {
  await connectDB();

  const { method, url } = req;

  try {
    // =======================
    // REGISTER USER
    // =======================
    if (method === "POST" && url.endsWith("/register")) {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ message: "Semua field wajib diisi" });
      }

      const exist = await User.findOne({ email });
      if (exist) {
        return res.status(400).json({ message: "Email sudah digunakan" });
      }

      const user = new User({ name, email, password, role: "user" });
      await user.save();

      return res.status(201).json({ message: "User berhasil dibuat", user });
    }

    // =======================
    // REGISTER ADMIN (manual / Postman)
    // =======================
    if (method === "POST" && url.endsWith("/register-admin")) {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ message: "Semua field wajib diisi" });
      }

      const exist = await User.findOne({ email });
      if (exist) {
        return res.status(400).json({ message: "Email sudah digunakan" });
      }

      const admin = new User({ name, email, password, role: "admin" });
      await admin.save();

      return res.status(201).json({ message: "Admin berhasil dibuat", admin });
    }

    // =======================
    // LOGIN (user & admin)
    // =======================
    if (method === "POST" && url.endsWith("/login")) {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "Email tidak ditemukan" });
      }

      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(400).json({ message: "Password salah" });
      }

      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "30d" }
      );

      return res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
      });
    }

    // =======================
    // METHOD NOT ALLOWED
    // =======================
    return res.status(405).json({ message: `Method ${method} tidak diizinkan` });
  } catch (err) {
    console.error("❌ Error handler auth:", err);
    res.status(500).json({ message: err.message });
  }
}
