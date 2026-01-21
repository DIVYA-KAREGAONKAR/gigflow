import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/axios";
import { io } from "socket.io-client";
import Navbar from "../components/Navbar";

export default function Workspace() {
  const { id } = useParams();
  const [gig, setGig] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [user, setUser] = useState(null);
  const socket = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const gigRes = await api.get(`/gigs/${id}`);
        const userRes = await api.get("/auth/me");
        setGig(gigRes.data);
        setUser(userRes.data);
      } catch (err) {
        console.error("Data fetch error", err);
      }
    };
    fetchData();

    // Initialize Socket
    socket.current = io("https://gigflow-dzfl.onrender.com", {
      transports: ["websocket", "polling"],
      withCredentials: true
    });

    // ✅ JOIN ROOM - Listen for 'connect' event first to ensure we are ready
    socket.current.on("connect", () => {
      console.log("Connected to Socket Server");
      socket.current.emit("join_workspace", id);
    });

    // ✅ RECEIVE MESSAGE - Listener
    socket.current.on("receive_message", (data) => {
      console.log("New message from server:", data);
      // Only add if the sender is NOT the current user (to avoid duplicates)
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      if (socket.current) socket.current.disconnect();
    };
  }, [id]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    const messageTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const messageData = {
      gigId: id,
      senderName: user.name, // Ensure this matches 'senderName' in server.js
      text: input,
      time: messageTime
    };

    // 1. Send to server
    socket.current.emit("send_message", messageData);
    
    // 2. Add to local UI (This is the one you see)
    setMessages((prev) => [...prev, {
      sender: user.name, 
      text: input,
      time: messageTime
    }]);

    setInput("");
  };

  if (!gig) return <div className="p-20 text-center font-black italic">Loading Workspace...</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-6xl mx-auto p-8 flex flex-col h-[85vh]">
        <div className="bg-slate-900 text-white p-8 rounded-t-[2rem] flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black italic uppercase tracking-tighter">{gig.title}</h1>
            <p className="text-indigo-400 text-[10px] font-bold uppercase tracking-widest mt-1">Direct Secure Workspace</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-slate-400">Budget Secured</p>
            <p className="text-xl font-black italic">₹{gig.budget}</p>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-white border-x border-slate-200 overflow-y-auto p-8 space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex flex-col ${msg.sender === user?.name ? "items-end" : "items-start"}`}>
              <div className={`max-w-md p-4 rounded-2xl text-sm font-medium ${
                msg.sender === user?.name ? "bg-indigo-600 text-white rounded-tr-none" : "bg-slate-100 text-slate-800 rounded-tl-none"
              }`}>
                {msg.text}
              </div>
              <span className="text-[9px] text-slate-400 font-bold mt-1 uppercase">{msg.sender} • {msg.time}</span>
            </div>
          ))}
        </div>

        <form onSubmit={sendMessage} className="bg-white p-6 rounded-b-[2rem] border border-slate-200 flex gap-4">
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
      </div>
    </div>
  );
}