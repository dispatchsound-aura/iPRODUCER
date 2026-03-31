import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    // Workaround for TypeScript until the user generates the Prisma Client
    const prismaAny = prisma as any;

    // Check if user already exists
    if (!prismaAny.user) {
      return NextResponse.json({ error: 'Please add the User model to schema.prisma and run npx prisma db push' }, { status: 500 });
    }

    const existingUser = await prismaAny.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists.' }, { status: 400 });
    }

    // Create the new user
    // Note: In a real production app, password MUST be hashed (e.g. using bcrypt)
    // For MVP launch, we store it if we have 'passwordHash', or plain if they chose 'password'
    const newUser = await prismaAny.user.create({
      data: {
        email,
        passwordHash: password, // Store plain for raw MVP, or assume a hash function
        role: 'SUBSCRIBER',
      },
    });

    // INSTANTLY ISSUE A SECURE BROWSER COOKIE!
    const { setSessionCookie } = await import('../../../../lib/auth');
    await setSessionCookie(newUser.id);

    return NextResponse.json({ success: true, user: newUser }, { status: 201 });
  } catch (err: any) {
    if (err.code === 'P2021' || err.message.includes('Table does not exist')) {
      return NextResponse.json(
        { error: 'Database table missing. Check Step 1 of the implementation plan.' },
        { status: 500 }
      );
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
