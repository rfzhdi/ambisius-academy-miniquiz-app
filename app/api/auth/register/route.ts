import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { randomBytes } from 'crypto';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json();
  const hashed = hashPassword(password);
  const token = randomBytes(32).toString('hex');

  await pool.query(
    `INSERT INTO users (name, email, password, is_verified, verify_token) VALUES ($1,$2,$3,false,$4)`,
    [name, email, hashed, token]
  );

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT!),
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });

  const url = `${process.env.NEXT_PUBLIC_URL}/api/auth/verify?token=${token}`;
  await transporter.sendMail({
    from: 'no-reply@domain.com',
    to: email,
    subject: 'Verifikasi Email',
    html: `
    <h2>Welcome to Quiz App!</h2>
    <p>Hi ${name},</p>
    <p>Click the button below to verify your email address:</p>
    <a href="${url}" style="
    display:inline-block;
    padding:10px 20px;
    background-color:#4f46e5;
    color:white;
    text-decoration:none;
    border-radius:5px;
    ">Verify Email</a>
    <p>If you did not register, ignore this email.</p>`
  });

  return NextResponse.json({ message: 'Registrasi sukses, cek email untuk verifikasi' });
}
