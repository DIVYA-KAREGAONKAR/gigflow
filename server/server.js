const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http"); // Added for Socket.io
const { Server } = require("socket.io"); // Added for Socket.io
require("dotenv").config();

const app = express();
const server = http.createServer(app); // ✅ Correct: Wrap express app

// ✅ Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  },
});

// Store active users
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

// ✅ Attach io to the app so routes can access it via req.app.get("socketio")
app.set("socketio", io);

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

// Route Imports
const authRoutes = require("./routes/authRoutes");
const gigRoutes = require("./routes/gigRoutes");
const bidRoutes = require("./routes/bidRoutes");

// Route Middleware
app.use("/api/auth", authRoutes);
app.use("/api/gigs", gigRoutes);
app.use("/api/bids", bidRoutes);

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("DB Connection Error:", err));

// ✅ CRITICAL CHANGE: Use server.listen, NOT app.listen
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});