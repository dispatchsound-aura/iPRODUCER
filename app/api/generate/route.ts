import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getSession } from '../../../lib/auth';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { prompt, folderId, bpm } = await req.json();
    const session = await getSession();
    const userId = session?.userId as string | undefined;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const useV2 = !!bpm;
    const url = useV2 ? 'https://api.sonauto.ai/v1/generations/v2' : 'https://api.sonauto.ai/v1/generations/v3';

    // INJECT: Hardcore Instrumental Mode
    // Violently engineer the prompt to eradicate latent vocal capabilities
    const cleanPrompt = prompt.replace(/(singer|rapper|vocals|voice|singing|lyric|words)/gi, '');
    const finalPrompt = `${cleanPrompt}, no lyrics, No Words, Instrumental, no vocals`;

    const bodyObj: any = {
      prompt: finalPrompt,
      instrumental: true, // Typebeat generator flag
      num_songs: 1,
    };
    if (useV2 && bpm) bodyObj.bpm = Number(bpm);

    // Call Sonauto API pointing to generation endpoint
    const sonautoRes = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SONAUTO_API_KEY}`,
      },
      body: JSON.stringify(bodyObj),
    });

    if (!sonautoRes.ok) {
      const errorText = await sonautoRes.text();
      console.error("Sonauto error:", errorText);
      throw new Error(`Sonauto API failed: ${errorText}`);
    }

    const taskData = await sonautoRes.json();
    const taskId = taskData.task_id || taskData.id;

    // EPHEMERAL FUNNEL BYPASS: 
    // If there is NO userId, instantly return without touching the database!
    if (!userId) {
      return NextResponse.json({ 
        success: true, 
        isEphemeral: true,
        generation: { 
           id: 'ephemeral', 
           taskId, 
           prompt: finalPrompt, 
           status: 'pending' 
        } 
      });
    }

    // Save initial Generation object to DB waiting for async polling (Registered users only)
    const generation = await prisma.generation.create({
      data: {
        prompt: finalPrompt,
        taskId,
        bpm: bpm ? Number(bpm) : undefined,
        userId: userId || undefined,
        folderId: folderId || undefined,
        status: 'pending',
      },
    });

    return NextResponse.json({ success: true, isEphemeral: false, generation });
  } catch (error: any) {
    console.error('Generation Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
