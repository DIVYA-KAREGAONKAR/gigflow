const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

// Route Imports
const aiRoutes = require("./routes/ai"); 
const authRoutes = require("./routes/authRoutes");
const gigRoutes = require("./routes/gigRoutes");
const bidRoutes = require("./routes/bidRoutes");

const app = express();

// ✅ FIX 1: Trust Proxy (Required for Render/HTTPS cookies)
app.set("trust proxy", 1); 

const server = http.createServer(app);

// ✅ Define Allowed Origins
const allowedOrigins = [
  "http://localhost:5173",          
  process.env.CLIENT_URL // e.g., https://gigflow-1-2m8k.onrender.com
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
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// ✅ FIX 3: Specialized Socket.io Config for Render & Real-time Chat
const io = new Server(server, {
  cors: corsOptions,
  transports: ["polling", "websocket"],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000
});

// --- SOCKET.IO REAL-TIME LOGIC ---
let activeUsers = {};

io.on("connection", (socket) => {
  console.log("New connection established:", socket.id);

  // 01. Global Registration (For Hired/Applied Notifications)
  socket.on("register", (userId) => {
    activeUsers[userId] = socket.id;
    socket.join(userId);
    console.log(`User ${userId} registered for global notifications`);
  });

  // 02. Join Private Workspace Room (For Chat)
  socket.on("join_workspace", (gigId) => {
    socket.join(gigId);
    console.log(`Socket ${socket.id} joined project room: ${gigId}`);
  });

  // 03. Handle Real-time Chat Messaging
  socket.on("send_message", (data) => {
    // data expected: { gigId, senderName, text, time }
    // io.to(gigId) ensures only users in this specific project see the chat
    io.to(data.gigId).emit("receive_message", {
      sender: data.senderName,
      text: data.text,
      time: data.time
    });
  });

  socket.on("disconnect", () => {
    for (let userId in activeUsers) {
      if (activeUsers[userId] === socket.id) {
        delete activeUsers[userId];
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });
});

// Make io accessible in other routes (like for hire notifications)
app.set("socketio", io);

// --- ROUTES ---
app.use("/api/ai", aiRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/gigs", gigRoutes);
app.use("/api/bids", bidRoutes);

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected to Atlas"))
  .catch((err) => console.log("DB Connection Error:", err));

// --- SERVER INITIALIZATION ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});