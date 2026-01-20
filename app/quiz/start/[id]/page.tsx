'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { ChevronRight, ChevronLeft, Send, AlertCircle } from 'lucide-react';

interface Question {
  id: number;
  question_text: string;
  options: string[];
  correct_answer?: number;
}

export default function QuizInterface() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    axios.get(`/api/quiz/start/${id}`)
      .then(res => {
        const { session, questions: fetchedQuestions } = res.data;
        
        // Validasi keberadaan soal
        if (!fetchedQuestions || fetchedQuestions.length === 0) {
          setQuestions([]);
          return;
        }

        setQuestions(fetchedQuestions);
        setCurrentIndex(Number(session.current_question_index) || 0);

        // Sinkronisasi Jawaban
        if (session.user_answers && Array.isArray(session.user_answers)) {
          setAnswers(session.user_answers);
        } else {
          setAnswers(new Array(fetchedQuestions.length).fill(null));
        }

        // Logika Timer
        const remaining = session.seconds_remaining;
        if (remaining !== undefined && remaining <= 0) {
          setIsExpired(true);
          setTimeLeft(0);
        } else {
          setIsExpired(false);
          setTimeLeft(remaining); 
        }
      })
      .catch(err => {
        console.error("Gagal load kuis:", err);
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Logika Countdown
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) {
      if (timeLeft === 0) setIsExpired(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev !== null && prev <= 1) {
          clearInterval(timer);
          setIsExpired(true);
          return 0;
        }
        return prev !== null ? prev - 1 : null;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (optionIndex: number) => {
    if (isExpired) return;
    const newAnswers = [...answers];
    newAnswers[currentIndex] = optionIndex;
    setAnswers(newAnswers);
    
    // Auto-save progress ke DB
    axios.patch(`/api/quiz/start/${id}`, { 
      answers: newAnswers, 
      currentIndex: currentIndex,
      isCompleted: false 
    }).catch(err => console.error("Gagal auto-save:", err));
  };

  const handleSubmit = async () => {
    if (questions.length === 0 || isSubmitting) return;
    setIsSubmitting(true);
    try {
      let correctCount = 0;
      questions.forEach((q, index) => {
        if (answers[index] === q.correct_answer) {
          correctCount++;
        }
      });

      const finalScore = Math.round((correctCount / questions.length) * 100);

      await axios.patch(`/api/quiz/start/${id}`, { 
        answers: answers, 
        currentIndex: currentIndex,
        isCompleted: true,
        score: finalScore
      });

      router.push(`/quiz/start/${id}/result`);
    } catch (err) {
      alert("Terjadi kesalahan saat menyimpan hasil.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center font-medium">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        Memuat Pertanyaan...
      </div>
    </div>
  );

  if (questions.length === 0) return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
      <AlertCircle size={48} className="text-zinc-500 mb-4" />
      <h1 className="text-xl font-bold mb-2">Soal tidak ditemukan</h1>
      <p className="text-zinc-400 mb-6">Database soal untuk kuis ini masih kosong atau ID subtest tidak cocok.</p>
      <button onClick={() => router.push('/dashboard')} className="px-6 py-2 bg-zinc-800 rounded-xl hover:bg-zinc-700 transition">
        Kembali ke Dashboard
      </button>
    </div>
  );

  const currentQ = questions[currentIndex];

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 pb-10">
      <div className="max-w-3xl mx-auto">
        {/* Tampilan Timer */}
        <div className={`mb-4 md:mb-6 px-4 py-2.5 md:py-3 rounded-xl md:rounded-2xl border flex items-center justify-between sticky top-2 z-30 backdrop-blur-md ${isExpired ? 'bg-red-500/20 border-red-500/50' : 'bg-zinc-900/90 border-zinc-800'}`}>
          <div className="flex items-center gap-2 text-zinc-400 text-xs md:text-sm font-medium">
            Sisa Waktu:
          </div>
          <span className={`text-base md:text-xl font-mono font-bold ${isExpired ? 'text-red-500' : 'text-blue-500'}`}>
            {isExpired ? "WAKTU HABIS" : formatTime(timeLeft || 0)}
          </span>
        </div>

        {/* Overlay Jika Expired */}
        {isExpired && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-800 p-6 md:p-8 rounded-3xl max-w-sm text-center shadow-2xl">
              <h2 className="text-xl md:text-2xl font-bold text-red-500 mb-2">Sesi Berakhir</h2>
              <p className="text-zinc-400 text-sm mb-6">Waktu pengerjaan sudah habis. Data terakhir Anda telah tersimpan secara otomatis.</p>
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold transition">
                Kembali ke Dashboard
              </button>
            </div>
          </div>
        )}

        {/* Question Card */}
        <div className="bg-zinc-900 border border-zinc-800 p-5 md:p-8 rounded-2xl md:rounded-3xl mb-4 md:mb-6 shadow-xl">
          <div className="mb-3 md:mb-4 text-[10px] md:text-sm font-bold text-blue-500 uppercase tracking-[0.2em]">
            Pertanyaan {currentIndex + 1} dari {questions.length}
          </div>
          <h2 className="text-lg md:text-xl font-semibold leading-relaxed mb-6 md:mb-8 text-zinc-100">
            {currentQ.question_text}
          </h2>

          <div className="space-y-3">
            {currentQ.options.map((option: string, idx: number) => (
              <button
                key={idx}
                onClick={() => handleSelectOption(idx)}
                className={`w-full text-left p-4 md:p-5 rounded-xl md:rounded-2xl border transition-all duration-200 flex items-center gap-3 md:gap-4 active:scale-[0.98] ${
                  answers[currentIndex] === idx 
                  ? 'border-blue-500 bg-blue-500/10 text-white' 
                  : 'border-zinc-800 bg-zinc-800/30 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800'
                }`}
              >
                <span className={`w-8 h-8 md:w-10 md:h-10 shrink-0 rounded-lg md:rounded-xl flex items-center justify-center border font-bold text-xs md:text-sm transition-colors ${
                  answers[currentIndex] === idx ? 'border-blue-500 bg-blue-500 text-white' : 'border-zinc-700 bg-zinc-900'
                }`}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="flex-1 text-sm md:text-base leading-snug">{option}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center gap-3 md:gap-4">
          <button
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 md:py-4 rounded-xl md:rounded-2xl bg-zinc-900 border border-zinc-800 disabled:opacity-20 text-xs md:text-base hover:bg-zinc-800 transition font-bold"
          >
            <ChevronLeft size={18} /> Sebelumnya
          </button>

          {currentIndex === questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || isExpired}
              className="flex-[1.5] flex items-center justify-center gap-2 py-3.5 md:py-4 rounded-xl md:rounded-2xl bg-blue-600 hover:bg-blue-700 font-bold transition shadow-lg disabled:opacity-50 text-xs md:text-base"
            >
              {isSubmitting ? "Menyimpan..." : <><Send size={16} /> Selesai & Submit</>}
            </button>
          ) : (
            <button
              onClick={() => setCurrentIndex(prev => prev + 1)}
              className="flex-[1.5] flex items-center justify-center gap-2 py-3.5 md:py-4 rounded-xl md:rounded-2xl bg-blue-600 hover:bg-blue-700 font-bold transition shadow-lg text-xs md:text-base"
            >
              Selanjutnya <ChevronRight size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}