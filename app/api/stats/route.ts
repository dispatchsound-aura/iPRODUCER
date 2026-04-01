import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    const totalCount = await prisma.generation.count();
    return NextResponse.json({ success: true, count: totalCount });
  } catch (error) {
    return NextResponse.json({ success: false, count: 0 });
  }
}
