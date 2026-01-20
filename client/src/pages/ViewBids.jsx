import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../utils/axios";
import Navbar from "../components/Navbar";
import { toast, Toaster } from "react-hot-toast";

export default function ViewBids() {
  const { gigId } = useParams();
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBids = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/bids/gig/${gigId}`);
        setBids(res.data);
      } catch (err) {
        console.error("Fetch Bids Error:", err);
      } finally {
        setLoading(false);
      }
    };
    if (gigId) fetchBids();
  }, [gigId]);

  const hireBid = async (bidId) => {
    try {
      await api.patch(`/bids/${bidId}/hire`);
      toast.success("Engagement confirmed!");
      setBids(prev => prev.map(b => b._id === bidId ? { ...b, status: "hired" } : b));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to confirm engagement.");
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black animate-pulse text-slate-300 uppercase tracking-[0.5em]">Scanning Proposals...</div>;

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />
      <Toaster />
      <div className="max-w-6xl mx-auto px-8 py-16">
        
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <Link to="/" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors mb-4 block">← Back to Dashboard</Link>
            <h1 className="text-5xl font-black tracking-tighter text-slate-900 leading-none italic">
              Proposals <span className="text-indigo-600">Pending.</span>
            </h1>
          </div>
          <div className="bg-white border border-slate-200 px-6 py-4 rounded-3xl shadow-sm">
             <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] italic mr-4">Intelligence count:</span>
             <span className="text-2xl font-black text-slate-900">{bids.length}</span>
          </div>
        </header>

        {bids.length === 0 ? (
          <div className="bg-white/50 backdrop-blur-md rounded-[3rem] p-24 text-center border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-black italic uppercase tracking-widest">Awaiting response from freelancers</p>
          </div>
        ) : (
          <div className="space-y-6">
            {bids.map(bid => (
              <div key={bid._id} className="bg-white border border-slate-100 p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 flex flex-col lg:flex-row justify-between lg:items-center gap-10 hover:border-indigo-100 transition-all">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-4">
                    <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full border ${
                      bid.status === "pending" ? "bg-amber-50 text-amber-600 border-amber-100" :
                      bid.status === "hired" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                    }`}>
                      {bid.status}
                    </span>
                    <span className="text-slate-300">/</span>
                    <span className="text-sm font-bold text-slate-800 italic">Proposal #{bid._id.slice(-4)}</span>
                  </div>
                  
                  <p className="text-xl text-slate-600 font-medium leading-relaxed italic">
                    "{bid.message}"
                  </p>
                </div>

                <div className="flex items-center gap-12 lg:pl-12 lg:border-l border-slate-100">
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Quote</p>
                    <p className="text-4xl font-black text-slate-900 tracking-tighter italic">₹{bid.price}</p>
                  </div>
                  
                  {bid.status === "pending" && (
                    <button 
                      onClick={() => hireBid(bid._id)} 
                      className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-600 active:scale-[0.97] transition-all shadow-xl shadow-slate-200"
                    >
                      Confirm Hire
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}