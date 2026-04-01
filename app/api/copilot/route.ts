import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    if (!prompt) {
      return NextResponse.json({ error: 'No prompt provided' }, { status: 400 });
    }

    const text = prompt.toLowerCase();
    let injectedConfig = "";

    // Specific Genre/Artist Routing
    if (text.includes('trap') || text.includes('drill') || text.includes('metro') || text.includes('future') || text.includes('drake')) {
       injectedConfig = "dark ambient melodies, heavy rattling hi-hats, distorted 808 glides, crisp mixing";
    } else if (text.includes('r&b') || text.includes('rnb') || text.includes('soul') || text.includes('sza') || text.includes('brent')) {
       injectedConfig = "smooth lush chords, underwater frequency filters, deep sub bass, emotional melodic structures";
    } else if (text.includes('pop') || text.includes('swift') || text.includes('radio') || text.includes('commercial')) {
       injectedConfig = "upbeat commercial structure, massive synth hooks, shimmer reverbs, incredibly crisp punchy drums";
    } else if (text.includes('rock') || text.includes('metal') || text.includes('guitar')) {
       injectedConfig = "live acoustic and electric instrumentation, heavy overdrive riffs, acoustic drum kit patterns";
    } else if (text.includes('lofi') || text.includes('chill')) {
       injectedConfig = "vinyl crackle overlay, lofi EQ filters, relaxing slow jazzy chords, muted dusty drum breaks";
    }

    // Authentic Studio Randomizer Pool
    const randomEnhancers = [
      "certified platinum hit structure",
      "clean high fidelity audio mastering",
      "spacious stereo widening",
      "professional studio eq",
      "dynamic mastering chain",
      "industry level sound design",
      "analog warmth emulation",
      "punchy transient processing"
    ];

    // Select 3 random unique enhancers
    const shuffled = randomEnhancers.sort(() => 0.5 - Math.random());
    const selectedRandoms = shuffled.slice(0, 3).join(", ");

    // Combine
    let finalPrompt = `${prompt.trim()}, ${selectedRandoms}`;
    if (injectedConfig) {
        finalPrompt = `${prompt.trim()}, ${injectedConfig}, ${selectedRandoms}`;
    }

    // Wait a brief 600ms to simulate ML thinking time before returning to the frontend
    await new Promise(r => setTimeout(r, 600));

    return NextResponse.json({ success: true, original: prompt, enhanced: finalPrompt });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
