import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/axios";
import { io } from "socket.io-client";
import Navbar from "../components/Navbar";

export default function Workspace() {
  const { id } = useParams(); // Gig ID from URL
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

  // 1. Correct Backend URL (Use env variable if possible)
  socket.current = io("http://localhost:5000", {
    transports: ["websocket", "polling"],
    withCredentials: true
  });

  // 2. ✅ FIX: Must match Backend 'join_workspace'
  socket.current.emit("join_workspace", id); 

  // 3. ✅ FIX: Listener for incoming messages
  socket.current.on("receive_message", (data) => {
    console.log("New message received:", data);
    setMessages((prev) => [...prev, data]);
  });

  return () => {
    socket.current.off("receive_message");
    socket.current.disconnect();
  };
}, [id]);

const sendMessage = (e) => {
  e.preventDefault();
  if (!input.trim() || !user) return;

  const messageData = {
    gigId: id,          // ✅ FIX: Match Backend 'data.gigId'
    senderName: user.name, // ✅ FIX: Match Backend 'data.senderName'
    text: input,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  // 4. ✅ FIX: Send to server
  socket.current.emit("send_message", messageData);

  // Add to local state so sender sees it immediately
  setMessages((prev) => [...prev, {
    sender: user.name, // Match the structure used in the map()
    text: input,
    time: messageData.time
  }]);
  
  setInput("");
};

  if (!gig) return <div className="p-20 text-center font-black italic">Loading Workspace...</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-6xl mx-auto p-8 flex flex-col h-[85vh]">
        
        {/* Header */}
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

        {/* Input Area */}
        <form onSubmit={sendMessage} className="bg-white p-6 rounded-b-[2rem] border border-slate-200 flex gap-4">
          <input 
            type="text" 
            placeholder="Type your message to the freelancer..."
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