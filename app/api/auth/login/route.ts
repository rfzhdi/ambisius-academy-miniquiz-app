import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { comparePassword, generateJWT, generateRefreshToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  const resDb = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
  const user = resDb.rows[0];

  if (!user || !comparePassword(password, user.password)) {
    return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 });
  }
  if (!user.is_verified) {
    return NextResponse.json({ error: 'Email belum diverifikasi' }, { status: 403 });
  }

  const token = await generateJWT({ id: user.id, email: user.email });
  const refreshToken = await generateRefreshToken({ id: user.id });
  const response = NextResponse.json({
      success: true,
      message: 'Login sukses',
      data: {
        access_token: token,
        refresh_token: refreshToken,
        expires_in: 86400
      }
    });
  response.cookies.set({
    name: 'token',
    value: token,
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 // 1 hari
  });
  return response;
}
