"use client";

import { useState } from "react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Register gagal");
      }

      setSuccess("Registrasi berhasil! Cek email untuk verifikasi.");
    
      setName("");
      setEmail("");
      setPassword("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <form
        onSubmit={handleRegister}
        className="bg-zinc-900 p-8 rounded-xl w-full max-w-md space-y-4 border border-zinc-800"
      >
        <h1 className="text-2xl font-bold text-white text-center">Register</h1>

        {error && <div className="p-3 text-sm bg-red-500/10 border border-red-500 text-red-500 rounded">{error}</div>}
        {success && <div className="p-3 text-sm bg-green-500/10 border border-green-500 text-green-500 rounded">{success}</div>}
        
        <input
          type="text"
          placeholder="Full Name"
          required
          className="w-full p-3 rounded bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email Address"
          required
          className="w-full p-3 rounded bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          required
          minLength={6}
          className="w-full p-3 rounded bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button 
          disabled={loading}
          className="w-full bg-white text-black py-3 rounded font-semibold hover:bg-zinc-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Processing..." : "Register"}
        </button>

        <div className="mt-4">
          <p className="text-zinc-400 text-sm text-center">
            Sudah punya akun?{" "}
            <a href="/auth/login" className="text-white hover:underline">
              Login
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}