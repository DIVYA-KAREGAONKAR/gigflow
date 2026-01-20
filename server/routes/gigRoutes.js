const express = require("express");
const Gig = require("../models/Gig");
const auth = require("../middleware/authMiddleware");
const router = express.Router();

// CONSOLIDATED SEARCH & FILTER ROUTE
router.get("/", async (req, res) => {
  try {
    const { search, min, max, verified, cats } = req.query;
    
    // Always start with "open" status to show available work
    let mongoQuery = { status: "open" };

    // 01. Title Search
    if (search) {
      mongoQuery.title = { $regex: search, $options: "i" };
    }
  
    // 02. Budget Logic (Converts URL strings to Numbers)
    if (min || max) {
      mongoQuery.budget = {};
      if (min) mongoQuery.budget.$gte = Number(min);
      if (max) mongoQuery.budget.$lte = Number(max);
    }

    // 03. Category Logic (Handles the "+" and spaces from URL)
    if (cats) {
      // Splits the comma-separated string from your frontend into an array
      const categoryArray = decodeURIComponent(cats).split(',');
      mongoQuery.category = { $in: categoryArray };
    }

    // 04. Security Toggle (Checks your new schema field)
    if (verified === "true") {
      mongoQuery.isVerifiedClient = true;
    }

    const results = await Gig.find(mongoQuery).sort({ createdAt: -1 });
    res.json(results);
  } catch (err) {
    console.error("FILTER ERROR:", err);
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