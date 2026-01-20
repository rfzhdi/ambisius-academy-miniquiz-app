import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (!token) return NextResponse.json({ error: 'Token invalid' }, { status: 400 });

  const res = await pool.query('UPDATE users SET is_verified=true, verify_token=NULL WHERE verify_token=$1 RETURNING *', [token]);
  if (res.rowCount === 0) return NextResponse.json({ error: 'Token tidak valid atau sudah digunakan' }, { status: 400 });

  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL}/auth/login`);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: 'Token diperlukan' }, { status: 400 });
    }

    const res = await pool.query(
      'UPDATE users SET is_verified=true, verify_token=NULL WHERE verify_token=$1 RETURNING id, email', 
      [token]
    );

    if (res.rowCount === 0) {
      return NextResponse.json({ error: 'Token tidak valid atau sudah digunakan' }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Email berhasil diverifikasi!',
      user: res.rows[0] 
    }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}