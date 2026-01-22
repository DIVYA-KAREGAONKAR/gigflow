import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../utils/axios";
import Navbar from "../components/Navbar";
import { toast, Toaster } from "react-hot-toast";
import { PayPalButtons } from "@paypal/react-paypal-js";

export default function ViewBids() {
  const { gigId } = useParams();
  const [bids, setBids] = useState([]);
  const [gig, setGig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bidRes, gigRes] = await Promise.all([
            api.get(`/bids/gig/${gigId}`),
            api.get(`/gigs/${gigId}`)
        ]);
        setBids(bidRes.data);
        setGig(gigRes.data);
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    if (gigId) fetchData();
  }, [gigId]);

  if (loading) return <div className="h-screen flex items-center justify-center font-black animate-pulse text-slate-300">SCANNING PROPOSALS...</div>;

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />
      <Toaster />
      <div className="max-w-6xl mx-auto px-8 py-16">
        <header className="mb-12 flex justify-between items-end">
          <div>
            <Link to="/" className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 block">← Marketplace</Link>
            <h1 className="text-5xl font-black tracking-tighter italic">Proposals <span className="text-indigo-600">Verified.</span></h1>
          </div>
        </header>

        <div className="space-y-6">
          {bids.map(bid => (
            <div key={bid._id} className="bg-white border border-slate-100 p-10 rounded-[2.5rem] shadow-xl flex flex-col lg:flex-row justify-between lg:items-center gap-10">
              <div className="flex-1">
                <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-md text-[10px] font-black uppercase italic mb-4 inline-block">{bid.status}</span>
                <p className="text-xl text-slate-600 font-medium italic">"{bid.message}"</p>
              </div>

              <div className="flex items-center gap-8 lg:pl-12 lg:border-l">
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase italic">Quote</p>
                  <p className="text-3xl font-black">₹{bid.price}</p>
                </div>

                {/* Integration of PayPal on the Bids page */}
                {bid.status === "pending" && gig?.status === "open" && (
                  <div className="w-48">
                    <PayPalButtons 
                      style={{ layout: 'horizontal', label: 'pay', height: 45, shape: 'pill' }}
                      createOrder={(data, actions) => {
                        return actions.order.create({
                          purchase_units: [{ amount: { value: bid.price.toString() } }]
                        });
                      }}
                      onApprove={async (data, actions) => {
                        await actions.order.capture();
                        await api.patch(`/bids/${bid._id}/hire`); // Confirm on backend
                        toast.success("Hired Successfully!");
                        window.location.reload();
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}