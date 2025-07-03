const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB connected"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

// Mongoose model
const User = mongoose.model("User", new mongoose.Schema({
  username: String,
  password: String
}));

// Signup
app.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  const existingUser = await User.findOne({ username });

  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const newUser = new User({ username, password });
  await newUser.save();
  res.status(201).json({ message: "✅ Signup successful" });
});

// Login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const foundUser = await User.findOne({ username, password });

  if (!foundUser) {
    return res.status(400).json({ message: "❌ Invalid credentials" });
  }

  res.status(200).json({ message: "✅ Login successful" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
