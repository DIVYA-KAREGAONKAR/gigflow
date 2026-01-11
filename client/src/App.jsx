

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Gigs from "./pages/Gigs";
import Login from "./pages/Login";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Gigs />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}
