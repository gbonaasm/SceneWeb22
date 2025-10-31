import Film from "../models/Film.js";

// Ambil semua film
export const getFilms = async (req, res) => {
  try {
    const films = await Film.find().populate("comments.user", "name");
    res.json(films);
  } catch (err) {
    res.status(500).json({ message: "Gagal mengambil film" });
  }
};

// Ambil detail film
export const getFilmById = async (req, res) => {
  try {
    const film = await Film.findById(req.params.id).populate("comments.user", "name");
    if (!film) return res.status(404).json({ message: "Film tidak ditemukan" });
    res.json(film);
  } catch (err) {
    res.status(500).json({ message: "Gagal mengambil detail film" });
  }
};

// Tambah komentar
export const addComment = async (req, res) => {
  try {
    const film = await Film.findById(req.params.id);
    if (!film) return res.status(404).json({ message: "Film tidak ditemukan" });

    film.comments.push({
      user: req.user.id,
      text: req.body.text,
    });

    await film.save();

    const updatedFilm = await Film.findById(req.params.id).populate("comments.user", "name");

    res.json(updatedFilm);
  } catch (err) {
    res.status(500).json({ message: "Gagal menambahkan komentar" });
  }
};

// Like film
export const likeFilm = async (req, res) => {
  try {
    const film = await Film.findById(req.params.id);
    if (!film) return res.status(404).json({ message: "Film tidak ditemukan" });

    const userId = req.user.id;
    if (film.likes.includes(userId)) {
      film.likes = film.likes.filter((id) => id.toString() !== userId);
    } else {
      film.likes.push(userId);
    }

    await film.save();
    res.json(film);
  } catch (err) {
    res.status(500).json({ message: "Gagal like film" });
  }
};

//create film

export const createFilm = async (req, res) => {
  try {
    const { title, description, genre, duration, link } = req.body;

    const thumbnailUrl = req.files?.thumbnail?.[0]?.path || null;
    const videoUrl = req.files?.video?.[0]?.path || null;

    const newFilm = new Film({
      title,
      description,
      genre,
      duration,
      link,
      rating,
      src,
      thumbnail,
      tags
    });

    await newFilm.save();
    res.status(201).json(newFilm);
  } catch (err) {
    console.error("Error creating film:", err);
    res.status(500).json({ message: "Gagal menambahkan film" });
  }
};

// Update film
export const updateFilm = async (req, res) => {
  try {
    const { title, description, genre, duration, rating, src, thumbnail, tags } = req.body;

    const film = await Film.findByIdAndUpdate(
      req.params.id,
      { title, description, genre, duration, rating, src, thumbnail, tags },
      { new: true }
    );

    if (!film) return res.status(404).json({ message: "Film tidak ditemukan" });
    res.json(film);
  } catch (err) {
    console.error("Error update film:", err);
    res.status(500).json({ message: "Gagal update film" });
  }
};

export const deleteFilm = async (req, res) => {
  try {
    const film = await Film.findByIdAndDelete(req.params.id);
    if (!film) return res.status(404).json({ message: "Film tidak ditemukan" });
    res.json({ message: "Film berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ message: "Gagal menghapus film" });
  }
};



