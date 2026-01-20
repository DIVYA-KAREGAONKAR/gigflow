const mongoose = require("mongoose");

const gigSchema = new mongoose.Schema({
  title: String,
  description: String,
  budget: Number,
  // Add these two fields:
  category: { type: String, default: "General" }, 
  isVerifiedClient: { type: Boolean, default: false },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: { type: String, enum: ["open", "assigned"], default: "open" }
}, { timestamps: true });

module.exports = mongoose.model("Gig", gigSchema);