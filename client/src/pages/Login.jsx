import { useState } from "react";
import api from "../utils/axios";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });

  const submit = async (e) => {
    e.preventDefault();
    await api.post("/api/auth/login", form);
    alert("Login successful");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-gray-100">
      <form
        onSubmit={submit}
        className="bg-white rounded-2xl shadow-xl p-8 w-96"
      >
        <h2 className="text-3xl font-bold text-center text-indigo-600 mb-2">
          Welcome Back
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Login to continue to GigFlow
        </p>

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          onChange={e => setForm({ ...form, email: e.target.value })}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-6 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          onChange={e => setForm({ ...form, password: e.target.value })}
        />

        <button
          className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
        >
          Login
        </button>
      </form>
    </div>
  );
}
