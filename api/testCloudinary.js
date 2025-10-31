import cloudinary from "./config/cloudinary.js";

(async () => {
  try {
    const result = await cloudinary.api.ping();
    console.log("✅ Cloudinary terhubung:", result);
  } catch (err) {
    console.error("❌ Cloudinary gagal konek:", err.message);
  }
})();
