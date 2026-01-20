'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { LogOut, BookOpen, UserCircle, Play, AlertCircle, Clock, History } from 'lucide-react';

interface UserData {
  id: number;
  name: string;
  email: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [subtests, setSubtests] = useState([]);
  const [errorPopup, setErrorPopup] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    axios.get('/api/auth/profile')
      .then(res => setUser(res.data.user))
      .catch(() => router.push('/auth/login'));
  }, [router]);

  useEffect(() => {
    axios.get('/api/subtests').then(res => setSubtests(res.data));
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
      router.push('/auth/login');
      router.refresh();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const startQuiz = async (id: number) => {
    try {
      const res = await axios.post('/api/quiz/session', { subtest_id: id });
      router.push(`/quiz/start/${res.data.session.id}`);
    } catch (err: any) {
      if (err.response?.data?.error === 'ACTIVE_SESSION_EXISTS') {
        setErrorPopup(err.response.data.message);
      }
    }
  };

  if (!user) return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white p-6">
      <p className="animate-pulse">Loading Quiz Dashboard...</p>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-black text-white">
      
      {/* SIDEBAR DESKTOP */}
      <aside className="hidden md:flex w-64 bg-zinc-900 border-r border-zinc-800 flex-col sticky top-0 h-screen">
        <div className="p-6">
          <h2 className="text-xl font-bold bg-linear-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent uppercase tracking-wider">
            Ambisius Quiz
          </h2>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <button className="w-full flex items-center gap-3 p-3 bg-zinc-800 rounded-xl text-white">
            <BookOpen size={20} /> Play Quiz
          </button>
          <button onClick={() => router.push('/dashboard/history')} className="w-full flex items-center gap-3 p-3 hover:bg-zinc-800 rounded-xl text-zinc-400 transition">
            <History size={20} /> Quiz History
          </button>
          <button onClick={() => router.push('/auth/profile')} className="w-full flex items-center gap-3 p-3 hover:bg-zinc-800 rounded-xl text-zinc-400 transition">
            <UserCircle size={20} /> My Profile
          </button>
        </nav>
        <div className="p-4 border-t border-zinc-800">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition font-medium">
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* MOBILE TOP BAR */}
      <div className="md:hidden flex items-center justify-between p-4 bg-zinc-900 border-b border-zinc-800 sticky top-0 z-50">
        <h2 className="text-xl font-bold bg-linear-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent uppercase tracking-wider">
            Ambisius Quiz
        </h2>
        <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold shadow-lg shadow-blue-500/20">
          {user.name.charAt(0).toUpperCase()}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-5 md:p-8 pb-24 md:pb-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold leading-tight">Welcome back, {user.name.split(' ')[0]}!</h1>
            <p className="text-zinc-400 text-sm md:text-base">Ready to test your knowledge today?</p>
          </div>
          <div className="hidden md:block bg-zinc-900 p-2 rounded-full border border-zinc-800 shadow-sm">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {errorPopup && (
          <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-2xl mb-6 flex items-start md:items-center justify-between gap-3">
            <div className="flex items-start md:items-center gap-3">
              <AlertCircle className="text-red-500 shrink-0" size={20} />
              <p className="text-sm text-red-200">{errorPopup}</p>
            </div>
            <button onClick={() => setErrorPopup(null)} className="text-xs font-bold uppercase tracking-wider text-red-500 hover:underline shrink-0">Tutup</button>
          </div>
        )}

        <h2 className="text-lg md:text-xl font-semibold mb-5 flex items-center gap-2">
          <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
          Available Quizzes
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {subtests.map((st: any) => (
            <div key={st.id} className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">{st.title}</h3>
                <div className="flex items-center gap-2 text-zinc-500 mb-6 text-sm">
                  <Clock size={16} className="text-zinc-400" /> {st.duration_minutes} Menit pengerjaan
                </div>
              </div>
              <button 
                onClick={() => startQuiz(st.id)}
                className="w-full bg-blue-600 active:scale-[0.98] md:hover:bg-blue-700 py-3.5 rounded-xl flex items-center justify-center gap-2 transition font-bold shadow-lg shadow-blue-600/10"
              >
                <Play size={18} fill="currentColor" /> Start Now
              </button>
            </div>
          ))}
        </div>
      </main>

      {/* BOTTOM NAVIGATION */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 px-2 py-3 flex justify-around items-center z-50 backdrop-blur-md">
        <button className="flex flex-col items-center gap-1.5 text-blue-500 px-4">
          <BookOpen size={20} />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Play</span>
        </button>
        <button onClick={() => router.push('/dashboard/history')} className="flex flex-col items-center gap-1.5 text-zinc-500 px-4">
          <History size={20} />
          <span className="text-[10px] font-bold uppercase tracking-tighter">History</span>
        </button>
        <button onClick={() => router.push('/auth/profile')} className="flex flex-col items-center gap-1.5 text-zinc-500 px-4">
          <UserCircle size={20} />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Profile</span>
        </button>
        <button onClick={handleLogout} className="flex flex-col items-center gap-1.5 text-red-500 px-4">
          <LogOut size={20} />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Exit</span>
        </button>
      </nav>

    </div>
  );
}