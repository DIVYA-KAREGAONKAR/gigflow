const mongoose = require("mongoose");

const gigSchema = new mongoose.Schema({
  title: String,
  description: String,
  budget: Number,
  category: { type: String, default: "General" }, 
  isVerifiedClient: { type: Boolean, default: false },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  // 1. Ensure 'hired' is in the enum
  status: { 
    type: String, 
    enum: ["open", "assigned", "hired", "completed"], 
    default: "open" 
  },
  // 2. ADD THIS FIELD (The missing link):
  hiredFreelancer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    default: null 
  }
}, { timestamps: true });

module.exports = mongoose.model("Gig", gigSchema);