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
const bids = await Bid.find({ gigId: req.params.gigId });
res.json(bids);
});


router.patch("/:bidId/hire", auth, async (req, res) => {
const session = await mongoose.startSession();
session.startTransaction();
try {
const bid = await Bid.findById(req.params.bidId).session(session);
const gig = await Gig.findById(bid.gigId).session(session);


if (gig.status === "assigned") throw new Error("Already assigned");


gig.status = "assigned";
await gig.save();


bid.status = "hired";
await bid.save();


await Bid.updateMany(
{ gigId: gig._id, _id: { $ne: bid._id } },
{ status: "rejected" }
).session(session);


await session.commitTransaction();
res.json({ message: "Hired successfully" });
} catch (err) {
await session.abortTransaction();
res.status(400).json({ error: err.message });
}
});


module.exports = router;