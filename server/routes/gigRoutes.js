const express = require("express");
const Gig = require("../models/Gig");
const auth = require("../middleware/authMiddleware");
const router = express.Router();


router.get("/", async (req, res) => {
const search = req.query.search || "";
const gigs = await Gig.find({
status: "open",
title: { $regex: search, $options: "i" }
});
res.json(gigs);
});

router.get("/:id", async (req, res) => {
  const gig = await Gig.findById(req.params.id);
  if (!gig) return res.status(404).json({ message: "Gig not found" });
  res.json(gig);
});


router.post("/", auth, async (req, res) => {
  try {
    // req.user.id comes from your authMiddleware decoding the cookie
    const gig = await Gig.create({ 
      ...req.body, 
      ownerId: req.user.id 
    });
    res.status(201).json(gig);
  } catch (err) {
    console.error("GIG POST ERROR:", err);
    res.status(500).json({ message: "Failed to create gig" });
  }
});


module.exports = router;