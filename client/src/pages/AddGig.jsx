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
      // Sends data to the backend POST /api/gigs route
      await api.post("/gigs", formData);
      alert("Gig posted successfully!");
      navigate("/");
    } catch (err) {
      console.error("Error posting gig:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-2xl mx-auto py-10 px-6">
        <h2 className="text-3xl font-bold mb-6">Post a New Gig</h2>
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md space-y-4">
          <div>
            <label className="block text-sm font-medium">Gig Title</label>
            <input 
              type="text" required
              className="w-full border p-2 rounded mt-1"
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea 
              required className="w-full border p-2 rounded mt-1"
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Budget (₹)</label>
            <input 
              type="number" required
              className="w-full border p-2 rounded mt-1"
              onChange={(e) => setFormData({...formData, budget: e.target.value})}
            />
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">
            Post Gig
          </button>
        </form>
      </div>
    </div>
  );
}