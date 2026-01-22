import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/axios";
import { io } from "socket.io-client";
import Navbar from "../components/Navbar";
import { toast, Toaster } from "react-hot-toast";

export default function Workspace() {
  const { id } = useParams();
  const [gig, setGig] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const socket = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
    try {
      const gigRes = await api.get(`/gigs/${id}`);
      
      // FIX: Check if gig is 'hired' OR 'completed'
      if (gigRes.data.status !== "hired" && gigRes.data.status !== "completed") {
         toast.error("This workspace is not active.");
         // navigate("/") // Optional: send them back to dashboard
         return;
      }

      const userRes = await api.get("/auth/me");
      const msgRes = await api.get(`/gigs/${id}/messages`);
      
      setGig(gigRes.data);
      setUser(userRes.data);
      setMessages(msgRes.data);
    } catch (err) {
      console.error("Data fetch error", err);
    }
  };
  fetchData();

    socket.current = io("https://gigflow-dzfl.onrender.com", {
      transports: ["websocket", "polling"],
      withCredentials: true
    });

    socket.current.on("connect", () => {
      socket.current.emit("join_workspace", id);
    });

    socket.current.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      if (socket.current) {
        socket.current.off("receive_message");
        socket.current.disconnect();
      }
    };
  }, [id]);

  // NEW: Handle final funds release
  const handleRelease = async () => {
  try {
    setLoading(true);
    await api.post("/gigs/release-payment", { gigId: gig._id });
    toast.success("Funds released! Project is now complete.");
    
    // INSTEAD OF RELOAD: Just update the local gig status
    setGig(prev => ({ ...prev, status: "completed" })); 
    
  } catch (err) {
    toast.error("Release failed. Check server logs.");
  } finally {
    setLoading(false);
  }
};

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim() || !user || !gig) return;

    const recipientId = (user.role === 'client') ? gig.hiredFreelancer : gig.ownerId;

    const messageData = {
      gigId: id,
      recipientId: recipientId,
      senderName: user.name,
      text: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    socket.current.emit("send_message", messageData);
    setMessages((prev) => [...prev, { sender: user.name, text: input, time: messageData.time }]);
    setInput("");
  };

  if (!gig) return <div className="p-20 text-center font-black italic">Loading Workspace...</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <Toaster />
      <div className="max-w-6xl mx-auto p-8 flex flex-col h-[85vh]">
        <div className="bg-slate-900 text-white p-8 rounded-t-[2rem] flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black italic uppercase tracking-tighter">{gig.title}</h1>
            <p className="text-indigo-400 text-[10px] font-bold uppercase tracking-widest mt-1">Direct Secure Workspace</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-slate-400 italic uppercase">Escrow Secured</p>
            <p className="text-xl font-black italic">₹{gig.budget}</p>
          </div>
        </div>

        <div className="flex-1 bg-white border-x border-slate-200 overflow-y-auto p-8 space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex flex-col ${msg.sender === user?.name ? "items-end" : "items-start"}`}>
              <div className={`max-w-md p-4 rounded-2xl text-sm font-medium ${
                msg.sender === user?.name ? "bg-indigo-600 text-white rounded-tr-none" : "bg-slate-100 text-slate-800 rounded-tl-none"
              }`}>
                {msg.text}
              </div>
              <span className="text-[9px] text-slate-400 font-bold mt-1 uppercase italic">
                {msg.sender} • {msg.time}
              </span>
            </div>
          ))}
        </div>

        <form onSubmit={sendMessage} className="bg-white p-6 border-x border-b border-slate-200 flex gap-4">
          <input 
            type="text" 
            placeholder="Type your message..."
            className="flex-1 bg-slate-50 border border-slate-100 p-4 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" className="bg-slate-900 text-white px-8 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-indigo-600 transition-all">
            Send
          </button>
        </form>

        {/* UPDATED UI: Release Payment Section */}
        {user?.role === "client" && gig.status === "hired" && (
          <div className="mt-6 p-6 bg-indigo-50 border-2 border-indigo-200 rounded-[2rem] flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-indigo-900 uppercase italic">Release Payment</h3>
              <p className="text-xs font-bold text-indigo-600 mt-1 uppercase tracking-widest">
                Confirm task completion to release ₹{gig.budget} to the expert.
              </p>
            </div>
            <button 
              onClick={handleRelease}
              disabled={loading}
              className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-700 shadow-xl transition-all disabled:opacity-50"
            >
              {loading ? "Processing..." : "Release Funds →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}














