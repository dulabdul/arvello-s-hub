import { NextResponse } from 'next/server';
import { encrypt } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@freelancer.local';
    const adminPassword = process.env.ADMIN_PASSWORD || 'adminpassword';

    if (email === adminEmail && password === adminPassword) {
      // Create session
      const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      const session = await encrypt({ user: { email }, expires });

      // Set cookie
      const cookieStore = await cookies();
      cookieStore.set('fh_session', session, {
        expires,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });

      return NextResponse.json({ success: true, message: 'Login berhasil' });
    }

    return NextResponse.json(
      { success: false, error: 'Email atau password salah' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}
