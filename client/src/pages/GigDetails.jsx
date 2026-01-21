import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../utils/axios";
import Navbar from "../components/Navbar";
import { toast, Toaster } from "react-hot-toast";

export default function GigDetails() {
  const { id } = useParams();
  const [gig, setGig] = useState(null);
  const [user, setUser] = useState(null);
  const [bid, setBid] = useState({ price: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [customSkills, setCustomSkills] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);


  
  // --- AI LOGIC ---
  const generateAIProposal = async () => {
    if (!customSkills) {
      return toast.error("Please enter some skills for the AI to use!");
    }

    setIsGenerating(true);
    try {
      const res = await api.post("/ai/generate-proposal", {
        jobDescription: gig.description,
        userSkills: customSkills
      });
      
      console.log("Gemini Response:", res.data);

      if (res.data && res.data.proposal) {
        // We use the functional update (prev) to keep the existing 'price'
        setBid(prev => ({ ...prev, message: res.data.proposal })); 
        toast.success("AI Proposal Ready!");
      } else {
        toast.error("AI returned an empty response.");
      }
    } catch (err) {
      console.error("AI Error:", err);
      toast.error("AI Generation failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  // --- DATA FETCHING ---
  useEffect(() => {
    if (id) {
      api.get(`/gigs/${id}`)
        .then((res) => setGig(res.data))
        .catch((err) => console.error("Gig fetch error:", err));
    }
  }, [id]);

  useEffect(() => {
    api.get("/auth/me")
      .then((res) => setUser(res.data))
      .catch(() => setUser(null));
  }, []);

  // --- SUBMIT PROPOSAL ---
  const submitBid = async (e) => {
    e.preventDefault();
    if (!bid.price || !bid.message) {
      toast.error("Please provide both a price and a message.");
      return;
    }

    try {
      setLoading(true);
      await api.post("/bids", {
        gigId: id,
        price: bid.price,
        message: bid.message,
      });
      toast.success("Proposal transmitted successfully!");
      setBid({ price: "", message: "" });
      setCustomSkills(""); // Reset skills field
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit bid");
    } finally {
      setLoading(false);
    }
  };

  if (!gig) return (
    <div className="h-screen flex items-center justify-center bg-white font-black italic tracking-widest text-slate-200 uppercase">
      Initialising Intelligence...
    </div>
  );

  return (
    <div className="min-h-screen bg-white selection:bg-indigo-100">
      <Navbar />
      <Toaster />
      
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-64px)]">
        
        {/* LEFT PANEL: Project Intelligence */}
        <div className="lg:w-3/5 p-8 lg:p-20 bg-white border-r border-slate-100 flex flex-col justify-center">
          <Link to="/" className="text-xs font-black uppercase tracking-widest text-indigo-600 hover:text-slate-900 transition-colors mb-12 block italic">
            ← Return to Marketplace
          </Link>

          <div className="max-w-2xl">
            <div className="flex items-center gap-4 mb-6">
              <span className="px-3 py-1 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-md italic">
                Active Project
              </span>
              <span className="text-slate-300">/</span>
              <span className="text-xs font-bold text-slate-400">ID: {id.slice(-8)}</span>
            </div>

            <h1 className="text-6xl font-black leading-[0.9] tracking-tighter text-slate-900 mb-8 italic">
              {gig.title}
            </h1>
            
            <p className="text-xl text-slate-600 leading-relaxed font-medium mb-12">
              {gig.description}
            </p>

            <div className="flex items-center gap-8 py-8 border-y border-slate-50">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Project Budget</p>
                <p className="text-4xl font-black text-slate-900 tracking-tighter">₹{gig.budget}</p>
              </div>
              <div className="h-10 w-[1px] bg-slate-100"></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Escrow Status</p>
                <p className="text-lg font-bold text-emerald-500 uppercase italic">Verified</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Interaction Area */}
        <div className="lg:w-2/5 bg-[#f8fafc] p-8 lg:p-20 flex flex-col justify-center overflow-y-auto">
          
          {user && gig.ownerId && String(user._id) === String(gig.ownerId) ? (
            <div className="space-y-8 text-center lg:text-left">
              <h2 className="text-3xl font-black text-slate-900 italic mb-4">You own this project.</h2>
              <p className="text-slate-500 font-medium mb-8">Manage incoming proposals and select the perfect expert.</p>
              <Link 
                to={`/gigs/${gig._id}/bids`} 
                className="inline-block w-full bg-slate-900 text-white font-black py-6 rounded-2xl text-center shadow-2xl hover:bg-indigo-600 transition-all uppercase tracking-widest text-sm active:scale-95"
              >
                Analyze All Bids →
              </Link>
            </div>
          ) : user?.role === "freelancer" ? (
            <form onSubmit={submitBid} className="space-y-8">
              <div>
                <h2 className="text-3xl font-black text-slate-900 italic mb-2 tracking-tighter">Draft Proposal.</h2>
                <p className="text-slate-500 font-medium">Pitch your expertise and secure the contract.</p>
              </div>

              {/* 01. BUDGET QUOTE */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-900 uppercase tracking-tighter italic">01. Your Quote (₹)</label>
                <div className="relative">
                  <span className="absolute left-0 bottom-4 text-2xl font-black text-slate-300 italic font-serif">₹</span>
                  <input 
                    type="number" 
                    placeholder="Enter amount" 
                    className="w-full bg-transparent border-b-2 border-slate-200 py-4 pl-8 text-3xl font-black placeholder:text-slate-200 focus:border-indigo-600 focus:outline-none transition-all" 
                    value={bid.price} 
                    onChange={(e) => setBid({ ...bid, price: e.target.value })} 
                  />
                </div>
              </div>

              {/* AI PROPOSAL ASSISTANT */}
              <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100 space-y-4">
                <label className="text-[10px] font-black text-indigo-900 uppercase tracking-widest italic flex items-center gap-2">
                  <span className="text-lg">✨</span> AI Proposal Assistant
                </label>
                
                <input 
                  type="text"
                  placeholder="Enter specific skills for this job..."
                  className="w-full bg-white border border-indigo-100 p-4 rounded-xl text-sm font-bold text-slate-700 focus:border-indigo-600 focus:outline-none shadow-sm transition-all"
                  value={customSkills}
                  onChange={(e) => setCustomSkills(e.target.value)}
                />

                <button
                  type="button"
                  onClick={generateAIProposal}
                  disabled={isGenerating}
                  className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-100"
                >
                  {isGenerating ? <span className="animate-pulse italic text-xs">Synthesizing Intelligence...</span> : "Auto-Generate Pitch"}
                </button>
              </div>

              {/* 02. PROPOSAL MESSAGE */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-900 uppercase tracking-tighter italic">02. Proposal message</label>
                <textarea 
                  placeholder="The AI will help you write this..." 
                  className="w-full bg-white border border-slate-200 p-6 rounded-2xl text-lg font-medium text-slate-700 shadow-sm focus:border-indigo-600 focus:outline-none transition-all resize-none" 
                  rows="5" 
                  value={bid.message} 
                  onChange={(e) => setBid({ ...bid, message: e.target.value })} 
                />
              </div>

              <button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-slate-900 text-white font-black py-6 rounded-2xl shadow-2xl hover:bg-indigo-600 active:scale-95 transition-all disabled:opacity-50 uppercase tracking-widest text-sm"
              >
                {loading ? "Transmitting..." : "Send Proposal Listing"}
              </button>
            </form>
          ) : (
            <div className="text-center p-12 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
              <p className="text-slate-400 font-black uppercase tracking-widest mb-4 italic">Notice</p>
              <p className="text-slate-600 font-bold mb-8">Sign in as a freelancer to interact with this briefing.</p>
              <Link to="/login" className="text-indigo-600 font-black uppercase tracking-widest text-xs hover:underline">
                Go to Portal →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}