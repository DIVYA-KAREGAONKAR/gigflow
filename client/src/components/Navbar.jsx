import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { toast, Toaster } from "react-hot-toast";

export default function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));

  useEffect(() => {
    if (user && (user._id || user.id)) {
      const userId = user._id || user.id;
      
      // ✅ FIX: Enhanced Connection settings for Render
      const socket = io(import.meta.env.VITE_SOCKET_URL || "https://gigflow-dzfl.onrender.com", {
        withCredentials: true,
        transports: ["polling", "websocket"], // Always start with polling on Render
        upgrade: true,
        reconnection: true,
        reconnectionAttempts: 5
      });

      socket.on("connect", () => {
        console.log("Socket Connected. Registering user:", userId);
        socket.emit("register", userId);
      });

      // ✅ FIX: Catch connection errors for debugging
      socket.on("connect_error", (err) => {
        console.error("Socket Connection Error:", err.message);
      });

      socket.on("notification", (data) => {
        toast.success(data.message, {
          duration: 8000,
          position: "top-center",
          style: {
            background: "#4f46e5",
            color: "#fff",
            fontSize: "16px",
            padding: "16px"
          },
        });
      });

      return () => {
        socket.off("notification");
        socket.disconnect();
      };
    }
  }, [user]);

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
    window.location.reload();
  };

  return (
    <nav className="bg-white shadow py-4 px-6 flex justify-between items-center">
      <Toaster /> 
      <Link to="/" className="text-2xl font-bold text-indigo-600">GigFlow</Link>
      
      <div className="flex items-center space-x-4">
        <Link to="/" className="text-gray-600 hover:text-indigo-600">Browse Gigs</Link>

        {user ? (
          <>
            {user.role === "client" && (
              <Link to="/add-gig" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
                Post a Gig
              </Link>
            )}
            <div className="flex items-center space-x-4 ml-4 border-l pl-4">
              <span className="text-sm font-medium text-gray-500">Hi, {user.name}</span>
              <button onClick={logout} className="text-red-500 font-medium hover:underline">Logout</button>
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className="text-gray-600">Login</Link>
            <Link to="/register" className="border border-indigo-600 px-4 py-2 rounded-lg text-indigo-600 hover:bg-indigo-50">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}