import { useState } from "react";
import api from "../utils/axios";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast"; // Utilizing your existing toast library

export default function AddGig() {
  const [formData, setFormData] = useState({ 
  title: "", 
  description: "", 
  budget: "",
  category: "Development", // Default category
  isVerifiedClient: true   // Typically handled by auth, but can be passed here
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
          <form onSubmit={handleSubmit} className="bg-white/70 backdrop-blur-xl p-10 rounded-3xl shadow-xl border border-white space-y-6">
    
    {/* 01. TITLE */}
    <div className="group space-y-2">
      <label className="text-sm font-black text-slate-900 uppercase italic">01. Project Name</label>
      <input 
        type="text" 
        required
        className="w-full bg-transparent border-b-2 border-slate-200 py-4 text-2xl font-bold focus:border-indigo-600 outline-none transition-all"
        onChange={(e) => setFormData({...formData, title: e.target.value})}
      />
    </div>

    {/* NEW: 02. CATEGORY SELECT */}
    <div className="group space-y-2">
      <label className="text-sm font-black text-slate-900 uppercase italic">02. Industry Category</label>
      <select 
        className="w-full bg-white border border-slate-200 p-4 rounded-2xl text-lg font-bold text-slate-700 focus:border-indigo-600 outline-none transition-all appearance-none cursor-pointer"
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
        className="w-full bg-white border border-slate-200 p-6 rounded-2xl text-lg shadow-sm focus:border-indigo-600 outline-none transition-all"
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
          className="w-full bg-white border border-slate-200 p-6 pl-14 rounded-2xl text-2xl font-black focus:border-indigo-600 outline-none transition-all"
          onChange={(e) => setFormData({...formData, budget: e.target.value})}
        />
      </div>
    </div>

    <button type="submit" className="...">Deploy Project</button>
  </form>
        </div>

      </div>
    </div>
  );
}