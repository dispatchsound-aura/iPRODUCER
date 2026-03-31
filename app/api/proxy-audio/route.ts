import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const audioUrl = searchParams.get('url');

    if (!audioUrl) {
      return new NextResponse('Missing URL parameter', { status: 400 });
    }

    const response = await fetch(audioUrl);

    if (!response.ok) {
      return new NextResponse(`Failed to fetch remote audio: ${response.statusText}`, { status: response.status });
    }

    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
        // Specifically whitelist full browser data reads
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('Audio Proxy Error:', error);
    return new NextResponse('Internal Server Error while proxying audio stream', { status: 500 });
  }
}
