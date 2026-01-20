import { useState } from "react";
import api from "../utils/axios";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

export default function AddGig() {
  const [formData, setFormData] = useState({ 
    title: "", 
    description: "", 
    budget: "",
    category: "Development",
    isVerifiedClient: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post("/gigs", formData);
      toast.success("Project live on the marketplace!"); 
      navigate("/");
    } catch (err) {
      toast.error("Failed to post project.");
      console.error("Error:", err);
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-8 italic">
              New Listing
            </div>
            <h1 className="text-5xl font-black leading-[1.1] tracking-tighter mb-6 italic">Hire the <span className="text-indigo-400 underline decoration-indigo-400 decoration-8 underline-offset-8">best</span> in minutes.</h1>
            <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-sm">Fill out the details and reach thousands of verified freelancers ready to work on your project.</p>
          </div>
          <div className="mt-12 lg:mt-0 pt-12 border-t border-slate-800 text-slate-500 text-sm italic font-bold">Join 2,000+ clients posting daily.</div>
        </div>

        {/* RIGHT PANEL: The Form */}
        <div className="flex-1 bg-[#f8fafc] p-6 lg:p-20 flex items-center justify-center">
          <form onSubmit={handleSubmit} className="w-full max-w-xl space-y-10">
            {/* 01. TITLE */}
            <div className="group space-y-2">
              <label className="text-sm font-black text-slate-900 uppercase italic">01. Project Name</label>
              <input 
                type="text" 
                required
                className="w-full bg-transparent border-b-2 border-slate-200 py-4 text-2xl font-bold focus:border-indigo-600 outline-none transition-all placeholder:text-slate-200"
                placeholder="e.g. Build an AI Dashboard"
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>

            {/* 02. CATEGORY */}
            <div className="group space-y-2">
              <label className="text-sm font-black text-slate-900 uppercase italic">02. Industry Category</label>
              <select 
                className="w-full bg-white border border-slate-200 p-4 rounded-2xl text-lg font-bold text-slate-700 focus:border-indigo-600 outline-none transition-all appearance-none cursor-pointer shadow-sm"
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option value="Development">Development</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="AI / ML">AI / ML</option>
              </select>
            </div>

            {/* 03. DESCRIPTION */}
            <div className="group space-y-2">
              <label className="text-sm font-black text-slate-900 uppercase italic">03. Requirements</label>
              <textarea 
                required 
                rows="3"
                className="w-full bg-white border border-slate-200 p-6 rounded-2xl text-lg shadow-sm focus:border-indigo-600 outline-none transition-all resize-none"
                placeholder="Describe the mission briefing..."
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            {/* 04. BUDGET */}
            <div className="group space-y-2">
              <label className="text-sm font-black text-slate-900 uppercase italic">04. Budget (₹)</label>
              <div className="relative flex items-center">
                <span className="absolute left-6 text-2xl font-bold text-slate-400 italic">₹</span>
                <input 
                  type="number" 
                  required
                  className="w-full bg-white border border-slate-200 p-6 pl-14 rounded-2xl text-2xl font-black focus:border-indigo-600 outline-none transition-all shadow-sm"
                  placeholder="5000"
                  onChange={(e) => setFormData({...formData, budget: e.target.value})}
                />
              </div>
            </div>

            {/* THE SUBMIT BUTTON */}
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="group relative w-full bg-slate-900 text-white font-black py-6 rounded-2xl overflow-hidden shadow-2xl hover:bg-indigo-600 active:scale-[0.97] transition-all disabled:opacity-50 mt-4"
            >
              <div className="relative z-10 flex items-center justify-center gap-3 italic">
                {isSubmitting ? "Transmitting Intelligence..." : "Deploy Project Listing"}
                {!isSubmitting && <span className="group-hover:translate-x-1 transition-transform">→</span>}
              </div>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}