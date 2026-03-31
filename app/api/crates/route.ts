import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getSession } from '../../../lib/auth';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const crates = await prisma.crate.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ crates });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name } = await req.json();
    const crate = await prisma.crate.create({
      data: {
        name,
        userId: session.userId,
      }
    });

    return NextResponse.json({ success: true, crate });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
