import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import Replicate from 'replicate';

const prisma = new PrismaClient();

export async function GET(req: Request, { params }: { params: { genId: string } }) {
  try {
    const gen = await prisma.generation.findUnique({ where: { id: params.genId } });
    
    if (!gen || !(gen as any).lalalTaskId) {
      return NextResponse.json({ error: 'Generation Extraction Tasks not found' }, { status: 404 });
    }

    if (!process.env.REPLICATE_API_TOKEN) throw new Error("Missing REPLICATE API Key");

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    const tasks = JSON.parse((gen as any).lalalTaskId);
    const predictionId = tasks.replicateId;

    if (!predictionId) {
       return NextResponse.json({ error: 'Legacy Split ID detected. Cannot process.' }, { status: 400 });
    }

    // Ping the Replicate ML infrastructure for the Demucs calculation
    const prediction = await replicate.predictions.get(predictionId);

    if (prediction.status === 'succeeded' && prediction.output) {
       // Deeply parse the TriadMusic dictionary back out directly to the established UI standard
       const dict = prediction.output.stems || prediction.output;
       const stems = {
          bass: dict.bass,
          drums: dict.drums,
          synthesizer: dict.other, 
          residuals: dict.vocals 
       };

      // Complete insertion
      await (prisma as any).generation.update({
        where: { id: gen.id },
        data: {
          stemStatus: 'ready',
          stems: JSON.stringify(stems)
        }
      });
      return NextResponse.json({ status: 'ready', stems });
    } else if (prediction.status === 'failed' || prediction.status === 'canceled') {
       console.error(`Replicate task failed: `, prediction.error);
       
       // Update DB so it doesn't get stuck in an infinite alert loop on the frontend
       await (prisma as any).generation.update({
         where: { id: gen.id },
         data: { stemStatus: 'none', lalalTaskId: null }
       });

       return NextResponse.json({ error: 'Replicate Demucs generation failed' }, { status: 500 });
    }

    return NextResponse.json({ status: 'processing', tasks });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
