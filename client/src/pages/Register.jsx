import { useEffect, useState } from "react";
import api from "../utils/axios";
import { useNavigate, Link } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "freelancer",
    skills: "", // Temporary string to hold comma-separated input
    bio: ""
  });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Prepare data for backend: Convert skills string to Array
    const finalData = {
      ...form,
      skills: form.skills.split(",").map(skill => skill.trim()).filter(skill => skill !== "")
    };

    try {
      await api.post("/auth/register", finalData);
      toast.success("Account created successfully!");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white selection:bg-indigo-100">
      <Toaster />
      
      {/* LEFT SIDE: Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900 items-center justify-center p-12">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full bg-blue-600 blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-purple-600 blur-[120px]"></div>
        </div>
        
        <div className="relative z-10 max-w-md text-right">
          <h1 className="text-7xl font-black leading-[0.9] tracking-tighter text-white mb-6">
            Join the <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Flow.</span>
          </h1>
          <p className="text-slate-400 text-xl font-medium leading-relaxed">
            Create your profile today and start collaborating with top-tier partners worldwide.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#f8fafc]">
        <div className="w-full max-w-md overflow-y-auto max-h-screen py-10 no-scrollbar">
          <div className="mb-10">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-indigo-600 mb-2 italic">Onboarding</h2>
            <h3 className="text-4xl font-black tracking-tighter text-slate-900 italic">Get Started</h3>
          </div>

          <form onSubmit={submit} className="space-y-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic ml-1">Full Name</label>
              <input
                placeholder="Alex Carter"
                className="w-full bg-transparent border-b-2 border-slate-200 py-2 text-lg font-bold placeholder:text-slate-300 focus:border-indigo-600 focus:outline-none transition-all"
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic ml-1">Email Address</label>
              <input
                type="email"
                placeholder="alex@example.com"
                className="w-full bg-transparent border-b-2 border-slate-200 py-2 text-lg font-bold placeholder:text-slate-300 focus:border-indigo-600 focus:outline-none transition-all"
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic ml-1">Create Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-transparent border-b-2 border-slate-200 py-2 text-lg font-bold placeholder:text-slate-300 focus:border-indigo-600 focus:outline-none transition-all"
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic ml-1">Account Type</label>
              <select
                className="w-full bg-white border border-slate-200 p-3 rounded-xl text-md font-bold text-slate-700 shadow-sm focus:border-indigo-600 focus:outline-none transition-all appearance-none cursor-pointer"
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="freelancer">Freelancer — I want to work</option>
                <option value="client">Client — I want to hire</option>
              </select>
            </div>

            {/* --- NEW: SKILLS & BIO SECTION (Only for Freelancers) --- */}
            {form.role === "freelancer" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-indigo-500 italic ml-1">Technical Skills (Comma separated)</label>
                  <input
                    placeholder="React, Node.js, Python, Figma"
                    className="w-full bg-white border border-slate-200 p-4 rounded-xl text-md font-bold placeholder:text-slate-300 focus:border-indigo-600 focus:outline-none transition-all shadow-sm"
                    onChange={(e) => setForm({ ...form, skills: e.target.value })}
                    required={form.role === "freelancer"}
                  />
                  <p className="text-[9px] text-slate-400 font-bold italic ml-1">Required for AI Smart Match feature.</p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic ml-1">Professional Bio</label>
                  <textarea
                    placeholder="Briefly describe your expertise..."
                    className="w-full bg-white border border-slate-200 p-4 rounded-xl text-md font-bold placeholder:text-slate-300 focus:border-indigo-600 focus:outline-none transition-all shadow-sm min-h-[100px]"
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  />
                </div>
              </div>
            )}

            <button 
              disabled={loading}
              className="group relative w-full bg-slate-900 text-white font-black py-5 rounded-2xl overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.2)] hover:bg-indigo-600 active:scale-[0.97] transition-all disabled:opacity-50"
            >
              <span className="relative z-10 flex items-center justify-center gap-3 text-lg italic tracking-tight">
                {loading ? "Creating Account..." : "Confirm & Join"}
                {!loading && <span className="group-hover:translate-x-2 transition-transform">→</span>}
              </span>
            </button>
          </form>

          <p className="mt-8 text-center text-slate-500 font-bold text-xs uppercase tracking-widest">
            Already have an account? <Link to="/login" className="text-indigo-600 hover:text-slate-900 transition-colors">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}