

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Gigs from "./pages/Gigs";
import Login from "./pages/Login";
import './index.css';
import GigDetails from "./pages/GigDetails";
import GigBids from "./pages/AddGig";

import ViewBids from "./pages/ViewBids";
import Register from "./pages/Register";
import AddGig from "./pages/AddGig";


export default function App() {
  return (
    
      <Routes>
        <Route path="/" element={<Gigs />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/gigs/:id" element={<GigDetails />} />
        <Route path="/gigs/:gigId/bids" element={<ViewBids />} />
       <Route path="/add-gig" element={<AddGig />} />
      </Routes>
  );
}
