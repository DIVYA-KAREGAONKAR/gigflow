const express = require("express");
const Gig = require("../models/Gig");
const auth = require("../middleware/authMiddleware");
const router = express.Router();
const mongoose = require("mongoose");

// server/routes/gigs.js
const jwt = require('jsonwebtoken'); // Ensure you have this to check the token
// server/routes/gigRoutes.js
const Message = require("../models/Message");

router.get("/:id/messages", async (req, res) => {
  try {
    const messages = await Message.find({ gigId: req.params.id }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});
router.get("/", async (req, res) => {
  try {
    const { search, min, max, verified, cats } = req.query;
    
    // 1. Get the user ID from the token
    const token = req.cookies.token; 
    let userId = null;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id; // Ensure your JWT payload uses 'id'
      } catch (err) { /* invalid token */ }
    }

    // 2. BASE QUERY: (Open Gigs) OR (Gigs I own) OR (Gigs I'm hired for)
    let mongoQuery = {
      $or: [
        { status: "open" },
        ...(userId ? [
          { ownerId: new mongoose.Types.ObjectId(userId) }, 
          { hiredFreelancer: new mongoose.Types.ObjectId(userId) }
        ] : [])
      ]
    };

    // 3. APPLY ADDITIONAL FILTERS
    // We wrap these in an 'AND' condition so they apply TO the results of the $or
    const filters = [];

    if (search) {
      filters.push({ title: { $regex: search, $options: "i" } });
    }
  
    if (min || max) {
      let budgetFilter = {};
      if (min) budgetFilter.$gte = Number(min);
      if (max) budgetFilter.$lte = Number(max);
      filters.push({ budget: budgetFilter });
    }

    if (cats) {
      const categoryArray = decodeURIComponent(cats).split(',');
      filters.push({ category: { $in: categoryArray } });
    }

    if (verified === "true") {
      filters.push({ isVerifiedClient: true });
    }

    // If we have additional filters, merge them with the base $or query
    if (filters.length > 0) {
      mongoQuery = { $and: [ { $or: mongoQuery.$or }, ...filters ] };
    }

    const results = await Gig.find(mongoQuery).sort({ createdAt: -1 });
    res.json(results);

  } catch (err) {
    console.error("DASHBOARD FETCH ERROR:", err);
    res.status(500).json({ message: "Server error during filtering" });
  }
});
// GET SINGLE GIG
router.get("/:id", async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).json({ message: "Gig not found" });
    res.json(gig);
  } catch (err) {
    res.status(500).json({ message: "Error fetching gig details" });
  }
});

// POST NEW GIG
router.post("/", auth, async (req, res) => {
  try {
    // req.user.id comes from your authMiddleware decoding the token/cookie
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