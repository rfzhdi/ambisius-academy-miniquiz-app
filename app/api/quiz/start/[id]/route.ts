import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: sessionId } = await params;

  try {
    // Ambil session dan waktu server sekarang (server_now)
    const sessionRes = await pool.query(
      `SELECT *, 
       EXTRACT(EPOCH FROM (expires_at - NOW()))::int as seconds_remaining 
       FROM quiz_sessions WHERE id = $1`, 
      [sessionId]
    );

    if (sessionRes.rowCount === 0) return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    
    const session = sessionRes.rows[0];
    const questionsRes = await pool.query(
      'SELECT id, question_text, options, correct_answer FROM questions WHERE subtest_id = $1 ORDER BY id ASC',
      [session.subtest_id]
    );

    return NextResponse.json({ session, questions: questionsRes.rows });
  } catch (err) {
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: sessionId } = await params;

  try {
    const { answers, currentIndex, isCompleted, score } = await req.json();

    // Cek kadaluarsa berdasarkan waktu database (NOW())
    const checkSession = await pool.query(
      'SELECT expires_at < NOW() as is_expired FROM quiz_sessions WHERE id = $1', 
      [sessionId]
    );
    
    if (checkSession.rows[0]?.is_expired && !isCompleted) {
      return NextResponse.json({ 
        error: 'SESSION_EXPIRED', 
        message: 'Waktu sudah habis.' 
      }, { status: 403 });
    }

    await pool.query(
      `UPDATE quiz_sessions 
       SET user_answers = $1, current_question_index = $2, is_completed = $3, score = $4 
       WHERE id = $5`,
      [JSON.stringify(answers), currentIndex, isCompleted, score || 0, sessionId]
    );
    return NextResponse.json({ message: 'Updated' });
  } catch (err) {
    return NextResponse.json({ error: 'Update Failed' }, { status: 500 });
  }
}