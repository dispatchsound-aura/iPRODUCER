import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getSession } from '../../../lib/auth';

const prisma = new PrismaClient();

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    const userId = session?.userId as string | undefined;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized. You must be logged in to isolate stems.' }, { status: 401 });
    }

    const gen = await prisma.generation.findUnique({ where: { id: params.id } });
    
    if (!gen || gen.userId !== userId || !gen.beatUrl) {
      return NextResponse.json({ error: 'Generation not found or unauthorized' }, { status: 404 });
    }

    if (!process.env.LALAL_API_KEY) {
      return NextResponse.json({ error: 'LALAL_API_KEY environment variable is dangerously missing!' }, { status: 500 });
    }

    // STEP 1: Rip the raw byte buffer from the external Sonauto MP3 cluster
    const audioRes = await fetch(gen.beatUrl);
    const audioBuffer = await audioRes.arrayBuffer();

    // STEP 2: Force-push the byte stream upward to the LALAL.AI Analysis Matrix
    const uploadRes = await fetch('https://www.lalal.ai/api/v1/upload/', {
      method: 'POST',
      headers: {
        'X-License-Key': process.env.LALAL_API_KEY,
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="typebeat_${gen.id}.mp3"`,
      },
      body: audioBuffer
    });
    const uploadData = await uploadRes.json();
    
    if (!uploadRes.ok || !uploadData.id) {
       console.error("LALAL UPLOAD FAILED:", uploadData);
       return NextResponse.json({ error: 'Lalal.ai Neural Storage failed to engage.' }, { status: 500 });
    }
    const sourceId = uploadData.id;

    // STEP 3: Ignite concurrent Neural Extraction workflows
    // We physically initiate three independent extraction trees to rip apart the instrumental
    const filters = ['drums', 'bass', 'synthesizer'];
    const taskIds: any = {};

    for (const filter of filters) {
       const splitRes = await fetch('https://www.lalal.ai/api/v1/split/', {
         method: 'POST',
         headers: {
           'X-License-Key': process.env.LALAL_API_KEY,
           'Content-Type': 'application/json'
         },
         body: JSON.stringify({
           source_id: sourceId,
           filter: filter
         })
       });
       const splitData = await splitRes.json();
       if (splitData.task_id || splitData.id) {
          taskIds[filter] = splitData.task_id || splitData.id;
       }
    }

    // Commit the asynchronous extraction keys to Supabase Database
    await prisma.generation.update({
      where: { id: gen.id },
      data: {
         stemStatus: 'splitting',
         lalalTaskId: JSON.stringify(taskIds)
      }
    });

    return NextResponse.json({ success: true, tasks: taskIds });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
