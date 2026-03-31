import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import Replicate from 'replicate';

const prisma = new PrismaClient();

export async function GET(req: Request, { params }: { params: { generationId: string } }) {
  try {
    // EPHEMERAL FUNNEL BYPASS: Query Sonauto without touching the Database
    if (params.generationId === 'ephemeral') {
       const { searchParams } = new URL(req.url);
       const taskId = searchParams.get('taskId');
       if (!taskId) return NextResponse.json({ error: 'Missing taskId' }, { status: 400 });

       const res = await fetch(`https://api.sonauto.ai/v1/generations/${taskId}`, {
         headers: { 'Authorization': `Bearer ${process.env.SONAUTO_API_KEY}` }
       });
       if (!res.ok) return NextResponse.json({ error: 'Failed to proxy status' }, { status: 500 });

       const data = await res.json();
       const finalUrl = (data.status === 'SUCCESS' && data.song_paths) ? data.song_paths[0] : undefined;
       return NextResponse.json({ status: data.status, beatUrl: finalUrl });
    }

    const generation = await prisma.generation.findUnique({
      where: { id: params.generationId },
    });

    if (!generation || !generation.taskId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (generation.status === 'ready') {
       return NextResponse.json({ status: 'SUCCESS' });
    }

    // Proxy the status call to Sonauto to keep the API key safe
    const res = await fetch(`https://api.sonauto.ai/v1/generations/${generation.taskId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.SONAUTO_API_KEY}`
      }
    });

    if (!res.ok) {
       return NextResponse.json({ error: 'Failed to proxy status' }, { status: 500 });
    }

    const data = await res.json();
    
    // If successful, update the database so we have the beatUrl and mark as ready!
    if (data.status === 'SUCCESS' && data.song_paths && data.song_paths.length > 0) {
       let stemStatus = 'none';
       let lalalTaskId = null;
       const finalBeatUrl = data.song_paths[0];

       // OPTION A: HYBRID APPROACH (Requires PRODUCER/SUPER_PRODUCER Tier)
       if (generation.userId) {
         const genOwner = await prisma.user.findUnique({ where: { id: generation.userId } });
         if (genOwner && ['PRODUCER', 'SUPER_PRODUCER'].includes(genOwner.role)) {
            if (process.env.REPLICATE_API_TOKEN) {
              try {
                const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });
                const prediction = await replicate.predictions.create({
                  version: "171d8e6a1e4a870b0f17f00c850b3d89d1205848a129d6110a933feaffb2ea6a", // triadmusic
                  input: {
                    audio: finalBeatUrl,
                    format: "mp3",
                    model_name: "htdemucs"
                  }
                });
                stemStatus = 'splitting';
                lalalTaskId = JSON.stringify({ replicateId: prediction.id });
              } catch (e) {
                console.error("Auto-Stem Replicate Error:", e);
                // Graceful fallback: it fails silently but beat is saved perfectly
              }
            }
         }
       }

       await (prisma as any).generation.update({
          where: { id: generation.id },
          data: {
             status: 'ready',
             beatUrl: finalBeatUrl,
             stemStatus,
             lalalTaskId: lalalTaskId ? lalalTaskId : undefined
          }
       });
    }

    return NextResponse.json({ status: data.status });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
