import { NextResponse } from 'next/server';
import { db } from '@/lib/db/connection';
import { users, verificationTokens } from '@/lib/db/pg-schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get('mode');
    const body = await req.json();
    const { email, username, name, password } = body || {};

    if (mode !== 'create') {
      return NextResponse.json({ message: 'Unsupported mode' }, { status: 400 });
    }

    if (!email || !username || !name || !password) {
      return NextResponse.json({ message: 'Zorunlu alanlar eksik' }, { status: 400 });
    }

    // Eşsiz kontroller
    const existingByEmail = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingByEmail.length > 0) {
      return NextResponse.json({ message: 'Bu e-posta zaten kayıtlı' }, { status: 409 });
    }
    const existingByUsername = await db.select().from(users).where(eq(users.username, username)).limit(1);
    if (existingByUsername.length > 0) {
      return NextResponse.json({ message: 'Bu kullanıcı adı zaten kullanımda' }, { status: 409 });
    }

    // Hash
    const passwordHash = await bcrypt.hash(password, 10);

    const userId = crypto.randomUUID();
    await db.insert(users).values({
      id: userId,
      email,
      username,
      password: passwordHash,
      name,
      companyName: 'CALAF.CO',
      isVerified: true, // İsterseniz e-posta doğrulama süreciyle false başlatabilirsiniz
    });

    // Eğer doğrulama istenecekse örnek token üretimi (opsiyonel):
    // const token = crypto.randomUUID();
    // const expires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 saat
    // await db.insert(verificationTokens).values({ id: crypto.randomUUID(), userId, token, expiresAt: expires });

    return NextResponse.json({ ok: true, userId });
  } catch (error: any) {
    console.error('register error', error);
    return NextResponse.json({ message: 'Sunucu hatası' }, { status: 500 });
  }
}
