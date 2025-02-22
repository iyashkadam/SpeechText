const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");

// Initialize Express App
const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/UserSpeech", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Import Middleware & Models
const upload = require("./middlewares/upload"); // File upload middleware
const Transcription = require("./models/Transcription"); // MongoDB Model

//  Test API Route
app.get("/", (req, res) => {
  res.send("🚀 Backend is running!");
});

// File Upload Route (Using Multer Middleware)
app.post("/upload", upload.single("audio"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    res.json({
      message: "✅ File uploaded successfully",
      filename: req.file.filename,
    });
  } catch (error) {
    console.error("❌ File upload error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//  Save Transcription Route
app.post("/save-transcription", async (req, res) => {
  const { filename, transcription } = req.body;

  if (!filename || !transcription) {
    return res.status(400).json({ error: "❌ Missing data" });
  }

  try {
    const newTranscription = new Transcription({ filename, transcription });
    await newTranscription.save();
    res.json({ message: "✅ Transcription saved successfully" });
  } catch (error) {
    console.error("❌ Error saving transcription:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
