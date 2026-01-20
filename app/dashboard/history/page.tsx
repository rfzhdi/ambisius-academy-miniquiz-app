"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Clock, PlayCircle, ChevronLeft, Calendar, Timer } from "lucide-react";

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const router = useRouter();

  useEffect(() => {
    axios.get("/api/auth/history").then((res) => {
      console.log("Data History dari DB:", res.data);
      setHistory(res.data);
    });
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return "Waktu tidak tercatat";

    const date = new Date(dateString);
    // Cek apakah objek date valid
    if (isNaN(date.getTime())) {
      return "Format waktu salah";
    }

    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 md:mb-8 transition group text-sm md:text-base"
        >
          <ChevronLeft
            size={18}
            className="group-hover:-translate-x-1 transition-transform"
          />{" "}
          Back to Dashboard
        </button>

        <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">
          Quiz History
        </h1>

        <div className="grid gap-4 md:gap-6">
          {history.map((item: any) => (
            <div
              key={item.id}
              onClick={() => router.push(`/quiz/${item.id}/detail`)} // Arahkan ke halaman detail
              className="bg-zinc-900 border border-zinc-800 p-5 md:p-6 rounded-2xl md:rounded-3xl transition-all hover:border-blue-500/50 hover:bg-zinc-800/50 cursor-pointer shadow-xl group/card"
            >
              <div className="flex flex-col md:flex-row justify-between gap-4 md:gap-6">
                {/* Bagian Kiri: Info Kuis */}
                <div className="space-y-3 md:space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider ${
                        item.is_completed
                          ? "bg-green-500/10 text-green-500"
                          : "bg-amber-500/10 text-amber-500"
                      }`}
                    >
                      {item.is_completed ? "Selesai" : "Sedang Berjalan"}
                    </span>
                  </div>
                  <h3 className="text-lg md:text-2xl font-bold leading-tight group-hover/card:text-blue-400 transition-colors">
                    {item.subtest_title}
                  </h3>

                  <div className="flex flex-col gap-2 text-[11px] md:text-sm text-zinc-400">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-blue-500 shrink-0" />
                      <span className="truncate">
                        Mulai: {formatDate(item.start_time)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Timer size={14} className="text-red-500 shrink-0" />
                      <span className="truncate">
                        Berakhir: {formatDate(item.expires_at)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bagian Kanan: Skor & Action */}
                <div className="flex flex-row md:flex-col justify-between md:justify-center items-center md:items-end border-t md:border-t-0 md:border-l border-zinc-800 pt-4 md:pt-0 md:pl-8 w-full md:w-40">
                  {item.is_completed ? (
                    <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto">
                      <p className="text-zinc-500 text-[10px] uppercase font-bold md:mb-1">
                        Skor Akhir
                      </p>
                      <span className="text-2xl md:text-4xl font-black text-blue-500 leading-none">
                        {item.score}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full gap-3">
                      {item.seconds_remaining > 0 ? (
                        <>
                          <div className="text-left md:text-right">
                            <p className="text-zinc-500 text-[10px] uppercase font-bold">
                              Sisa Waktu
                            </p>
                            <span className="text-sm md:text-xl font-mono font-bold text-white leading-none">
                              {Math.floor(item.seconds_remaining / 60)}m{" "}
                              {item.seconds_remaining % 60}s
                            </span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Mencegah navigasi ke halaman detail
                              router.push(`/quiz/${item.id}`);
                            }}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 md:px-5 md:py-2.5 rounded-xl text-xs md:text-sm font-bold transition shadow-lg shrink-0"
                          >
                            <PlayCircle size={16} /> Lanjutkan
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center justify-between w-full md:flex-col md:items-end">
                          <p className="text-red-500 text-[10px] uppercase font-bold">
                            Waktu Habis
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Mencegah navigasi ke halaman detail
                              router.push(`/quiz/${item.id}/result`);
                            }}
                            className="text-zinc-400 hover:text-white text-[11px] md:text-sm underline decoration-zinc-700 underline-offset-4"
                          >
                            Lihat Hasil
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {history.length === 0 && (
            <div className="text-center py-16 md:py-24 bg-zinc-900/30 rounded-3xl border border-dashed border-zinc-800">
              <Clock size={32} className="mx-auto text-zinc-700 mb-4" />
              <p className="text-zinc-500 text-sm md:text-base px-4">
                Belum ada riwayat pengerjaan kuis.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
