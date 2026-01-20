Cara menjalankan project:

1. Siapkan environment terlebih dahulu dengan membuat .env
2. Buka terminal dan ketik "npm run dev"
3. Buka browser dan masukkan url "https://localhost:3000/auth/register"
4. Jika daftar berhasil, maka system akan mengirimkan link verifikasi ke email.
5. Login melalui "https://localhost:3000/auth/login"

Struktur Folder:

[BACKEND]
/api/auth/change-password
/api/auth/history
/api/auth/login
/api/auth/logout
/api/auth/profile
/api/auth/register
/api/auth/verify
/api/quiz/session
/api/quiz/start/[id]

[FRONTEND]
/auth/change-password
/auth/login
/auth/profile
/auth/register
/dashboard
/dashboard/history
/quiz/[id]/detail
/quiz/start/[id]
/quiz/start/[id]/result

/lib/auth.ts
/lib/db.ts

Cara Konfigurasi Environment:
Template .env

# Database
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE

# Autentikasi
JWT_SECRET=contoh_secret_key

# URL App
NEXT_PUBLIC_APP_URL=http://localhost:3000