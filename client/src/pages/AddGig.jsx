import { useState } from "react";
import api from "../utils/axios";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

export default function AddGig() {
  const [formData, setFormData] = useState({ 
    title: "", description: "", budget: "", category: "Development", isVerifiedClient: true 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post("/gigs", formData);
      toast.success("Mission live on the Marketplace."); 
      navigate("/");
    } catch (err) {
      toast.error("Deployment failed.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white selection:bg-indigo-100">
      <Navbar />
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-64px)]">
        
        {/* LEFT PANEL */}
        <div className="lg:w-1/3 bg-slate-900 p-12 lg:p-20 flex flex-col justify-between text-white">
          <div>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-8 italic">New Briefing</div>
            <h1 className="text-5xl font-black leading-[1.1] tracking-tighter mb-6 italic">Hire the <span className="text-indigo-400 underline decoration-8 underline-offset-8">best</span> in minutes.</h1>
            <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-sm">Reach the world's most elite verified freelancers instantly.</p>
          </div>
          <div className="mt-12 lg:mt-0 pt-12 border-t border-slate-800 text-slate-500 text-xs italic font-bold uppercase tracking-widest">Join 2,000+ daily clients.</div>
        </div>

        {/* FORM */}
        <div className="flex-1 bg-[#f8fafc] p-6 lg:p-20 flex items-center justify-center">
          <form onSubmit={handleSubmit} className="w-full max-w-xl space-y-10">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-900 uppercase italic tracking-widest">01. Project Name</label>
              <input type="text" required className="w-full bg-transparent border-b-2 border-slate-200 py-4 text-2xl font-bold focus:border-indigo-600 outline-none transition-all italic" placeholder="e.g. AI-Powered Dashboard" onChange={(e) => setFormData({...formData, title: e.target.value})} />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-900 uppercase italic tracking-widest">02. Industry</label>
              <select className="w-full bg-white border border-slate-200 p-5 rounded-2xl text-lg font-bold text-slate-700 focus:border-indigo-600 outline-none transition-all shadow-sm cursor-pointer" onChange={(e) => setFormData({...formData, category: e.target.value})}>
                <option value="Development">Development</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="AI / ML">AI / ML</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-900 uppercase italic tracking-widest">03. Mission Briefing</label>
              <textarea required rows="4" className="w-full bg-white border border-slate-200 p-6 rounded-2xl text-lg shadow-sm focus:border-indigo-600 outline-none transition-all resize-none" placeholder="Requirements..." onChange={(e) => setFormData({...formData, description: e.target.value})} />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-900 uppercase italic tracking-widest">04. Fixed Budget (₹)</label>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-300 italic">₹</span>
                <input type="number" required className="w-full bg-white border border-slate-200 p-6 pl-14 rounded-2xl text-3xl font-black focus:border-indigo-600 outline-none shadow-sm italic" onChange={(e) => setFormData({...formData, budget: e.target.value})} />
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full bg-slate-900 text-white font-black py-6 rounded-2xl shadow-2xl hover:bg-indigo-600 active:scale-[0.97] transition-all disabled:opacity-50 uppercase tracking-[0.2em] text-xs">
              {isSubmitting ? "Syncing to Cloud..." : "Deploy Listing →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}