import express from "express";
import Film from "../models/Film.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import { getFilms, getFilmById, addComment, likeFilm } from "../controllers/filmController.js";
import {updateFilm} from "../controllers/filmController.js";
import { deleteFilm } from "../controllers/filmController.js";
import { v2 as cloudinary } from "cloudinary";
import upload, { uploadFields } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// ✅ GET semua film
router.get("/", async (req, res) => {
  try {
    const films = await Film.find();
    res.json(films);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ GET film by ID
router.get("/:id", async (req, res) => {
  try {
    const film = await Film.findById(req.params.id)
      .populate("comments.user", "name"); // ✅ ambil nama user dari komentar
    if (!film) return res.status(404).json({ message: "Film tidak ditemukan" });
    res.json(film);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Tambah film (admin only)
// ✅ Tambah film dengan upload thumbnail & video ke Cloudinary
/// ✅ Tambah film baru (ADMIN)
router.post("/", protect, admin, uploadFields, async (req, res) => {
  try {
    const { title, description, genre, duration, rating, tags } = req.body;

    // Pastikan file diterima
    if (!req.files || !req.files.thumbnail || !req.files.video) {
      return res.status(400).json({ message: "Thumbnail dan video wajib diupload" });
    }

    const thumbnailFile = req.files.thumbnail[0];
    const videoFile = req.files.video[0];

    console.log("📂 File diterima:", {
      thumbnail: thumbnailFile.originalname,
      video: videoFile.originalname,
    });

    // Upload ke Cloudinary
    const thumbResult = await cloudinary.uploader.upload(thumbnailFile.path, {
      resource_type: "image",
      folder: "films",
    });

    const videoResult = await cloudinary.uploader.upload(videoFile.path, {
      resource_type: "video",
      folder: "films",
    });

    console.log("✅ Upload sukses ke Cloudinary");

    const newFilm = new Film({
      title,
      description,
      genre,
      duration,
      rating,
      tags: tags ? tags.split(",").map((t) => t.trim()) : [],
      thumbnail: thumbResult.secure_url,
      src: videoResult.secure_url,
    });

    await newFilm.save();

    console.log("🎬 Film tersimpan:", newFilm.title);
    res.status(201).json(newFilm);
  } catch (err) {
    console.error("❌ Gagal menyimpan film:", err);
    res.status(500).json({ message: err.message });
  }
});




// ✅ Update film (ADMIN)
router.put("/:id", protect, admin, uploadFields, async (req, res) => {
  try {
    const { title, description, genre, duration, rating, tags } = req.body;
    const updateData = { title, description, genre, duration, rating };

    // Kalau ada tags
    if (tags) {
      updateData.tags = Array.isArray(tags)
        ? tags
        : tags.split(",").map((t) => t.trim());
    }

    // Kalau ada file baru → upload ke Cloudinary
    if (req.files?.thumbnail?.[0]) {
      const thumbResult = await cloudinary.uploader.upload(req.files.thumbnail[0].path, {
        resource_type: "image",
        folder: "films",
      });
      updateData.thumbnail = thumbResult.secure_url;
    }

    if (req.files?.video?.[0]) {
      const videoResult = await cloudinary.uploader.upload(req.files.video[0].path, {
        resource_type: "video",
        folder: "films",
      });
      updateData.src = videoResult.secure_url;
    }

    // Update ke MongoDB
    const updatedFilm = await Film.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    if (!updatedFilm)
      return res.status(404).json({ message: "Film tidak ditemukan" });

    console.log("✅ Film berhasil diupdate:", updatedFilm.title);
    res.json(updatedFilm);
  } catch (err) {
    console.error("❌ Gagal update film:", err);
    res.status(500).json({ message: err.message });
  }
});


// ✅ Like film
// Like / Unlike
router.post("/:id/like", protect, async (req, res) => {
  try {
    const film = await Film.findById(req.params.id);
    if (!film) return res.status(404).json({ message: "Film tidak ditemukan" });

    const userId = req.user._id.toString();

    if (film.likes.some((id) => id.toString() === userId)) {
      // sudah like → unlike
      film.likes = film.likes.filter((id) => id.toString() !== userId);
    } else {
      // belum like → tambahkan
      film.likes.push(req.user._id);
    }

    await film.save();
    res.json(film);
  } catch (err) {
    console.error("❌ Like error:", err);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
});

// ✅ Tambah komentar
router.post("/:id/comment", protect, async (req, res) => {
  try {
    const film = await Film.findById(req.params.id);
    if (!film) return res.status(404).json({ message: "Film tidak ditemukan" });

    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "Komentar tidak boleh kosong" });

    film.comments.push({ user: req.user._id, text });
    await film.save();

    const updatedFilm = await Film.findById(req.params.id).populate("comments.user", "name");
    res.json(updatedFilm);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



router.delete("/:id", protect, admin, deleteFilm);


export default router;
