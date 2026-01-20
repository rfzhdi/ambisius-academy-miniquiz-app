"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { ShieldCheck, ArrowLeft } from "lucide-react";

export default function ChangePasswordPage() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return alert("Konfirmasi password tidak cocok!");
    }

    setLoading(true);
    try {
      const res = await axios.post("/api/auth/change-password", {
        oldPassword,
        newPassword,
      });
      alert(res.data.message);
      router.push("/dashboard");
    } catch (err: any) {
      alert(err.response?.data?.error || "Gagal mengganti password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft size={18} /> Back
        </button>

        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-xl">
          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mb-3">
              <ShieldCheck size={28} />
            </div>
            <h1 className="text-2xl font-bold text-center">Change Password</h1>
          </div>

          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="text-sm text-zinc-400 block mb-1">
                Old Password
              </label>
              <input
                type="password"
                required
                className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm text-zinc-400 block mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm text-zinc-400 block mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button
              disabled={loading}
              className="w-full bg-white text-black font-bold py-3 rounded-xl mt-4 hover:bg-zinc-200 transition disabled:opacity-50"
            >
              {loading ? "Memproses..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
