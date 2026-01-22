import { useEffect, useState } from "react";
import api from "../utils/axios";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";

export default function Gigs() {
  const [gigs, setGigs] = useState([]);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    categories: [],
    minBudget: "",
    maxBudget: "",
    verifiedOnly: false
  });

  // --- 1. FETCH CURRENT USER ---
  useEffect(() => {
    api.get("/auth/me")
      .then((res) => setUser(res.data))
      .catch(() => setUser(null));
  }, []);

  // --- 2. AI MATCH STYLING HELPER ---
  const getMatchStyles = (score) => {
    if (score >= 85) return { color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', label: 'High Match' };
    if (score >= 60) return { color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200', label: 'Good Match' };
    return { color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-200', label: 'Skill Gap' };
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilters({
      categories: [],
      minBudget: "",
      maxBudget: "",
      verifiedOnly: false
    });
    toast.success("Filters reset to default");
  };

  // --- 3. FETCH GIGS (Includes your search and filters) ---
  useEffect(() => {
    const fetchGigs = async () => {
      try {
        const query = new URLSearchParams({
          search: searchTerm,
          min: filters.minBudget,
          max: filters.maxBudget,
          verified: filters.verifiedOnly,
          cats: filters.categories.join(',') 
        }).toString();
        
       // Gigs.jsx
const res = await api.get(`/gigs?${query}&t=${new Date().getTime()}`);
        setGigs(res.data);
      } catch (err) {
        console.error("Error fetching filtered gigs:", err);
      }
    };

    const debounce = setTimeout(fetchGigs, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm, filters]); 

  return (
    <div className="min-h-screen bg-[#f8fafc] selection:bg-indigo-100">
      <Navbar />
      <Toaster />

      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-16">
        
        {/* HEADER SECTION */}
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
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-400">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* SIDEBAR FILTERS */}
          <aside className="hidden lg:block w-72 flex-shrink-0 sticky top-24 h-fit">
            <div className="space-y-12">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">Filters</h3>
                <button 
                  onClick={clearFilters}
                  className="text-[10px] font-bold text-indigo-600 hover:text-slate-900 uppercase tracking-widest transition-all flex items-center gap-1 group bg-indigo-50 px-2 py-1 rounded-md"
                >
                  <svg className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear All
                </button>
              </div>

              <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic mb-6">01. Industry</h3>
                <div className="space-y-4">
                  {["Development", "Design", "Marketing", "AI / ML"].map((cat) => (
                    <label key={cat} className="flex items-center gap-3 group cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={filters.categories.includes(cat)}
                        onChange={(e) => {
                          const nextCats = e.target.checked 
                            ? [...filters.categories, cat] 
                            : filters.categories.filter(c => c !== cat);
                          setFilters({...filters, categories: nextCats});
                        }}
                        className="w-5 h-5 rounded-md border-slate-200 text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer" 
                      />
                      <span className="text-sm font-bold text-slate-600 group-hover:text-indigo-600 transition-colors italic">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic mb-6">02. Budget</h3>
                <div className="flex gap-4 items-center">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 italic font-serif">₹</span>
                    <input 
                      type="number" 
                      value={filters.minBudget}
                      onChange={(e) => setFilters({...filters, minBudget: e.target.value})}
                      placeholder="Min" 
                      className="w-full bg-white border border-slate-200 p-3 pl-6 rounded-xl text-xs font-black focus:border-indigo-600 outline-none" 
                    />
                  </div>
                  <div className="h-[2px] w-4 bg-slate-200"></div>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 italic font-serif">₹</span>
                    <input 
                      type="number" 
                      value={filters.maxBudget}
                      onChange={(e) => setFilters({...filters, maxBudget: e.target.value})}
                      placeholder="Max" 
                      className="w-full bg-white border border-slate-200 p-3 pl-6 rounded-xl text-xs font-black focus:border-indigo-600 outline-none" 
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic mb-6">03. Security</h3>
                <label className="flex items-center justify-between group cursor-pointer">
                  <span className="text-sm font-bold text-slate-600 italic">Verified Only</span>
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={filters.verifiedOnly}
                      onChange={(e) => setFilters({...filters, verifiedOnly: e.target.checked})}
                    />
                    <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-indigo-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </div>
                </label>
              </div>
            </div>
          </aside>

          {/* DYNAMIC GIG GRID */}
          <div className="flex-1">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic mb-8">Global Intel Feed</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {gigs.filter(g => g.status === "open").length > 0 ? (
                gigs.filter(g => g.status === "open").map((gig) => {
                  const styles = getMatchStyles(gig.matchScore || 0);
                  
                  return (
                    <div key={gig._id} className="group relative bg-white border border-slate-100 p-8 rounded-[2.5rem] hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-2 transition-all duration-500 flex flex-col justify-between min-h-[450px]">
                      <div>
                        <div className="flex justify-between items-start mb-6">
                          <div className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center text-xl font-black text-slate-300 group-hover:text-indigo-500 transition-colors">GF</div>
                          
                          {/* BADGE SECTION (AI + VERIFIED) */}
                          <div className="flex flex-col items-end gap-2">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">Active Now</span>
                            
                            {/* --- SMART MATCH BADGE --- */}
                            {user && gig.matchScore !== undefined && (
                              <div className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border shadow-sm transition-all animate-pulse ${styles.bg} ${styles.color} ${styles.border}`}>
                                <span className="relative flex h-1.5 w-1.5">
                                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-current`}></span>
                                  <span className={`relative inline-flex rounded-full h-1.5 w-1.5 bg-current`}></span>
                                </span>
                                AI: {gig.matchScore}% {styles.label}
                              </div>
                            )}

                            {gig.isVerifiedClient && (
                              <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100 shadow-sm">
                                Verified Client
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <h3 className="text-2xl font-black text-slate-900 leading-tight mb-3 group-hover:text-indigo-600 transition-colors italic">
                          {gig.title}
                        </h3>
                        <p className="text-slate-500 text-sm leading-relaxed mb-8 line-clamp-3 font-medium">
                          {gig.description}
                        </p>
                      </div>
                      
                      <div className="flex justify-between items-center pt-8 border-t border-slate-50 mt-auto">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Budget</p>
                          <p className="text-2xl font-black text-slate-900 tracking-tighter italic">₹{gig.budget}</p>
                        </div>
                        <Link 
                          to={`/gigs/${gig._id}`} 
                          className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 shadow-lg active:scale-95 transition-all"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full py-24 text-center border-2 border-dashed border-slate-200 rounded-[3rem] font-black text-slate-400 uppercase tracking-widest text-sm italic bg-slate-50/30">
                  No Intel Found
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}