import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/axios";
import Navbar from "../components/Navbar";

export default function GigBids() {
  const { gigId } = useParams();
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/bids/${gigId}`)
      .then((res) => {
        setBids(res.data);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [gigId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex justify-center items-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-50 via-gray-100 to-gray-200">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-12">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-slate-900">Project Bids</h2>
            <p className="text-slate-500 font-medium">Review offers from freelancers for this gig.</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-200">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Bids: </span>
            <span className="text-indigo-600 font-black">{bids.length}</span>
          </div>
        </header>

        {bids.length === 0 ? (
          <div className="bg-white/50 backdrop-blur-md rounded-3xl p-16 text-center border-2 border-dashed border-slate-300">
            <p className="text-slate-500 font-semibold text-lg">No bids received yet.</p>
            <p className="text-slate-400 text-sm">Check back later for new offers.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {bids.map((bid) => (
              <div
                key={bid._id}
                className="group bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-white hover:border-indigo-100 transition-all hover:scale-[1.01]"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-3">
                    {/* Status Badge */}
                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${
                      bid.status === 'accepted' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      bid.status === 'rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                      'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>
                      {bid.status}
                    </span>
                    
                    <p className="text-slate-700 leading-relaxed font-medium">
                      {bid.message}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Bid Amount</p>
                    <p className="text-2xl font-black text-slate-900">₹{bid.price}</p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
                   <div className="flex items-center gap-2">
                      <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-xs font-bold">
                        {/* Avatar Placeholder */}
                        FL
                      </div>
                      <span className="text-sm font-bold text-slate-600">Freelancer</span>
                   </div>
                   <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-widest">
                     View Profile →
                   </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}