const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// Load .env
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Default route to verify deployment
app.get("/", (req, res) => {
  res.status(200).send("✅ SceneWeb22 API is running on Railway!");
});

// Example route (optional)
const filmRoutes = require("./routes/filmRoutes");
app.use("/api/films", filmRoutes);

// Railway-provided PORT
const PORT = process.env.PORT || 3000;

// Listen on 0.0.0.0 so Railway can detect it
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
