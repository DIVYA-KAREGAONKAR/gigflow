import { useEffect, useState } from "react";
import api from "../utils/axios";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

export default function Gigs() {
  const [gigs, setGigs] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // State for search

  useEffect(() => {
    // Fetch gigs whenever searchTerm changes
    const fetchGigs = async () => {
      try {
        const res = await api.get(`/gigs?search=${searchTerm}`);
        setGigs(res.data);
      } catch (err) {
        console.error("Error fetching gigs:", err);
      }
    };

    // Optional: Add a small debounce to avoid too many API calls
    const delayDebounceFn = setTimeout(() => {
      fetchGigs();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Find your next gig</h2>
            <p className="text-gray-500 mt-2">Browse open freelance projects and start earning today.</p>
          </div>

          {/* --- SEARCH INPUT --- */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search by title..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none w-full md:w-80"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {gigs.length > 0 ? (
            gigs.map((gig) => (
              <div key={gig._id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition">
                <h3 className="text-xl font-semibold text-gray-800">{gig.title}</h3>
                <p className="text-gray-600 mt-2 text-sm">{gig.description}</p>
                <div className="mt-6 flex justify-between items-center">
                  <span className="text-indigo-600 font-bold text-lg">₹{gig.budget}</span>
                  <Link to={`/gigs/${gig._id}`} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
                    View & Bid
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No gigs found matching "{searchTerm}"</p>
          )}
        </div>
      </div>
    </div>
  );
}
