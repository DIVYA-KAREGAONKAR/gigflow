const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
// ✅ 3. Middleware with proper CORS setup
app.use(express.json());
app.use(cookieParser());
// ✅ 1. Define Allowed Origins for CORS
const allowedOrigins = [
  "http://localhost:5173",          // Local development
  process.env.CLIENT_URL            // Deployed Frontend URL (from Render env)
];

// ✅ 2. Initialize Socket.io with dynamic CORS
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
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

app.set("socketio", io);



app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("CORS Error: Origin not allowed"));
    }
  },
  credentials: true,
}));

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
  .then(() => console.log("MongoDB Connected to Atlas"))
  .catch((err) => console.log("DB Connection Error:", err));

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});