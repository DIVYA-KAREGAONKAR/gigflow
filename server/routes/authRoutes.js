const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();


router.post("/register", async (req, res) => {
const hashed = await bcrypt.hash(req.body.password, 10);
await User.create({ ...req.body, password: hashed });
res.json({ message: "Registered" });
});


router.post("/login", async (req, res) => {
const user = await User.findOne({ email: req.body.email });
if (!user) return res.status(400).json({ message: "Invalid" });


const match = await bcrypt.compare(req.body.password, user.password);
if (!match) return res.status(400).json({ message: "Invalid" });


const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
res.cookie("token", token, { httpOnly: true });
res.json({ message: "Logged in" });
});


module.exports = router;