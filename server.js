const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// ✅ MongoDB connection
mongoose.connect("mongodb+srv://jmlumada:kyouchin123@cluster0.blhjdfa.mongodb.net/userAuthDB?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ User model
const User = mongoose.model("User", new mongoose.Schema({
  username: String,
  password: String,
}));

// ✅ Default route (optional)
app.get("/", (req, res) => {
  res.send("🚀 Backend is working!");
});

// ✅ Signup route
app.post("/signup", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if user exists
    const exists = await User.findOne({ username });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = new User({ username, password });
    await newUser.save();

    res.status(201).json({ message: "✅ User signed up successfully!" });
  } catch (error) {
    res.status(500).json({ message: "❌ Server error", error });
  }
});

// Login route
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "❌ User not found" });
    }

    // Compare passwords (no hash yet)
    if (user.password !== password) {
      return res.status(401).json({ message: "❌ Incorrect password" });
    }

    res.status(200).json({ message: "✅ Login successful!" });
  } catch (error) {
    res.status(500).json({ message: "❌ Server error", error });
  }
});


// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
