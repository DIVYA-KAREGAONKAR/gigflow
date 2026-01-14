import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../utils/axios";
import Navbar from "../components/Navbar";

export default function GigDetails() {
  const { id } = useParams();

  const [gig, setGig] = useState(null);
  const [user, setUser] = useState(null);
  const [bid, setBid] = useState({ price: "", message: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api
      .get(`/gigs/${id}`)
      .then((res) => setGig(res.data))
      .catch((err) => console.error(err));
  }, [id]);

  useEffect(() => {
    api
      .get("/auth/me")
      .then((res) => setUser(res.data))
      .catch(() => setUser(null));
  }, []);

  const submitBid = async (e) => {
    e.preventDefault();
    if (!bid.price || !bid.message) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      await api.post("/bids", {
        gigId: id,
        price: bid.price,
        message: bid.message,
      });
      alert("Bid submitted successfully");
      setBid({ price: "", message: "" });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit bid");
    } finally {
      setLoading(false);
    }
  };

  if (!gig) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  // ✅ DEBUG LOGS: Check these in your browser console (F12)
  console.log("Logged-in User ID:", user?._id);
  console.log("Gig Owner ID:", gig?.ownerId);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="bg-white p-8 rounded-xl shadow-md">
          <h1 className="text-2xl font-bold text-gray-800">{gig.title}</h1>
          <p className="text-gray-600 mt-4">{gig.description}</p>
          <p className="mt-4 text-indigo-600 font-bold text-lg">Budget: ₹{gig.budget}</p>

          <hr className="my-6" />

          {/* 🔹 CLIENT (OWNER) → Show View Bids */}
          {/* ✅ FIX: Use String() to ensure IDs match correctly */}
          {user && gig.ownerId && String(user._id) === String(gig.ownerId) && (
            <div className="mb-6">
              <Link
                to={`/gigs/${gig._id}/bids`}
                className="bg-green-600 text-white px-4 py-2 rounded-lg inline-block hover:bg-green-700 transition"
              >
                View Bids
              </Link>
            </div>
          )}

          {/* 🔹 FREELANCER (NOT THE OWNER) → Show Submit Bid */}
          {/* ✅ FIX: Only show form if role is freelancer AND user is NOT the owner */}
          {user?.role === "freelancer" && String(user._id) !== String(gig.ownerId) && (
            <>
              <h2 className="text-xl font-semibold mb-4">Submit a Bid</h2>
              <form onSubmit={submitBid} className="space-y-4">
                <input
                  type="number"
                  placeholder="Your bid price (₹)"
                  className="w-full p-2 border rounded"
                  value={bid.price}
                  onChange={(e) => setBid({ ...bid, price: e.target.value })}
                />
                <textarea
                  placeholder="Message to client"
                  className="w-full p-2 border rounded"
                  rows="4"
                  value={bid.message}
                  onChange={(e) => setBid({ ...bid, message: e.target.value })}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading ? "Submitting..." : "Submit Bid"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}