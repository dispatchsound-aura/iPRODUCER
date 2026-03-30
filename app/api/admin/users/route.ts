import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const prismaAny = prisma as any;
    
    // Check if user has added the User model to their schema
    if (!prismaAny.user) {
      return NextResponse.json({ 
        users: [], 
        error: 'Prisma User model not found. Please add the User schema and run `npx prisma db push`.' 
      }, { status: 200 }); // Return 200 so UI doesn't crash completely, just shows error
    }

    const users = await prismaAny.user.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ users });
  } catch (err: any) {
    if (err.code === 'P2021' || err.message.includes('Table does not exist')) {
      return NextResponse.json(
        { users: [], error: 'User Database table missing. Check Step 1 of the implementation plan.' },
        { status: 200 }
      );
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const prismaAny = prisma as any;
    await prismaAny.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
