require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();
const PORT = process.env.PORT || 3000;

// Security Middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// CORS Configuration
const allowedOrigins = [
  'https://signup-project-two.vercel.app',
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// User model
const User = mongoose.model("User", new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}));

// Routes
app.get("/", (req, res) => {
  res.send("🚀 Backend is working!");
});

app.post("/signup", async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Input validation
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const exists = await User.findOne({ username });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ 
      username, 
      password: hashedPassword 
    });
    
    await newUser.save();
    res.status(201).json({ message: "✅ User signed up successfully!" });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "❌ Server error", error: error.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Input validation
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "❌ User not found" });
    }

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "❌ Incorrect password" });
    }

    res.status(200).json({ 
      message: "✅ Login successful!",
      user: {
        username: user.username
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "❌ Server error", error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something broke!", error: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
