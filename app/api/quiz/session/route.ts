import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyJWT } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // Validasi Token & User
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const payload: any = await verifyJWT(token);
    const { subtest_id } = await req.json();

    if (!subtest_id) {
      return NextResponse.json({ error: 'Subtest ID is required' }, { status: 400 });
    }

    // Ambil Daftar Soal berdasarkan subtest_id
    const subtestRes = await pool.query('SELECT duration_minutes FROM subtests WHERE id = $1', [subtest_id]);
    const duration = subtestRes.rows[0]?.duration_minutes || 30;
    const questionsRes = await pool.query(
      'SELECT id, question_text, options, correct_answer FROM questions WHERE subtest_id = $1 ORDER BY id ASC',
      [subtest_id]
    );

    // Peringatan jika tidak ada soal
    if (questionsRes.rowCount === 0) {
      console.warn(`[WARNING] Tidak ada soal untuk subtest_id: ${subtest_id}`);
    }

    // Cek apakah ada sesi aktif (Belum Selesai)
    const activeSession = await pool.query(
      'SELECT * FROM quiz_sessions WHERE user_id = $1 AND is_completed = false LIMIT 1',
      [payload.id]
    );

    if (activeSession.rowCount! > 0) {
      const session = activeSession.rows[0];
      
      // Jika buka subtest lain, tolak pembuatan sesi baru
      if (session.subtest_id !== parseInt(subtest_id)) {
        return NextResponse.json({ 
          error: 'ACTIVE_SESSION_EXISTS', 
          message: 'Selesaikan kuis sebelumnya yang masih aktif!' 
        }, { status: 400 });
      }

      // Jika subtest sama, kirim data lama (Resume)
      return NextResponse.json({ 
        session, 
        questions: questionsRes.rows, 
        isResume: true 
      });
    }

    // Jika tidak ada sesi aktif, buat Sesi Baru
    const newSession = await pool.query(
      `INSERT INTO quiz_sessions (
        user_id, 
        subtest_id, 
        start_time,
        expires_at, 
        is_completed, 
        current_question_index
      ) 
      VALUES ($1, $2, NOW(), NOW() + ($3 || ' minutes')::interval, false, 0) 
      RETURNING *, EXTRACT(EPOCH FROM (expires_at - NOW()))::int as seconds_remaining`,
      [payload.id, subtest_id, duration]
    );

    return NextResponse.json({
      session: newSession.rows[0], 
      questions: questionsRes.rows, 
      isResume: false 
    });

  } catch (err) {
    console.error("[SESSION_ERROR]:", err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}