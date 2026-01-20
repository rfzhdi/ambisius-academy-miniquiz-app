"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import {
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Target,
  BarChart3,
  BookOpen,
} from "lucide-react";

export default function QuizDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`/api/quiz/start/${id}`)
      .then((res) => {
        console.log("Response Backend:", res.data);

        if (res.data.session) {
          const session = res.data.session;
          const questions = res.data.questions || [];

          const userAnswers =
            typeof session.user_answers === "string"
              ? JSON.parse(session.user_answers)
              : session.user_answers || {};

          let correctCount = 0;
          const formattedQuestions = (questions || []).map((q: any, index: number) => {
            const rawUserAnswer = userAnswers[index] ?? userAnswers[q.id.toString()];
            const isCorrect = rawUserAnswer?.toString() === q.correct_answer?.toString();

            if (isCorrect) correctCount++;

            let displayUserAnswer = "Tidak dijawab";
            if (rawUserAnswer !== null && rawUserAnswer !== undefined) {
                displayUserAnswer = q.options?.[rawUserAnswer] || rawUserAnswer;
            }

            let displayCorrectAnswer = q.correct_answer;
            if (q.options && q.options[q.correct_answer]) {
              displayCorrectAnswer = q.options[q.correct_answer];
            }
            return {
              ...q,
              question_number: index + 1,
              user_answer: displayUserAnswer,
              correct_answer: displayCorrectAnswer,
              is_correct_status: isCorrect,
            };
          });

          setData({
            ...session,
            subtest_name: session.subtest_title || "Quiz Detail",
            correct_count: correctCount,
            questions: formattedQuestions,
          });
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching detail:", err);
        setLoading(false);
      });
  }, [id]);

  if (loading)
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        Memuat detail...
      </div>
    );

  if (!data)
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        Data tidak ditemukan.
      </div>
    );

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header & Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition group"
        >
          <ChevronLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Back to History
        </button>

        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-black mb-2">
            {data.subtest_name}
          </h1>
          <p className="text-zinc-500">
            Taken on{" "}
            {new Date(data.expires_at).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatCard
            icon={<Target className="text-blue-500" />}
            label="Final Score"
            value={data.score || 0}
          />
          <StatCard
            icon={<BookOpen className="text-purple-500" />}
            label="Total Questions"
            value={data.questions.length}
          />
          <StatCard
            icon={<CheckCircle2 className="text-green-500" />}
            label="Correct"
            value={data.correct_count || 0}
          />
          <StatCard
            icon={<XCircle className="text-red-500" />}
            label="Incorrect"
            value={data.questions.length - (data.correct_count || 0)}
          />
        </div>

        {/* Review Soal */}
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <BarChart3 size={20} className="text-blue-500" />
          Answers Review
        </h2>

        <div className="space-y-4">
          {data.questions.map((q: any, index: number) => {
            const isCorrect = q.is_correct_status;
            return (
              <div
                key={index}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
              >
                <div className="flex justify-between items-start gap-4 mb-4">
                  <span className="bg-zinc-800 text-zinc-400 px-3 py-1 rounded-lg text-xs font-bold">
                    Soal {q.question_number}
                  </span>
                  {isCorrect ? (
                    <span className="flex items-center gap-1 text-green-500 text-xs font-bold uppercase">
                      <CheckCircle2 size={14} /> Correct
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-500 text-xs font-bold uppercase">
                      <XCircle size={14} /> Incorrect
                    </span>
                  )}
                </div>

                <p className="text-lg font-medium mb-4">{q.question_text}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div
                    className={`p-3 rounded-xl border ${isCorrect ? "border-green-500/30 bg-green-500/5" : "border-red-500/30 bg-red-500/5"}`}
                  >
                    <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">
                      Your Answer
                    </p>
                    <p className="font-semibold">
                      {q.user_answer || "Tidak dijawab"}
                    </p>
                  </div>
                  {!isCorrect && (
                    <div className="p-3 rounded-xl border border-blue-500/30 bg-blue-500/5">
                      <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">
                        Correct Answer
                      </p>
                      <p className="font-semibold text-blue-400">
                        {q.correct_answer}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: any;
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl shadow-xl">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-zinc-500 text-[10px] uppercase font-black tracking-wider">
          {label}
        </span>
      </div>
      <p className="text-2xl font-black">{value}</p>
    </div>
  );
}
