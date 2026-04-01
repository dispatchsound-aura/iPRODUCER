import { NextResponse } from 'next/server';
import { generateText } from 'ai';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    if (!prompt) {
      return NextResponse.json({ error: 'No prompt provided' }, { status: 400 });
    }

    // Pass the user's intent to the new Vercel Gemini AI Core Engine
    const result = await generateText({
      model: 'google/gemini-3-flash',
      prompt: `You are an expert, multi-platinum music producer prompt engineer. A user just gave you this basic idea for a beat generator: "${prompt}". 
      Instantly rewrite it into exactly 1-2 descriptive sentences filled with high-end, industry-standard studio terminology (e.g. punchy modern 808s, wide stereo mix, specific instruments, radio polished). 
      DO NOT include lyrics. DO NOT include any introductory conversational text like "Here is your prompt". Return strictly the final master-level prompt string.`
    });

    return NextResponse.json({ success: true, original: prompt, enhanced: result.text || prompt });

  } catch (error: any) {
    console.error("Vercel AI Model Error:", error);
    // Silent fallback to standard prompt if ML API isn't correctly configured yet
    return NextResponse.json({ success: true, original: prompt, enhanced: prompt + ", studio quality, professionally mastered" });
  }
}
