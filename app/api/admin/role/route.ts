import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getSession } from '../../../lib/auth';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
     const session = await getSession();
     if (!session?.userId) return NextResponse.redirect(new URL('/login', req.url));

     const currentUser = await prisma.user.findUnique({ where: { id: session.userId } });
     if (currentUser?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized Matrix Sector' }, { status: 403 });
     }

     const formData = await req.formData();
     const userId = formData.get('userId') as string;
     const newRole = formData.get('newRole') as string;

     if (userId && newRole) {
        await prisma.user.update({
           where: { id: userId },
           data: { role: newRole }
        });
     }

     // Redirect seamlessly back into the Admin view to refresh hierarchy allocations natively
     return NextResponse.redirect(new URL('/dashboard/admin', req.url), 303);
  } catch(e) {
     console.error(e);
     return NextResponse.json({ error: "Fatal Identity Breach" }, { status: 500 });
  }
}
