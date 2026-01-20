import { useState } from "react";
import api from "../utils/axios";
import { useNavigate, Link } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/login", form);
      if (res.data && res.data.user) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
        toast.success("Welcome back!");
        setTimeout(() => {
          navigate("/");
          window.location.reload();
        }, 1000);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white selection:bg-indigo-100">
      <Toaster />
      
      {/* LEFT SIDE: High-Impact Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900 items-center justify-center p-12">
        {/* Abstract 3D Mesh Gradient Background */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] rounded-full bg-purple-600 blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600 blur-[120px]"></div>
        </div>
        
        <div className="relative z-10 max-w-md">
          <h1 className="text-7xl font-black leading-[0.9] tracking-tighter text-white mb-6">
            Hire the <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Best.</span>
          </h1>
          <p className="text-slate-400 text-xl font-medium leading-relaxed">
            The world’s most elite talent marketplace for modern developers and visionary clients.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Minimalist Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#f8fafc]">
        <div className="w-full max-w-md">
          <div className="mb-12">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-indigo-600 mb-2 italic">Access Portal</h2>
            <h3 className="text-4xl font-black tracking-tighter text-slate-900 italic">Sign In</h3>
          </div>

          <form onSubmit={submit} className="space-y-10">
            <div className="group space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic ml-1">Work Email</label>
              <input
                type="email"
                placeholder="name@company.com"
                className="w-full bg-transparent border-b-2 border-slate-200 py-4 text-2xl font-bold placeholder:text-slate-300 focus:border-indigo-600 focus:outline-none transition-all"
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="group space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic ml-1">Security Key</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-transparent border-b-2 border-slate-200 py-4 text-2xl font-bold placeholder:text-slate-300 focus:border-indigo-600 focus:outline-none transition-all"
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            <button 
              disabled={loading}
              className="group relative w-full bg-slate-900 text-white font-black py-6 rounded-2xl overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.2)] hover:bg-indigo-600 active:scale-[0.97] transition-all disabled:opacity-50"
            >
              <span className="relative z-10 flex items-center justify-center gap-3 text-lg italic tracking-tight">
                {loading ? "Verifying Credentials..." : "Launch Application"}
                {!loading && <span className="group-hover:translate-x-2 transition-transform">→</span>}
              </span>
            </button>
          </form>

          <p className="mt-12 text-center text-slate-500 font-bold text-xs uppercase tracking-widest">
            No account? <Link to="/register" className="text-indigo-600 hover:text-slate-900 transition-colors">Register Now</Link>
          </p>
        </div>
      </div>
    </div>
  );
}