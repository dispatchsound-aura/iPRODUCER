import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    const totalCount = await prisma.generation.count();
    const producerCount = await prisma.user.count();
    
    return NextResponse.json({ 
        success: true, 
        count: totalCount + 430, 
        producers: producerCount + 90 
    });
  } catch (error) {
    return NextResponse.json({ success: false, count: 430, producers: 90 });
  }
}
