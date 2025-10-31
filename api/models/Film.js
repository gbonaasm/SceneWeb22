// models/Film.js
import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  text: String,
  createdAt: { type: Date, default: Date.now },
});

const filmSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    genre: String,
    duration: String, // biarkan string, bisa "90", "1j 30m", dll
    rating: Number,
    src: String, // link video
    thumbnail: String, // untuk gambar preview
    tags: [String],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [commentSchema],
  },
  { timestamps: true }
);

const Film = mongoose.model("Film", filmSchema);
export default Film;
