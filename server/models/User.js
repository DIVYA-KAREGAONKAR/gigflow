const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["client", "freelancer"],
    required: true,
  },
  // --- NEW FIELDS FOR ML MATCHING ---
  skills: {
    type: [String], // Array of strings e.g., ["React", "Node.js", "Python"]
    default: []
  },
  bio: {
    type: String,
    default: ""
  }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);