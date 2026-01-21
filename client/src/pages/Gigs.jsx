import { useEffect, useState } from "react";
import api from "../utils/axios";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast"; // Added Toaster for feedback

export default function Gigs() {
  const [gigs, setGigs] = useState([]);
  const [user, setUser] = useState(null); // NEW: State to hold current user info
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    categories: [],
    minBudget: "",
    maxBudget: "",
    verifiedOnly: false
  });

  // --- NEW: FETCH CURRENT USER ON LOAD ---
  useEffect(() => {
    api.get("/auth/me")
      .then((res) => setUser(res.data))
      .catch(() => setUser(null));
  }, []);

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
        
        const res = await api.get(`/gigs?${query}`);
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
      <Toaster /> {/* NEW: Added Toaster component for notifications */}

      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-16">
        
        {/* --- HEADER SECTION --- */}
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
        {/* --- FREELANCER ACTIVE CONTRACTS (Only visible to logged-in freelancers) --- */}
          {user?.role === "freelancer" && (
            <div className="mb-20 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="border-b border-slate-200 pb-6">
                <h2 className="text-2xl font-black italic text-slate-900">Active Contracts.</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Projects you are currently working on</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Logic: Filter gigs where status is 'hired' 
                    AND the hiredFreelancer field matches the current user's ID 
                */}
                {gigs.filter(g => g.status === "hired" && String(g.hiredFreelancer) === String(user._id)).length > 0 ? (
                  gigs.filter(g => g.status === "hired" && String(g.hiredFreelancer) === String(user._id)).map(gig => (
                    <div key={gig._id} className="p-8 bg-white border-2 border-indigo-100 rounded-[2rem] shadow-xl flex justify-between items-center group hover:border-indigo-600 transition-all">
                      <div>
                        <span className="text-[9px] font-black bg-indigo-600 text-white px-2 py-1 rounded-md uppercase tracking-tighter italic">Ongoing Work</span>
                        <p className="text-xl font-bold text-slate-900 mt-2 tracking-tight">{gig.title}</p>
                        <p className="text-xs font-medium text-slate-400 mt-1 italic">Contract value: ₹{gig.budget}</p>
                      </div>
                      
                      <Link 
                        to={`/workspace/${gig._id}`} 
                        className="px-6 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-600 transition-all shadow-lg active:scale-95"
                      >
                        Open Workspace →
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full p-12 border-2 border-dashed border-slate-200 rounded-[2rem] text-center">
                    <p className="text-sm font-bold text-slate-400 italic">No active contracts yet. Keep applying!</p>
                  </div>
                )}
              </div>
            </div>
          )}

        {/* --- NEW: CLIENT DASHBOARD SECTION (Only visible to logged-in clients) --- */}
        {user?.role === "client" && (
          <div className="mb-20 space-y-12 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="flex items-center justify-between border-b border-slate-200 pb-6">
              <h2 className="text-2xl font-black italic text-slate-900">Console Intelligence.</h2>
              <Link to="/add-gig" className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-indigo-100">
                + Post New Requirement
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* SUB-SECTION 1: RECRUITING (Gigs with status 'open' owned by this user) */}
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic mb-6 flex items-center gap-2">
                  <span className="h-2 w-2 bg-indigo-500 rounded-full animate-ping"></span> 01. Recruiting
                </h3>
                <div className="space-y-4">
                  {gigs.filter(g => g.status === "open" && String(g.ownerId) === String(user._id)).length > 0 ? (
                    gigs.filter(g => g.status === "open" && String(g.ownerId) === String(user._id)).map(gig => (
                      <div key={gig._id} className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm flex justify-between items-center hover:border-indigo-300 transition-all">
                         <p className="font-bold text-slate-800">{gig.title}</p>
                         <Link to={`/gigs/${gig._id}/bids`} className="text-[10px] font-black uppercase text-indigo-600 tracking-widest hover:underline">
                           View Bids →
                         </Link>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm font-medium text-slate-400 italic">No active recruiting sessions.</p>
                  )}
                </div>
              </div>

              {/* SUB-SECTION 2: WORKSPACES (Gigs with status 'hired' owned by this user) */}
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic mb-6">02. Active Workspaces</h3>
                <div className="space-y-4">
                  {gigs.filter(g => g.status === "hired" && String(g.ownerId) === String(user._id)).length > 0 ? (
                    gigs.filter(g => g.status === "hired" && String(g.ownerId) === String(user._id)).map(gig => (
                      <div key={gig._id} className="p-6 bg-slate-900 text-white rounded-3xl flex justify-between items-center shadow-xl">
                        <p className="font-bold italic">{gig.title}</p>
                        <Link to={`/workspace/${gig._id}`} className="px-5 py-2 bg-indigo-600 rounded-xl font-black uppercase text-[9px] tracking-widest hover:bg-white hover:text-indigo-600 transition-all">
                          Enter Chat →
                        </Link>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm font-medium text-slate-400 italic">No approved experts yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        {/* --- END CLIENT DASHBOARD SECTION --- */}

        {/* --- MAIN LAYOUT: SIDEBAR + GRID --- */}
        <div className="flex flex-col lg:flex-row gap-12">
          
          <aside className="hidden lg:block w-72 flex-shrink-0 sticky top-24 h-fit">
            <div className="space-y-12">
              
              {/* Sidebar Header with Clear All Button */}
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

              {/* Industry Filter */}
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

              {/* Budget Range */}
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic mb-6">02. Budget Range</h3>
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

              {/* Security */}
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

          {/* 2. DYNAMIC GIG GRID (Public View: Only shows 'open' gigs) */}
          <div className="flex-1">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic mb-8">Global Intel Feed</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {/* Filter the main grid to ONLY show 'open' gigs to the public */}
              {gigs.filter(g => g.status === "open").length > 0 ? (
                gigs.filter(g => g.status === "open").map((gig) => (
                  <div key={gig._id} className="group relative bg-white border border-slate-100 p-8 rounded-[2.5rem] hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-2 transition-all duration-500 flex flex-col justify-between min-h-[420px]">
                    <div>
                      <div className="flex justify-between items-start mb-6">
                        <div className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center text-xl font-black text-slate-300 group-hover:text-indigo-500 transition-colors">GF</div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">Active Now</span>
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
                ))
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