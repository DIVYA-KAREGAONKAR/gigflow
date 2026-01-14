const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

/* =====================
   GET CURRENT USER
===================== */
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

/* =====================
   REGISTER
===================== */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 🔴 Validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields required" });
    }

    // 🔴 Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 🔴 Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔴 Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    res.status(201).json({ message: "Registered successfully" });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: "Server error during register" });
  }
});

/* =====================
   LOGIN
===================== */
/* =====================
   LOGIN (Updated)
===================== */
router.post("/login", async (req, res) => {
  // ... (keep your existing user finding and bcrypt logic)

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  // ✅ CRITICAL CHANGES FOR PRODUCTION
  res.cookie("token", token, {
    httpOnly: true,
    secure: true,      // Required for HTTPS on Render
    sameSite: "none",  // Required for Cross-Site cookie sharing
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.json({ 
    message: "Logged in",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role 
    }
  });
});

module.exports = router;
