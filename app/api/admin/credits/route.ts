import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getSession } from '../../../../lib/auth';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) return NextResponse.redirect(new URL('/login', req.url));

    const currentUser = await prisma.user.findUnique({ where: { id: session.userId } });
    if (currentUser?.role !== 'ADMIN' && currentUser?.email !== 'dispatchsound@gmail.com') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const formData = await req.formData();
    const targetUserId = formData.get('userId') as string;
    const tokens = parseInt(formData.get('tokens') as string || '10', 10);

    if (!targetUserId) {
        return NextResponse.json({ error: 'Invalid user target' }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: targetUserId },
      data: { availableCredits: { increment: tokens } }
    });

    return NextResponse.redirect(new URL('/dashboard/admin', req.url));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
