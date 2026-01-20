import { useState } from "react";
import api from "../utils/axios";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast"; // Utilizing your existing toast library

export default function AddGig() {
  const [formData, setFormData] = useState({ title: "", description: "", budget: "" });
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
        
        {/* LEFT PANEL: Branding & Context */}
        <div className="lg:w-1/3 bg-slate-900 p-12 lg:p-20 flex flex-col justify-between text-white">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              New Listing
            </div>
            <h1 className="text-5xl font-black leading-[1.1] tracking-tighter mb-6">
              Hire the <span className="text-indigo-400">best</span> in minutes.
            </h1>
            <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-sm">
              Fill out the details and reach thousands of verified freelancers ready to work on your project.
            </p>
          </div>

          <div className="mt-12 lg:mt-0 pt-12 border-t border-slate-800">
            <div className="flex -space-x-3 mb-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-700 flex items-center justify-center text-[10px] font-bold">
                  U{i}
                </div>
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-indigo-600 flex items-center justify-center text-[10px] font-bold">
                +2k
              </div>
            </div>
            <p className="text-slate-500 text-sm">Join 2,000+ clients posting daily.</p>
          </div>
        </div>

        {/* RIGHT PANEL: The Form */}
        <div className="flex-1 bg-slate-50/50 p-6 lg:p-20 flex items-center justify-center">
          <form 
            onSubmit={handleSubmit} 
            className="w-full max-w-xl space-y-8"
          >
            {/* INPUT: TITLE */}
            <div className="group space-y-2">
              <label className="text-sm font-black text-slate-900 uppercase tracking-tighter italic">01. What is the project name?</label>
              <input 
                type="text" 
                placeholder="Design a Modern Dashboard"
                required
                className="w-full bg-transparent border-b-2 border-slate-200 py-4 text-2xl font-bold placeholder:text-slate-300 focus:border-indigo-600 focus:outline-none transition-all"
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>

            {/* INPUT: DESCRIPTION */}
            <div className="group space-y-2">
              <label className="text-sm font-black text-slate-900 uppercase tracking-tighter italic">02. Describe the requirements</label>
              <textarea 
                required 
                rows="3"
                placeholder="We need a React developer to build..."
                className="w-full bg-white border border-slate-200 p-6 rounded-2xl text-lg text-slate-700 shadow-sm focus:ring-0 focus:border-indigo-600 focus:outline-none transition-all resize-none"
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            {/* INPUT: BUDGET */}
            <div className="group space-y-2">
              <label className="text-sm font-black text-slate-900 uppercase tracking-tighter italic">03. Estimated Budget</label>
              <div className="relative flex items-center">
                <span className="absolute left-6 text-2xl font-bold text-slate-400 font-serif italic">₹</span>
                <input 
                  type="number" 
                  required
                  placeholder="5000"
                  className="w-full bg-white border border-slate-200 p-6 pl-14 rounded-2xl text-2xl font-black text-slate-900 focus:border-indigo-600 focus:outline-none transition-all"
                  onChange={(e) => setFormData({...formData, budget: e.target.value})}
                />
              </div>
            </div>

            {/* ACTION BUTTON */}
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="group relative w-full bg-slate-900 text-white font-black py-6 rounded-2xl overflow-hidden shadow-2xl hover:bg-indigo-600 active:scale-[0.97] transition-all disabled:opacity-50"
            >
              <span className="relative z-10 flex items-center justify-center gap-2 text-lg">
                {isSubmitting ? "Syncing to Cloud..." : "Deploy Project Listing"}
                {!isSubmitting && <span className="group-hover:translate-x-1 transition-transform">→</span>}
              </span>
            </button>
            
            <p className="text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
              Secure Payments • 24/7 Support • Verified Experts
            </p>
          </form>
        </div>

      </div>
    </div>
  );
}