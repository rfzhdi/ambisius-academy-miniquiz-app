import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyJWT } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const payload: any = await verifyJWT(token);

    const historyRes = await pool.query(
      `SELECT 
        qs.id, 
        qs.score, 
        qs.is_completed, 
        -- Konversi UTC ke Asia/Jakarta (GMT+7)
        (qs.start_time AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta') as start_time,
        (qs.expires_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta') as expires_at,
        s.title as subtest_title,
        EXTRACT(EPOCH FROM (qs.expires_at - NOW()))::int as seconds_remaining
      FROM quiz_sessions qs
      LEFT JOIN subtests s ON qs.subtest_id = s.id
      WHERE qs.user_id = $1
      ORDER BY qs.start_time DESC`,
      [payload.id]
    );

    return NextResponse.json(historyRes.rows);
  } catch (err: any) {
    console.error("DEBUG_HISTORY_ERROR:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}