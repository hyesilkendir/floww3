import { NextResponse } from 'next/server';
export const runtime = 'nodejs';

import { db } from '@/lib/db/connection';
import { users } from '@/lib/db/pg-schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';

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

    const existingByEmail = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingByEmail.length > 0) {
      return NextResponse.json({ message: 'Bu e-posta zaten kayıtlı' }, { status: 409 });
    }
    const existingByUsername = await db.select().from(users).where(eq(users.username, username)).limit(1);
    if (existingByUsername.length > 0) {
      return NextResponse.json({ message: 'Bu kullanıcı adı zaten kullanımda' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const userId = crypto.randomUUID();
    await db.insert(users).values({
      id: userId,
      email,
      username,
      password: passwordHash,
      name,
      companyName: 'CALAF.CO',
      isVerified: true,
    });

    return NextResponse.json({ ok: true, userId });
  } catch (error: any) {
    console.error('register error', error);
    const message = typeof error?.message === 'string' ? error.message : 'Sunucu hatası';
    return NextResponse.json({ message }, { status: 500 });
  }
}
