import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getSession } from '../../../../lib/auth';
import Replicate from 'replicate';

const prisma = new PrismaClient();

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    const userId = session?.userId as string | undefined;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized. You must be logged in to isolate stems.' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        return NextResponse.json({ error: 'User mapping not found.' }, { status: 404 });
    }

    // Role-based Neural Stem Firewalls
    if (user.role === 'ARTIST') {
       const stemCount = await prisma.generation.count({
           where: { userId: userId, stemStatus: { not: 'none' } }
       });
       if (stemCount >= 1) {
           return NextResponse.json({ error: 'Artist Tier is limited to 1 lifetime Stem Extraction. Upgrade to PRODUCER for weekly stems!' }, { status: 403 });
       }
    } else if (user.role === 'PRODUCER') {
       const sevenDaysAgo = new Date();
       sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
       const stemCountWeekly = await prisma.generation.count({
           where: { 
               userId: userId, 
               stemStatus: { not: 'none' }, 
               createdAt: { gte: sevenDaysAgo } 
           }
       });
       if (stemCountWeekly >= 10) {
           return NextResponse.json({ error: 'Producer Tier is limited to 10 Stem Extractions per week. Upgrade to SUPER PRODUCER for infinite studio access!' }, { status: 403 });
       }
    }

    const gen = await prisma.generation.findUnique({ where: { id: params.id } });
    
    if (!gen || gen.userId !== userId || !gen.beatUrl) {
      return NextResponse.json({ error: 'Generation not found or unauthorized' }, { status: 404 });
    }

    if (!process.env.REPLICATE_API_TOKEN) {
      return NextResponse.json({ error: 'REPLICATE_API_TOKEN environment variable is missing!' }, { status: 500 });
    }

    // Step 1: Interface with Dedicated Machine Learning GPU Cluster via Replicate
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    // Step 2: Detonate the MP3 strictly through the Demucs ONNX pipeline
    const prediction = await replicate.predictions.create({
      version: "25a173108cff36ef9f80f854c162d01df9e6528be175794b8115891fc8a1151d", // cjwbw/demucs
      input: {
        audio: gen.beatUrl
      }
    });

    // We structurally map the Replicate ID inside the existing generic LALAL SQL schema footprint
    await prisma.generation.update({
      where: { id: gen.id },
      data: {
         stemStatus: 'splitting',
         lalalTaskId: JSON.stringify({ replicateId: prediction.id })
      }
    });

    return NextResponse.json({ success: true, tasks: { replicateId: prediction.id } });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
