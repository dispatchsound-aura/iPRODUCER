import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import Replicate from 'replicate';

const prisma = new PrismaClient();

export async function GET(req: Request, { params }: { params: { genId: string } }) {
  try {
    const gen = await prisma.generation.findUnique({ where: { id: params.genId } });
    
    if (!gen || !gen.lalalTaskId) {
      return NextResponse.json({ error: 'Generation Extraction Tasks not found' }, { status: 404 });
    }

    if (!process.env.REPLICATE_API_TOKEN) throw new Error("Missing REPLICATE API Key");

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    const tasks = JSON.parse(gen.lalalTaskId);
    const predictionId = tasks.replicateId;

    if (!predictionId) {
       return NextResponse.json({ error: 'Legacy Split ID detected. Cannot process.' }, { status: 400 });
    }

    // Ping the Replicate ML infrastructure for the Demucs calculation
    const prediction = await replicate.predictions.get(predictionId);

    if (prediction.status === 'succeeded' && prediction.output) {
       // Normalize the Demucs dictionary back to the established UI standards
       const stems = {
          bass: prediction.output.bass,
          drums: prediction.output.drums,
          synthesizer: prediction.output.other, // We classify 'other' as synthesizer for instrumental beats
          residuals: prediction.output.vocals // Instrumental renders might have artifact bleed here
       };

      // Complete insertion
      await prisma.generation.update({
        where: { id: gen.id },
        data: {
          stemStatus: 'ready',
          stems: JSON.stringify(stems)
        }
      });
      return NextResponse.json({ status: 'ready', stems });
    } else if (prediction.status === 'failed' || prediction.status === 'canceled') {
       console.error(`Replicate task failed: `, prediction.error);
       return NextResponse.json({ error: 'Replicate Demucs generation failed' }, { status: 500 });
    }

    return NextResponse.json({ status: 'processing', tasks });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
