import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  const loginUrl = new URL('/auth/login', req.url);

  if (!token) return NextResponse.redirect(loginUrl);

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    await jwtVerify(token, secret);
    
    return NextResponse.next(); 
    
  } catch (err) {
    console.error("JWT Verification failed:", err);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [],
};