import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/axios";
import Navbar from "../components/Navbar";

export default function GigBids() {
  const { gigId } = useParams();
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/bids/${gigId}`)
      .then((res) => setBids(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [gigId]);

  if (loading) {
    return <div className="p-10">Loading bids...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold mb-6">Bids</h2>

        {bids.length === 0 && (
          <p className="text-gray-500">No bids yet</p>
        )}

        {bids.map((bid) => (
          <div
            key={bid._id}
            className="bg-white p-4 mb-4 rounded-lg shadow"
          >
            <p className="text-gray-700">{bid.message}</p>
            <p className="font-bold mt-2">₹{bid.price}</p>
            <p className="text-sm text-gray-500">
              Status: {bid.status}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
