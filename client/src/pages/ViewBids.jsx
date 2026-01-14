import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/axios";
import Navbar from "../components/Navbar";

export default function ViewBids() {
  const { gigId } = useParams();
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBids = async () => {
      try {
        setLoading(true);
        // ✅ FIX: Added /gig/ to match the backend route: router.get("/gig/:gigId")
        const res = await api.get(`/bids/gig/${gigId}`);
        setBids(res.data);
      } catch (err) {
        console.error("Fetch Bids Error:", err);
        setError("Failed to load bids. Please ensure you are the gig owner.");
      } finally {
        setLoading(false);
      }
    };

    if (gigId) fetchBids();
  }, [gigId]);

  const hireBid = async (bidId) => {
    try {
      // ✅ This matches your backend route: router.patch("/:bidId/hire")
      await api.patch(`/bids/${bidId}/hire`);
      alert("Freelancer hired successfully!");
      
      // Update local state so the button disappears and status changes instantly
      setBids(prev => prev.map(b => 
        b._id === bidId ? { ...b, status: "hired" } : b
      ));
    } catch (err) {
      console.error("Hire Error:", err);
      alert(err.response?.data?.message || "Failed to hire freelancer.");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading bids...</p>;
  if (error) return <div className="text-center mt-10 text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Bids for this Gig</h1>
        {bids.length === 0 ? (
          <p className="text-gray-500 italic text-center">No bids yet for this gig.</p>
        ) : (
          <div className="space-y-4">
            {bids.map(bid => (
              <div key={bid._id} className="bg-white p-6 rounded-xl shadow flex justify-between items-center">
                <div>
                  <p className="font-semibold text-gray-800 text-lg">₹{bid.price}</p>
                  <p className="text-gray-600 text-sm mt-1">{bid.message}</p>
                  <span className={`inline-block mt-2 px-3 py-1 text-xs font-bold rounded-full ${
                    bid.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                    bid.status === "hired" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>
                    {bid.status.toUpperCase()}
                  </span>
                </div>
                {bid.status === "pending" && (
                  <button onClick={() => hireBid(bid._id)} className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition font-medium">
                    Hire
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
