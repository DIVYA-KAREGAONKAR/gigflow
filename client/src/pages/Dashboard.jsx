import { useEffect, useState } from "react";
import api from "../utils/axios";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [gigs, setGigs] = useState([]);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("active"); // 'active' or 'postings'

  useEffect(() => {
    const fetchData = async () => {
      const userRes = await api.get("/auth/me");
      const gigsRes = await api.get("/gigs");
      setUser(userRes.data);
      setGigs(gigsRes.data);
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto p-8">
        
        {/* Header Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900">Control Center.</h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.3em] mt-2">Manage your work and applications</p>
        </div>

        {/* Modern Tab Switcher */}
        <div className="flex gap-4 mb-10 bg-white p-2 rounded-2xl w-fit shadow-sm border border-slate-200">
          <button 
            onClick={() => setActiveTab("active")}
            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'active' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            Active Workspaces
          </button>
          {user?.role === "client" && (
            <button 
              onClick={() => setActiveTab("postings")}
              className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'postings' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              My Postings
            </button>
          )}
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 gap-6">
          {activeTab === "active" ? (
            // --- SHOW ACTIVE CONTRACTS ---
            gigs.filter(g => g.status === "hired" && (String(g.hiredFreelancer) === String(user?._id) || String(g.ownerId) === String(user?._id))).length > 0 ? (
              gigs.filter(g => g.status === "hired" && (String(g.hiredFreelancer) === String(user?._id) || String(g.ownerId) === String(user?._id))).map(gig => (
                <div key={gig._id} className="p-8 bg-white border border-slate-200 rounded-[2.5rem] flex justify-between items-center hover:shadow-2xl transition-all">
                   <div>
                    <span className="text-[8px] font-black bg-emerald-500 text-white px-3 py-1 rounded-full uppercase italic">In Progress</span>
                    <h3 className="text-xl font-bold mt-3">{gig.title}</h3>
                   </div>
                   <Link to={`/workspace/${gig._id}`} className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-600 transition-all">
                     Open Workspace
                   </Link>
                </div>
              ))
            ) : (
              <p className="text-slate-400 italic font-bold p-20 text-center border-2 border-dashed border-slate-200 rounded-[3rem]">No active projects found.</p>
            )
          ) : (
            // --- SHOW CLIENT POSTINGS ---
            gigs.filter(g => String(g.ownerId) === String(user?._id) && g.status === "open").map(gig => (
                <div key={gig._id} className="p-8 bg-white border border-slate-200 rounded-[2.5rem] flex justify-between items-center">
                   <div>
                    <span className="text-[8px] font-black bg-indigo-600 text-white px-3 py-1 rounded-full uppercase italic">Recruiting</span>
                    <h3 className="text-xl font-bold mt-3">{gig.title}</h3>
                   </div>
                   <Link to={`/view-bids/${gig._id}`} className="bg-slate-100 text-slate-900 px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all">
                     Review Bids
                   </Link>
                </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}