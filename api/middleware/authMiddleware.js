import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      console.log("🔑 Token diterima:", token);

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("✅ Token decoded:", decoded);

      req.user = await User.findById(decoded.id).select("-password");
      console.log("👤 User ditemukan:", req.user);

      if (!req.user) return res.status(401).json({ message: "User tidak ditemukan" });
      next();
    } catch (err) {
      console.error("❌ Auth error:", err.message);
      res.status(401).json({ message: "Token tidak valid" });
    }
  } else {
    console.warn("⚠️ Tidak ada Authorization header");
    res.status(401).json({ message: "Tidak ada token" });
  }
};


export const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as admin" });
  }
};
