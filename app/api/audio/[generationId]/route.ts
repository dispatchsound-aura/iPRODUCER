import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import NodeID3 from 'node-id3';

const prisma = new PrismaClient();

export async function GET(req: Request, { params }: { params: { generationId: string } }) {
  try {
    const { searchParams } = new URL(req.url);
    const stemName = searchParams.get('stem');

    const generation = await prisma.generation.findUnique({
      where: { id: params.generationId },
    });

    if (!generation || !generation.beatUrl) {
      return new NextResponse('Audio Not Found', { status: 404 });
    }

    // Fetch the original audio from Sonauto
    const audioRes = await fetch(generation.beatUrl);
    
    if (!audioRes.ok) {
        return new NextResponse('Failed to fetch from Sonauto', { status: 502 });
    }
    
    const arrayBuffer = await audioRes.arrayBuffer();
    const audioBuffer = Buffer.from(arrayBuffer);

    // White Label tags for the user
    // Replace internal Sonauto metadata with ours
    const tags = {
      title: stemName 
         ? `${generation.title || generation.prompt.substring(0, 20)} (${stemName})` 
         : (generation.title || `Typebeat - ${generation.prompt.substring(0, 30)}...`),
      artist: 'Typebeat Generator',
      album: stemName ? `${generation.title || 'Studio'} Stems` : (generation.vibe || 'Exclusive Beats'),
      comment: {
        language: 'eng',
        text: 'powered by Sonauto' // Required by their docs but hidden
      }
    };

    // Remove old tags and write new ones
    const cleanBuffer = NodeID3.removeTagsFromBuffer(audioBuffer) || audioBuffer;
    const brandedBuffer = NodeID3.write(tags, cleanBuffer) || cleanBuffer;

    return new NextResponse(brandedBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': `attachment; filename="typebeat_${generation.id}${stemName ? `_${stemName}` : ''}.mp3"`,
      },
    });
  } catch (error) {
    console.error('White-label Audio Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
