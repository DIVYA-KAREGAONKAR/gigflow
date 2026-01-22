import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../utils/axios";
import Navbar from "../components/Navbar";
import { toast, Toaster } from "react-hot-toast";
import { PayPalButtons } from "@paypal/react-paypal-js";

export default function GigDetails() {
  const { id } = useParams();
  const [gig, setGig] = useState(null);
  const [user, setUser] = useState(null);
  const [bid, setBid] = useState({ price: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [customSkills, setCustomSkills] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // --- 1. DATA FETCHING ---
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

 // --- 2. PAYMENT COMPONENT ---
  function PaymentSection({ gig }) {
    return (
      <div className="mt-4 p-6 bg-white rounded-3xl border border-slate-100 shadow-xl">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 italic">
          Secure Escrow Funding
        </h3>
        <PayPalButtons 
          style={{ layout: "vertical", shape: "pill", height: 45 }}
          createOrder={(data, actions) => {
            // Convert INR budget to USD for Sandbox stability
            const usdValue = (gig.budget / 80).toFixed(2);

            return actions.order.create({
              purchase_units: [{ 
                amount: { 
                    currency_code: "USD", 
                    value: usdValue 
                },
                description: `Escrow for: ${gig.title}`
              }]
            });
          }}
          onApprove={async (data, actions) => {
            const order = await actions.order.capture();
            try {
                await api.post("/gigs/pay-success", { 
                    gigId: gig._id, 
                    paypalOrderId: order.id 
                });
                toast.success("Payment Successful! Project is now HIRED.");
                setTimeout(() => window.location.reload(), 1500);
            } catch (err) {
                toast.error("Payment recorded but database update failed.");
            }
          }}
          onError={(err) => {
            console.error("PayPal Error:", err);
            toast.error("PayPal failed to load. Please check your connection.");
          }}
        />
        {/* Helper text to explain the conversion to the client */}
        <p className="text-[9px] text-slate-400 mt-3 text-center italic font-medium">
          * Total ₹{gig.budget} converted to approx. ${(gig.budget / 80).toFixed(2)} USD for secure processing.
        </p>
      </div>
    );
  }

  // --- 3. AI LOGIC ---
  const generateAIProposal = async () => {
    if (!customSkills) return toast.error("Please enter skills!");
    setIsGenerating(true);
    try {
      const res = await api.post("/ai/generate-proposal", {
        jobDescription: gig.description,
        userSkills: customSkills
      });
      if (res.data?.proposal) {
        setBid(prev => ({ ...prev, message: res.data.proposal })); 
        toast.success("AI Proposal Ready!");
      }
    } catch (err) {
      toast.error("AI Generation failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  // --- 4. SUBMIT PROPOSAL ---
  const submitBid = async (e) => {
    e.preventDefault();
    if (!bid.price || !bid.message) return toast.error("Fill all fields");
    try {
      setLoading(true);
      await api.post("/bids", { gigId: id, price: bid.price, message: bid.message });
      toast.success("Proposal transmitted!");
      setBid({ price: "", message: "" });
    } catch (err) {
      toast.error("Failed to submit bid");
    } finally {
      setLoading(false);
    }
  };

  // --- 5. RELEASE PAYMENT LOGIC ---
  const handleRelease = async () => {
    try {
      setLoading(true);
      await api.post("/gigs/release-payment", { gigId: gig._id });
      toast.success("Funds released to freelancer!");
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      toast.error("Release failed. Try again.");
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
        
        {/* LEFT PANEL */}
        <div className="lg:w-3/5 p-8 lg:p-20 bg-white border-r border-slate-100 flex flex-col justify-center">
          <Link to="/" className="text-xs font-black uppercase tracking-widest text-indigo-600 hover:text-slate-900 transition-colors mb-12 block italic">
            ← Return to Marketplace
          </Link>

          <div className="max-w-2xl">
            <div className="flex items-center gap-4 mb-6">
              <span className="px-3 py-1 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-md italic">
                {gig.status === "open" ? "Active Project" : "Contracted"}
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
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Budget</p>
                <p className="text-4xl font-black text-slate-900 tracking-tighter">₹{gig.budget}</p>
              </div>
              <div className="h-10 w-[1px] bg-slate-100"></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Escrow Status</p>
                <p className={`text-lg font-bold uppercase italic ${gig.status === "open" ? "text-slate-400" : "text-emerald-500"}`}>
                  {gig.status === "open" ? "Pending Funding" : "Funds Secured"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="lg:w-2/5 bg-[#f8fafc] p-8 lg:p-20 flex flex-col justify-center overflow-y-auto">
          
          {user && gig.ownerId && String(user._id) === String(gig.ownerId) ? (
            <div className="space-y-8">
              <div className="text-center lg:text-left">
                <h2 className="text-3xl font-black text-slate-900 italic mb-2 tracking-tighter">Project Control.</h2>
                <p className="text-slate-500 font-medium text-sm">Manage the lifecycle of this intelligence contract.</p>
              </div>

              {gig.status === "open" ? (
                <div className="space-y-6">
                  <Link 
                    to={`/gigs/${gig._id}/bids`} 
                    className="inline-block w-full bg-slate-900 text-white font-black py-6 rounded-2xl text-center shadow-2xl hover:bg-indigo-600 transition-all uppercase tracking-widest text-sm"
                  >
                    Analyze All Bids →
                  </Link>
                  <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200"></span></div>
                    <div className="relative flex justify-center text-[10px] uppercase font-black text-slate-400 bg-[#f8fafc] px-4 italic">OR DIRECT HIRE</div>
                  </div>
                  <PaymentSection gig={gig} />
                </div>
              ) : gig.status === "hired" ? (
                <div className="p-8 bg-white rounded-[2.5rem] border border-indigo-100 shadow-xl space-y-6">
                  <div className="flex items-center gap-3 text-indigo-600">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-600"></span>
                    </span>
                    <span className="text-xs font-black uppercase tracking-widest">Active Escrow</span>
                  </div>
                  <p className="text-slate-600 text-sm font-medium">Funds are held in GigFlow Escrow. Release them once the work is delivered.</p>
                  <button 
                    onClick={handleRelease}
                    disabled={loading}
                    className="w-full bg-emerald-600 text-white font-black py-5 rounded-2xl shadow-lg hover:bg-emerald-700 transition-all uppercase tracking-widest text-xs disabled:opacity-50"
                  >
                    {loading ? "Processing..." : `Release ₹${gig.budget} →`}
                  </button>
                </div>
              ) : (
                <div className="p-12 border-4 border-dashed border-slate-200 rounded-[3rem] text-center">
                    <p className="text-slate-300 font-black uppercase italic tracking-[0.2em]">Contract Completed</p>
                </div>
              )}
            </div>

          ) : user?.role === "freelancer" && gig.status === "open" ? (
            <form onSubmit={submitBid} className="space-y-8">
              <h2 className="text-3xl font-black text-slate-900 italic mb-2 tracking-tighter">Draft Proposal.</h2>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-900 uppercase italic">01. Your Quote (₹)</label>
                <input 
                  type="number" 
                  className="w-full bg-transparent border-b-2 border-slate-200 py-4 text-3xl font-black focus:border-indigo-600 outline-none" 
                  value={bid.price} 
                  onChange={(e) => setBid({ ...bid, price: e.target.value })} 
                />
              </div>
              <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100 space-y-4">
                <label className="text-[10px] font-black text-indigo-900 uppercase italic">✨ AI Assistant</label>
                <input 
                  type="text"
                  placeholder="Skills (React, Node)..."
                  className="w-full p-4 rounded-xl text-sm font-bold border border-indigo-100 outline-none"
                  value={customSkills}
                  onChange={(e) => setCustomSkills(e.target.value)}
                />
                <button type="button" onClick={generateAIProposal} disabled={isGenerating} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black text-[10px] uppercase">
                  {isGenerating ? "Synthesizing..." : "Generate Pitch"}
                </button>
              </div>
              <textarea 
                className="w-full bg-white border border-slate-200 p-6 rounded-2xl text-lg font-medium outline-none focus:border-indigo-600" 
                rows="5" 
                value={bid.message} 
                onChange={(e) => setBid({ ...bid, message: e.target.value })} 
              />
              <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white font-black py-6 rounded-2xl uppercase tracking-widest shadow-2xl">
                {loading ? "Transmitting..." : "Send Proposal"}
              </button>
            </form>
          ) : (
            <div className="text-center p-12 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
              <p className="text-slate-600 font-bold">
                {gig.status !== "open" ? "This project is no longer accepting bids." : "Sign in as a freelancer to bid."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}