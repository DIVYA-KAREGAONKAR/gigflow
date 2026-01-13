import { useEffect, useState } from "react";
import api from "../utils/axios";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

export default function Gigs() {
  const [gigs, setGigs] = useState([]);

  useEffect(() => {
    api
      .get("/gigs")
      .then((res) => setGigs(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-bold text-gray-800">
          Find your next gig
        </h2>
        <p className="text-gray-500 mt-2 mb-8">
          Browse open freelance projects and start earning today.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {gigs.map((gig) => (
            <div
              key={gig._id}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition"
            >
              <h3 className="text-xl font-semibold text-gray-800">
                {gig.title}
              </h3>

              <p className="text-gray-600 mt-2 text-sm">
                {gig.description}
              </p>

              <div className="mt-6 flex justify-between items-center">
                <span className="text-indigo-600 font-bold text-lg">
                  ₹{gig.budget}
                </span>

                <Link
                  to={`/gigs/${gig._id}`}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                >
                  View & Bid
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
