import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { setSessionCookie } from '../../../../lib/auth';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const prismaAny = prisma as any;
    
    const user = await prismaAny.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    if (user.passwordHash !== password) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    // Set secure session cookie
    await setSessionCookie(user.id);

    return NextResponse.json({ success: true, user: { id: user.id, email: user.email } }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
