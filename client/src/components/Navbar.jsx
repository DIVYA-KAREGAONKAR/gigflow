import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-indigo-600">
          GigFlow
        </h1>

        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="text-gray-600 hover:text-indigo-600 font-medium"
          >
            Gigs
          </Link>

          <Link
            to="/login"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Register
          </Link>
        </div>
      </div>
    </nav>
  );
}
