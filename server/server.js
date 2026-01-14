const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();

// ✅ FIX 1: Trust Proxy (Required for Render/HTTPS cookies)
app.set("trust proxy", 1); 

const server = http.createServer(app);

// ✅ Define Allowed Origins
const allowedOrigins = [
  "http://localhost:5173",          
  process.env.CLIENT_URL            
];

// ✅ FIX 2: Standardize CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("CORS Error: Origin not allowed"));
    }
  },
  credentials: true, // Required for cookies
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

// ✅ FIX 3: Initialize Middleware in the CORRECT Order
app.use(cors(corsOptions)); // CORS must be near the top
app.use(express.json());
app.use(cookieParser()); // Must be before routes

// ✅ Initialize Socket.io with the same CORS options
const io = new Server(server, {
  cors: corsOptions,
});

// Socket.io Logic
let activeUsers = {};
io.on("connection", (socket) => {
  socket.on("register", (userId) => {
    activeUsers[userId] = socket.id;
    socket.join(userId);
    console.log(`User ${userId} registered for notifications`);
  });

  socket.on("disconnect", () => {
    for (let userId in activeUsers) {
      if (activeUsers[userId] === socket.id) {
        delete activeUsers[userId];
        break;
      }
    }
  });
});

app.set("socketio", io);

// Route Imports
const authRoutes = require("./routes/authRoutes");
const gigRoutes = require("./routes/gigRoutes");
const bidRoutes = require("./routes/bidRoutes");

// Route Middleware
app.use("/api/auth", authRoutes);
app.use("/api/gigs", gigRoutes);
// Note: Ensure your gigRoutes.js uses the 'auth' middleware for POST requests
app.use("/api/bids", bidRoutes);

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected to Atlas"))
  .catch((err) => console.log("DB Connection Error:", err));

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});