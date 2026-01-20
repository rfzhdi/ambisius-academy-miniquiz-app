"use client";

import { useState } from "react";
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (res.ok) {
      router.push("/dashboard");
      router.refresh();
    } else {
      alert(data.error || "Login gagal"); 
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <form
        onSubmit={handleSubmit}
        className="bg-zinc-900 p-8 rounded-xl w-full max-w-md space-y-4"
      >
        <h1 className="text-2xl font-bold text-white text-center">Login</h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 rounded bg-zinc-800 text-white"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 rounded bg-zinc-800 text-white"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="w-full bg-white text-black py-3 rounded font-semibold">
          Login
        </button>

        <div className="mt-6 md:mt-4">
          <p className="text-zinc-400 text-center text-sm md:text-base">
            Belum punya akun?{" "}
            <a href="/auth/register" className="text-blue-500 underline">
              Register
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}
