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
      const socket = io(import.meta.env.VITE_SOCKET_URL || "https://gigflow-dzfl.onrender.com", {
        withCredentials: true,
        transports: ["polling", "websocket"],
        upgrade: true,
        reconnection: true,
        reconnectionAttempts: 5
      });

      socket.on("connect", () => {
        socket.emit("register", userId);
      });

      socket.on("notification", (data) => {
        toast.success(data.message, {
          duration: 6000,
          position: "top-right", // Modern standard is top-right
          style: {
            background: "#1e1b4b", // Deep indigo-950
            color: "#fff",
            borderRadius: "12px",
            border: "1px solid #4338ca",
            fontSize: "14px",
            padding: "12px"
          },
        });
      });

      return () => {
        socket.off("notification");
        socket.disconnect();
      };
    }
  }, [user]);

  useEffect(() => {
    if (user?._id) {
      const socket = io("https://gigflow-dzfl.onrender.com");
      
      // Register this user to receive global events
      socket.emit("register", user._id);

      socket.on("notification", (data) => {
        if (data.type === "NEW_MESSAGE") {
          toast((t) => (
            <span className="flex flex-col">
              <b className="text-xs uppercase font-black">New Message</b>
              <span className="text-sm italic text-slate-600">{data.message}</span>
              <button 
                onClick={() => {
                    window.location.href = `/workspace/${data.gigId}`;
                    toast.dismiss(t.id);
                }}
                className="mt-2 text-[10px] bg-slate-900 text-white px-3 py-1 rounded font-bold uppercase"
              >
                View Chat
              </button>
            </span>
          ), { duration: 5000, position: 'top-right' });
        }
      });

      return () => socket.disconnect();
    }
  }, [user]);

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
    window.location.reload();
  };

  return (
    // Added sticky positioning and backdrop blur for a "Glass" effect
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 px-8 py-3 flex justify-between items-center">
      <Toaster /> 
      
      {/* LOGO: Tracking-tighter gives it a professional brand look */}
      <Link to="/" className="text-2xl font-black tracking-tighter text-indigo-600 hover:opacity-90 transition-opacity">
        Gig<span className="text-slate-900">Flow</span>
      </Link>
      
      <div className="flex items-center gap-8">
        {/* LINKS: Using slate-600 and font-medium for better readability */}
        <Link to="/" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">
          Browse Gigs
        </Link>
      {user && (
    <Link to="/dashboard" className="text-xs font-black uppercase tracking-widest text-slate-600 hover:text-indigo-600 transition-all">
      My Dashboard
    </Link>
  )}
        {user ? (
          <div className="flex items-center gap-6">
            {user.role === "client" && (
              <Link to="/add-gig" className="bg-indigo-600 text-white text-sm font-bold px-5 py-2.5 rounded-full shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all">
                Post a Gig
              </Link>
            )}
            
            <div className="flex items-center gap-4 pl-6 border-l border-gray-200">
              <div className="flex flex-col items-end">
                <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Welcome</span>
                <span className="text-sm font-bold text-slate-800">{user.name}</span>
              </div>
              <button 
                onClick={logout} 
                className="text-sm font-bold text-rose-500 hover:text-rose-600 px-3 py-1 rounded-lg hover:bg-rose-50 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-indigo-600">
              Login
            </Link>
            <Link to="/register" className="bg-slate-900 text-white text-sm font-bold px-6 py-2.5 rounded-full hover:bg-slate-800 transition-all">
              Join Now
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}