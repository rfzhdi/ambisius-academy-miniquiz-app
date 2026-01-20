import { NextResponse } from 'next/server';

export async function POST() {
  const res = NextResponse.json({ message: 'Logout sukses' });
  res.cookies.delete({
    name: 'token',
    path: '/' 
});

  return res;
}
