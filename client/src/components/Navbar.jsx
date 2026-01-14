import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { io } from "socket.io-client";
import { toast, Toaster } from "react-hot-toast";

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    // Only connect if the user is logged in
    if (user && (user._id || user.id)) {
      const userId = user._id || user.id;
      
      // ✅ Use environment variable for the URL (Render or Localhost)
      // ✅ Add withCredentials: true to allow cookies over Socket.io
      const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
        withCredentials: true,
      });

      // Register this user's ID to receive private notifications
      socket.emit("register", userId);

      // Listen for the 'notification' event from the server
      socket.on("notification", (data) => {
        toast.success(data.message, {
          duration: 6000,
          position: "top-right",
          style: {
            background: "#4f46e5",
            color: "#fff",
            fontWeight: "bold",
          },
        });
      });

      // Cleanup: disconnect when the component unmounts
      return () => {
        socket.off("notification"); // Remove listener before disconnecting
        socket.disconnect();
      };
    }
  }, [user]);

  const logout = () => {
    localStorage.removeItem("user");
    // If you have a logout endpoint on the backend, you should call it here 
    // to clear the HTTP-only cookie as well.
    navigate("/login");
    window.location.reload();
  };

  return (
    <nav className="bg-white shadow py-4 px-6 flex justify-between items-center">
      {/* Required to render the toast alerts */}
      <Toaster /> 
      
      <Link to="/" className="text-2xl font-bold text-indigo-600">GigFlow</Link>
      <div className="flex items-center space-x-4">
        <Link to="/" className="text-gray-600">Browse Gigs</Link>

        {user ? (
          <>
            {user.role === "client" && (
              <Link to="/add-gig" className="bg-indigo-600 text-white px-4 py-2 rounded-lg">
                Post a Gig
              </Link>
            )}
            <button onClick={logout} className="text-red-500 font-medium ml-4">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register" className="border border-indigo-600 px-4 py-2 rounded-lg text-indigo-600">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}