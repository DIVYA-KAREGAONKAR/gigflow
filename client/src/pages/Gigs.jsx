import { useEffect, useState } from "react";
import api from "../utils/axios";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

export default function Gigs() {
  const [gigs, setGigs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchGigs = async () => {
      try {
        const res = await api.get(`/gigs?search=${searchTerm}`);
        setGigs(res.data);
      } catch (err) {
        console.error("Error fetching gigs:", err);
      }
    };
    const delayDebounceFn = setTimeout(() => {
      fetchGigs();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  return (
    <div className="min-h-screen bg-[#f8fafc] selection:bg-indigo-100">
      <Navbar />

      <div className="max-w-7xl mx-auto px-8 py-16">
        {/* HEADER & SEARCH SECTION */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <h2 className="text-6xl font-black tracking-tighter text-slate-900 leading-[0.9] mb-4">
              The <span className="text-indigo-600 italic">Marketplace.</span>
            </h2>
            <p className="text-lg text-slate-500 font-medium leading-relaxed">
              Discover high-value opportunities posted by verified clients worldwide.
            </p>
          </div>

          <div className="relative lg:w-96 group">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by role or skill..."
              className="w-full bg-white border border-slate-200 pl-14 pr-6 py-5 rounded-[2rem] outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-600 transition-all font-bold text-slate-700 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* GIG GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {gigs.length > 0 ? (
            gigs.map((gig) => (
              <div key={gig._id} className="group relative bg-white border border-slate-100 p-8 rounded-[2.5rem] hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-2 transition-all duration-500">
                <div className="flex justify-between items-start mb-6">
                   <div className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center text-xl font-black text-slate-300 group-hover:text-indigo-500 transition-colors">
                     GF
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">Active Now</span>
                </div>

                <h3 className="text-2xl font-black text-slate-900 leading-tight mb-3 group-hover:text-indigo-600 transition-colors italic">
                  {gig.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-8 line-clamp-3 font-medium">
                  {gig.description}
                </p>
                
                <div className="flex justify-between items-center pt-8 border-t border-slate-50">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Fixed Budget</p>
                    <p className="text-2xl font-black text-slate-900 tracking-tighter">₹{gig.budget}</p>
                  </div>
                  <Link 
                    to={`/gigs/${gig._id}`} 
                    className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200"
                  >
                    View Project
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-24 text-center border-2 border-dashed border-slate-200 rounded-[3rem] bg-slate-50/50">
              <p className="text-slate-400 font-black text-sm uppercase tracking-[0.3em]">No Intelligence Found Matching "{searchTerm}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
