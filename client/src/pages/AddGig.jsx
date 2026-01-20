import { useState } from "react";
import api from "../utils/axios";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

export default function AddGig() {
  const [formData, setFormData] = useState({ title: "", description: "", budget: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/gigs", formData);
      alert("Gig posted successfully!"); 
      navigate("/");
    } catch (err) {
      console.error("Error posting gig:", err);
    }
  };

  return (
    // Switched to a subtle slate gradient background for a more premium feel
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-50 via-gray-100 to-gray-200">
      <Navbar />
      
      <div className="max-w-xl mx-auto py-16 px-6">
        {/* HEADER SECTION */}
        <div className="text-center mb-10">
          <h2 className="text-4xl font-black tracking-tight text-slate-900 mb-2">Create a Gig</h2>
          <p className="text-slate-500 font-medium">Find the perfect freelancer for your project today.</p>
        </div>
        
        {/* FORM CARD: Added a subtle border and larger rounding */}
        <form 
          onSubmit={handleSubmit} 
          className="bg-white/70 backdrop-blur-xl p-10 rounded-3xl shadow-xl shadow-slate-200/60 border border-white space-y-6"
        >
          {/* TITLE INPUT */}
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-widest font-bold text-slate-500 ml-1">Project Title</label>
            <input 
              type="text" 
              placeholder="e.g. Build a Landing Page"
              required
              className="w-full bg-white border border-slate-200 p-4 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all placeholder:text-slate-400 text-slate-700"
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>

          {/* DESCRIPTION INPUT */}
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-widest font-bold text-slate-500 ml-1">Detailed Description</label>
            <textarea 
              required 
              rows="4"
              placeholder="Explain the project requirements and deliverables..."
              className="w-full bg-white border border-slate-200 p-4 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all placeholder:text-slate-400 text-slate-700 resize-none"
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          {/* BUDGET INPUT */}
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-widest font-bold text-slate-500 ml-1">Estimated Budget (₹)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
              <input 
                type="number" 
                required
                placeholder="0.00"
                className="w-full bg-white border border-slate-200 p-4 pl-9 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all text-slate-700 font-semibold"
                onChange={(e) => setFormData({...formData, budget: e.target.value})}
              />
            </div>
          </div>

          {/* SUBMIT BUTTON: Matches the Navbar primary button style */}
          <button 
            type="submit" 
            className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 active:scale-[0.98] transition-all mt-4"
          >
            Post Gig Now
          </button>
        </form>

        {/* FOOTER HINT */}
        <p className="text-center text-slate-400 text-xs mt-8 font-medium italic">
          Tip: Detailed descriptions attract higher quality applications.
        </p>
      </div>
    </div>
  );
}