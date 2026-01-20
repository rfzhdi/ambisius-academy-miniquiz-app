'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { Trophy, Home, RotateCcw, CheckCircle2, XCircle } from 'lucide-react';

interface QuizResult {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  title: string;
}

export default function ResultPage() {
  const { id } = useParams();
  const router = useRouter();
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`/api/quiz/start/${id}`)
      .then(res => {
        const session = res.data.session;
        // Hitung hasil akhir
        setResult({
          score: session.score || 0,
          totalQuestions: res.data.questions.length,
          correctAnswers: Math.round((session.score / 100) * res.data.questions.length),
          title: "Hasil Kuis Anda"
        });
        setLoading(false);
      })
      .catch(() => {
        router.push('/dashboard');
      });
  }, [id, router]);

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white">
      <p className="animate-pulse text-xl">Menghitung skor...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center shadow-2xl">
          
          {/* Trophy Icon */}
          <div className="inline-flex p-4 bg-yellow-500/10 rounded-full text-yellow-500 mb-6">
            <Trophy size={48} />
          </div>

          <h1 className="text-3xl font-bold mb-2">Quiz Selesai!</h1>
          <p className="text-zinc-400 mb-8">Kerja bagus! Berikut adalah pencapaian kamu:</p>

          {/* Score Circle */}
          <div className="relative inline-flex items-center justify-center mb-8">
             <div className="text-6xl font-black bg-linear-to-br from-blue-500 to-purple-500 bg-clip-text text-transparent">
               {result?.score}
             </div>
             <div className="absolute -bottom-4 text-xs font-bold uppercase tracking-widest text-zinc-500">
               Total Score
             </div>
          </div>

          {/* Stats Breakdown */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-zinc-800/50 p-4 rounded-2xl border border-zinc-700">
              <div className="flex items-center justify-center gap-2 text-green-500 mb-1">
                <CheckCircle2 size={18} />
                <span className="text-sm font-bold">Benar</span>
              </div>
              <p className="text-xl font-bold">{result?.correctAnswers}</p>
            </div>
            <div className="bg-zinc-800/50 p-4 rounded-2xl border border-zinc-700">
              <div className="flex items-center justify-center gap-2 text-zinc-500 mb-1">
                <XCircle size={18} />
                <span className="text-sm font-bold">Total Soal</span>
              </div>
              <p className="text-xl font-bold">{result?.totalQuestions}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button 
              onClick={() => router.push('/dashboard')}
              className="w-full bg-white text-black font-bold py-4 rounded-2xl hover:bg-zinc-200 transition flex items-center justify-center gap-2"
            >
              <Home size={20} /> Kembali ke Dashboard
            </button>
            <button 
              onClick={() => router.push('/dashboard')}
              className="w-full bg-zinc-800 text-white font-bold py-4 rounded-2xl hover:bg-zinc-700 transition flex items-center justify-center gap-2"
            >
              <RotateCcw size={20} /> Coba Kuis Lain
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}