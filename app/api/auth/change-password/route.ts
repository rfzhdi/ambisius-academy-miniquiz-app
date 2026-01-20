import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyJWT, hashPassword, comparePassword } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload: any = await verifyJWT(token);
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const { oldPassword, newPassword } = await req.json();

    // Ambil password lama
    const res = await pool.query('SELECT password FROM users WHERE id=$1', [payload.id]);
    const user = res.rows[0];

    // Cek apakah password lama benar
    if (!comparePassword(oldPassword, user.password)) {
      return NextResponse.json({ error: 'Password lama salah' }, { status: 400 });
    }

    // Hash password baru & update password
    const hashed = hashPassword(newPassword);
    await pool.query('UPDATE users SET password=$1 WHERE id=$2', [hashed, payload.id]);

    return NextResponse.json({ message: 'Password berhasil diperbarui' });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}