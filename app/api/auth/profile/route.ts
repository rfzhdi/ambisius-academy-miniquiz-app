import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyJWT } from '@/lib/auth';

// GET PROFILE
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) throw new Error('Unauthorized');

    const payload: any = await verifyJWT(token); 
    if (!payload) throw new Error('Invalid Token');

    const res = await pool.query('SELECT id, name, email FROM users WHERE id=$1', [payload.id]);
    
    return NextResponse.json({ user: res.rows[0] }); 
  } catch (err) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

// UPDATE PROFILE
export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload: any = await verifyJWT(token);
    const { name, email } = await req.json();

    // Validasi sederhana
    if (!name || !email) {
      return NextResponse.json({ error: 'Nama dan Email wajib diisi' }, { status: 400 });
    }

    // Update data ke database
    const updateRes = await pool.query(
      'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING id, name, email',
      [name, email, payload.id]
    );

    if (updateRes.rowCount === 0) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Profil berhasil diperbarui', 
      user: updateRes.rows[0] 
    });

  } catch (err: any) {
    console.error("UPDATE_PROFILE_ERROR:", err.message);
    return NextResponse.json({ error: 'Gagal memperbarui profil' }, { status: 500 });
  }
}