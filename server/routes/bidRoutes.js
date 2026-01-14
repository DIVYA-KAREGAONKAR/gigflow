const express = require("express");
const mongoose = require("mongoose");
const Bid = require("../models/Bid");
const Gig = require("../models/Gig");
const auth = require("../middleware/authMiddleware");
const router = express.Router();


router.post("/", auth, async (req, res) => {
const bid = await Bid.create({ ...req.body, freelancerId: req.user.id });
res.json(bid);
});


router.get("/:gigId", auth, async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.gigId);

    if (!gig) return res.status(404).json({ message: "Gig not found" });

    // ✅ FIX: Changed gig.owner to gig.ownerId
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

// GET bids for a gig (ONLY OWNER)
router.get("/gig/:gigId", auth, async (req, res) => {
  const gig = await Gig.findById(req.params.gigId);

  if (!gig) {
    return res.status(404).json({ message: "Gig not found" });
  }

  // ❌ Block freelancers
  if (gig.ownerId.toString() !== req.user.id) {
    return res.status(403).json({ message: "Access denied" });
  }

  const bids = await Bid.find({ gigId: gig._id })
    .populate("freelancerId", "name email");

  res.json(bids);
});


// server/routes/bidRoutes.js

// server/routes/bidRoutes.js
router.patch("/:bidId/hire", auth, async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.bidId).populate("freelancerId");
    const gig = await Gig.findById(bid.gigId);

    if (String(gig.ownerId) !== String(req.user.id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    // ... your existing hire logic (status updates, saving) ...
    gig.status = "assigned";
    await gig.save();
    bid.status = "hired";
    await bid.save();

    // ✅ SEND REAL-TIME NOTIFICATION
   // Inside your PATCH /api/bids/:bidId/hire
const io = req.app.get("socketio");
// We use the freelancerId from the Bid document
const freelancerId = String(bid.freelancerId); 

io.to(freelancerId).emit("notification", {
  message: `You have been hired for ${gig.title}!`,
  gigId: gig._id
});

    res.json({ message: "Hired successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;