const express = require("express");
const mongoose = require("mongoose");
const Bid = require("../models/Bid");
const Gig = require("../models/Gig");
const auth = require("../middleware/authMiddleware");
const router = express.Router();

// Submit a bid
router.post("/", auth, async (req, res) => {
  try {
    const bid = await Bid.create({ ...req.body, freelancerId: req.user.id });
    res.json(bid);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET bids for a gig (ONLY OWNER)
router.get("/gig/:gigId", auth, async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.gigId);
    if (!gig) return res.status(404).json({ message: "Gig not found" });

    if (gig.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const bids = await Bid.find({ gigId: gig._id })
      .populate("freelancerId", "name email");

    res.json(bids);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// HIRE FREELANCER (The fixed PATCH route)
router.patch("/:bidId/hire", auth, async (req, res) => {
  try {
    // 1. Find bid and populate freelancer info
    const bid = await Bid.findById(req.params.bidId).populate("freelancerId");
    if (!bid) return res.status(404).json({ message: "Bid not found" });

    const gig = await Gig.findById(bid.gigId);
    if (!gig) return res.status(404).json({ message: "Gig not found" });

    // 2. Security Check
    if (String(gig.ownerId) !== String(req.user.id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    // 3. Update Statuses
    gig.status = "assigned";
    await gig.save();
    bid.status = "hired";
    await bid.save();

    // 4. ✅ FIXED REAL-TIME NOTIFICATION
    const io = req.app.get("socketio");
    
    // Check if freelancerId is a populated object or just an ID
    const freelancerId = bid.freelancerId._id 
      ? bid.freelancerId._id.toString() 
      : bid.freelancerId.toString(); 

    console.log("Notifying freelancer at room ID:", freelancerId);

    if (io) {
      io.to(freelancerId).emit("notification", {
        message: `Congratulations! You have been hired for "${gig.title}"!`,
        gigId: gig._id,
        type: "HIRED"
      });
    }

    res.json({ message: "Hired successfully", bid });
  } catch (err) {
    console.error("Hire Error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;