'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Mail, Save, CheckCircle } from 'lucide-react';

export default function ProfilePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    axios.get('/api/auth/profile')
      .then(res => {
        const userData = res.data.user || res.data;
        setName(userData.name);
        setEmail(userData.email);
        setLoading(false);
      })
      .catch(() => {
        router.push('/auth/login');
      });
  }, [router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setMessage("");

    try {
      await axios.put('/api/auth/profile', { name, email });
      setMessage("Profile updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      alert("Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white">
      <p className="animate-pulse">Loading Profile...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12">
      <div className="max-w-2xl mx-auto">
        {/* Tombol Back */}
        <button 
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition mb-8"
        >
          <ArrowLeft size={20} /> Back to Dashboard
        </button>

        <h1 className="text-3xl font-bold mb-2">My Profile</h1>
        <p className="text-zinc-400 mb-8">Manage your account information and email settings.</p>

        {message && (
          <div className="bg-green-500/10 border border-green-500 text-green-500 p-4 rounded-lg mb-6 flex items-center gap-3">
            <CheckCircle size={20} /> {message}
          </div>
        )}

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          <form onSubmit={handleUpdate} className="space-y-6">
            {/* Input Nama */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-zinc-500" size={20} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="Enter your name"
                  required
                />
              </div>
            </div>

            {/* Input Email */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-zinc-500" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={updating}
                className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-zinc-200 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {updating ? "Saving..." : <><Save size={20} /> Save Changes</>}
              </button>
            </div>
          </form>
        </div>

        {/* Change Password */}
        <div className="mt-8 p-6 border border-zinc-800 rounded-2xl flex items-center justify-between">
          <div>
            <h4 className="font-semibold">Security</h4>
            <p className="text-sm text-zinc-500">Want to change your password?</p>
          </div>
          <button 
            onClick={() => router.push('/auth/change-password')}
            className="text-sm bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg transition"
          >
            Update Password
          </button>
        </div>
      </div>
    </div>
  );
}