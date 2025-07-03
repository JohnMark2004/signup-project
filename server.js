// server.js

require("dotenv").config(); // Load variables from .env

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB using environment variable
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) =>
    console.error("❌ MongoDB connection error:", err.message)
  );

// User schema
const User = mongoose.model(
  "User",
  new mongoose.Schema({
    username: String,
    password: String,
  })
);

// Signup route
app.post("/signup", async (req, res) => {
  try {
    const { username, password } = req.body;

    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = new User({ username, password });
    await newUser.save();

    res.status(201).json({ message: "✅ Signup successful" });
  } catch (error) {
    res.status(500).json({ message: "❌ Signup failed", error: error.message });
  }
});

// Login route
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username, password });
    if (!user) {
      return res.status(401).json({ message: "❌ Invalid credentials" });
    }

    res.status(200).json({ message: "✅ Login successful" });
  } catch (error) {
    res.status(500).json({ message: "❌ Login failed", error: error.message });
  }
});

// Root route for testing
app.get("/", (req, res) => {
  res.send("✅ Backend is running");
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is live on http://localhost:${PORT}`);
});
