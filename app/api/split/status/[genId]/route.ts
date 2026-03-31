import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request, { params }: { params: { genId: string } }) {
  try {
    const gen = await prisma.generation.findUnique({ where: { id: params.genId } });
    
    if (!gen || !gen.lalalTaskId) {
      return NextResponse.json({ error: 'Generation or Lalal Extraction Tasks not found' }, { status: 404 });
    }

    if (!process.env.LALAL_API_KEY) throw new Error("Missing LALAL Core API Key");

    const tasks = JSON.parse(gen.lalalTaskId);
    let allReady = true;
    const finalStems: any = {};

    for (const filter of Object.keys(tasks)) {
       const taskId = tasks[filter];
       const checkRes = await fetch(`https://www.lalal.ai/api/v1/check/?id=${taskId}`, {
          method: 'GET',
          headers: { 'X-License-Key': process.env.LALAL_API_KEY }
       });
       
       const taskData = await checkRes.json();

       if (taskData.status === 'success') {
          // LALAL.ai usually dictates primary extracted stem as stem_track or similar
          finalStems[filter] = taskData.stem_track_url || taskData.stem_track || taskData.stem_url || taskData.stem || taskData.download_url;
       } else if (taskData.status === 'error') {
          console.error(`Task ${taskId} for ${filter} failed`);
          allReady = false; 
       } else {
          allReady = false; // still processing/queued
       }
    }

    if (allReady && Object.keys(finalStems).length > 0) {
      // Complete insertion
      await prisma.generation.update({
        where: { id: gen.id },
        data: {
          stemStatus: 'ready',
          stems: JSON.stringify(finalStems)
        }
      });
      return NextResponse.json({ status: 'ready', stems: finalStems });
    }

    return NextResponse.json({ status: 'processing', tasks });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
