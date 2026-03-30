import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    if (email !== 'dispatchsound@gmail.com') {
      return NextResponse.json({ error: 'Unauthorized: Master Admin account required' }, { status: 401 });
    }

    const prismaAny = prisma as any;
    if (!prismaAny.user) {
      return NextResponse.json({ error: 'User database not synced yet' }, { status: 500 });
    }

    const masterUser = await prismaAny.user.findUnique({
      where: { email: 'dispatchsound@gmail.com' }
    });

    if (!masterUser) {
       return NextResponse.json({ error: 'Master account not registered yet. Please sign up first!' }, { status: 404 });
    }

    if (masterUser.passwordHash !== password) {
       return NextResponse.json({ error: 'Invalid master password' }, { status: 401 });
    }

    // Success - in a real app, generate a JWT. For MVP, we return success 
    // and the client unlocks the dashboard for the current session.
    return NextResponse.json({ success: true, token: 'master-unlocked' });
    
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
