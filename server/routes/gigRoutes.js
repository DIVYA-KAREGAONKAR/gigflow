const express = require("express");
const Gig = require("../models/Gig");
const auth = require("../middleware/authMiddleware");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/User");
// server/routes/gigs.js
const jwt = require('jsonwebtoken'); // Ensure you have this to check the token
// server/routes/gigRoutes.js
const Message = require("../models/Message");
// server/routes/gigRoutes.js
const axios = require('axios');
// server/routes/gigRoutes.js

const ML_URL = "https://divyakaregaonkar-gigflow.hf.space/match";

const getMatchScore = async (user, gig) => {
    try {
        const response = await axios.post(ML_URL, {
            user_skills: user.skills.join(" "),
            gig_skills: `${gig.title} ${gig.description}`
        }, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 15000 // Increased to 15 seconds for cold-starts
        });

        return response.data.score || 0;
    } catch (error) {
        // Log specifically if it was a timeout or a different error
        if (error.code === 'ECONNABORTED') {
            console.error(`Timeout: HF Space at ${ML_URL} is taking too long to respond.`);
        } else {
            console.error("HF Service Error:", error.message);
        }
        return 0; 
    }
};
// server/routes/gigs.js

router.post("/get-match", async (req, res) => {
    try {
        const { userSkills, gigSkills } = req.body;

        if (!userSkills || !gigSkills) {
            return res.status(400).json({ error: "Skills data missing" });
        }

        // Call the Hugging Face Microservice
        const response = await axios.post(ML_URL, {
            user_skills: Array.isArray(userSkills) ? userSkills.join(" ") : userSkills, 
            gig_skills: Array.isArray(gigSkills) ? gigSkills.join(" ") : gigSkills
        }, {
            timeout: 10000 // Give it 10 seconds to respond
        });

        res.json({ matchScore: response.data.score });
    } catch (error) {
        // Detailed logging to help you debug on your ThinkPad
        console.error("ML Service Error Details:", error.response?.data || error.message);
        
        // Return 0 so the UI doesn't crash, but you'll know there's an error
        res.json({ matchScore: 0, error: "AI Service currently unavailable" });
    }
});

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
    
    // 1. Auth Logic (Existing)
    const token = req.cookies.token; 
    let userId = null;
    let currentUser = null; 

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
        // FETCH the user from DB to get their skills array
        const User = require("../models/User"); // Ensure User model is imported
        currentUser = await User.findById(userId);
      } catch (err) { /* invalid token */ }
    }

    // 2. BASE QUERY (Existing)
    let mongoQuery = {
      $or: [
        { status: "open" },
        ...(userId ? [
          { ownerId: new mongoose.Types.ObjectId(userId) }, 
          { hiredFreelancer: new mongoose.Types.ObjectId(userId) }
        ] : [])
      ]
    };

    // 3. APPLY FILTERS (Existing)
    const filters = [];
    if (search) filters.push({ title: { $regex: search, $options: "i" } });
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
    if (verified === "true") filters.push({ isVerifiedClient: true });

    if (filters.length > 0) {
      mongoQuery = { $and: [ { $or: mongoQuery.$or }, ...filters ] };
    }

    // 4. FETCH RESULTS
    const results = await Gig.find(mongoQuery).sort({ createdAt: -1 }).lean(); 
    // .lean() is important so we can add new properties like matchScore to the object

    // --- 5. NEW: INTEGRATE THE AI MATCH SCORE ---
    // If we have a freelancer with skills, calculate scores for all open gigs
    if (currentUser && currentUser.role === "freelancer" && currentUser.skills?.length > 0) {
      const resultsWithScores = await Promise.all(results.map(async (gig) => {
        // Only match for 'open' gigs (no need to match for gigs you're already hired for)
        if (gig.status === "open") {
          const score = await getMatchScore(currentUser, gig);
          return { ...gig, matchScore: score };
        }
        return gig;
      }));
      
      return res.json(resultsWithScores);
    }

    // Default return if no user/no skills
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