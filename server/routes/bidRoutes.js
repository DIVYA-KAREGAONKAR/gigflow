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

// server/routes/gigs.js (The HIRE route)
router.patch("/:bidId/hire", auth, async (req, res) => {
  try {
    // 1. Find the specific bid and gig
    const bid = await Bid.findById(req.params.bidId);
    if (!bid) return res.status(404).json({ message: "Bid not found" });

    const gig = await Gig.findById(bid.gigId);
    if (!gig) return res.status(404).json({ message: "Gig not found" });

    // 2. Security Check: Only the gig owner can hire
    if (String(gig.ownerId) !== String(req.user.id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    // 3. --- MERGED LOGIC: UPDATE STATUSES ---
    
    // A. Update Gig: Change status to 'hired' and store the winner
    gig.status = "hired"; 
    gig.hiredFreelancer = bid.freelancerId; // Store the freelancer ID on the gig
    await gig.save();

    // B. Update the Winning Bid: Change to 'accepted'
    bid.status = "accepted";
    await bid.save();

    // C. Update Other Bids: Automatically close all other applications
    // This ensures other freelancers see they weren't selected
    await Bid.updateMany(
      { gigId: gig._id, _id: { $ne: bid._id } },
      { status: "closed" }
    );

    // 4. REAL-TIME NOTIFICATION (Socket.io)
    const io = req.app.get("socketio");
    const freelancerId = bid.freelancerId.toString(); 

    if (io) {
      io.to(freelancerId).emit("notification", {
        message: `Congratulations! You have been hired for "${gig.title}"!`,
        gigId: gig._id,
        type: "HIRED"
      });
    }

    // 5. Response: Move to Workspace
    res.json({ 
      message: "Hired successfully. Project moved to Workspace.", 
      bid,
      gigStatus: "hired" 
    });

  } catch (err) {
    console.error("Hire Error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;