import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
  try {
    const res = await pool.query(
      'SELECT id, title, description, duration_minutes FROM subtests WHERE is_active = true ORDER BY id ASC'
    );
    
    return NextResponse.json(res.rows);
  } catch (err) {
    console.error("Error fetching subtests:", err);
    return NextResponse.json({ error: 'Gagal mengambil data subtest' }, { status: 500 });
  }
}