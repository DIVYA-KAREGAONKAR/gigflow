const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  gigId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Gig", 
    required: true 
  },
  sender: { 
    type: String, 
    required: true 
  },
  text: { 
    type: String, 
    required: true 
  },
  time: { 
    type: String, 
    required: true 
  }
}, { timestamps: true });

module.exports = mongoose.model("Message", messageSchema);