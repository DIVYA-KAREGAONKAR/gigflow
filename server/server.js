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
  process.env.CLIENT_URL // Ensure this is https://gigflow-1-2m8k.onrender.com
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

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// ✅ FIX 3: Specialized Socket.io Config for Render
const io = new Server(server, {
  cors: corsOptions,
  transports: ["polling", "websocket"], // Force polling first to establish session
  allowEIO3: true, // Enhances compatibility with different client versions
  pingTimeout: 60000,
  pingInterval: 25000
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

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/gigs", require("./routes/gigRoutes"));
app.use("/api/bids", require("./routes/bidRoutes"));

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected to Atlas"))
  .catch((err) => console.log("DB Connection Error:", err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});