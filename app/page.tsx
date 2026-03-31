'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CheckoutButton from './components/CheckoutButton';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [bpm, setBpm] = useState<string>('');
  const [musicalKey, setMusicalKey] = useState<string>('');
  const [recentPrompts, setRecentPrompts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    try {
      const saved = localStorage.getItem('typebeat_recent_prompts');
      if (saved) setRecentPrompts(JSON.parse(saved));
    } catch(e) {}
  }, []);

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    
    // Save to recents immediately
    try {
      const updatedRecents = [prompt, ...recentPrompts.filter(p => p !== prompt)].slice(0, 5);
      setRecentPrompts(updatedRecents);
      localStorage.setItem('typebeat_recent_prompts', JSON.stringify(updatedRecents));
    } catch(e) {}

    // Attach strict musical key constraints if present
    const injection = musicalKey ? `, strictly generated in the exact musical key of ${musicalKey}` : ``;
    const finalPrompt = prompt + injection;

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: finalPrompt, bpm: bpm ? parseInt(bpm, 10) : undefined }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.isEphemeral) {
           router.push(`/dashboard?ephemeralTaskId=${data.generation.taskId}&prompt=${encodeURIComponent(data.generation.prompt)}`);
        } else {
           router.push('/dashboard');
        }
      } else {
        alert('Generation failed: ' + (data.error || 'Unknown error'));
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <main style={{ padding: '0 1rem', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', overflowX: 'hidden' }}>
      
      {/* 1. HERO SECTION */}
      <section style={{ 
          padding: 'clamp(4rem, 15vh, 8rem) 1rem 3rem', 
          maxWidth: '1000px', 
          textAlign: 'center', 
          width: '100%' 
      }}>
        <h1 style={{ 
            fontSize: 'clamp(2.5rem, 8vw, 5rem)', 
            fontWeight: 800, 
            background: 'linear-gradient(to right, #FFF, rgba(255,255,255,0.4))', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent', 
            marginBottom: '1.5rem', 
            textShadow: '0 10px 40px rgba(0,0,0,0.5)', 
            lineHeight: 1.1 
        }}>
          Create the Infinite.
        </h1>
        <p style={{ 
            color: 'var(--text-secondary)', 
            fontSize: 'clamp(1rem, 3vw, 1.4rem)', 
            fontWeight: 400, 
            lineHeight: 1.6,
            maxWidth: '800px',
            margin: '0 auto 1.5rem auto'
        }}>
          Artist to create, find, craft, and mold their own sound with production they own. Royalty-free beats with packaged stems and MIDI downloads so you're ready to hit the studio like a professional.
        </p>
        <p style={{ 
            color: 'var(--text-secondary)', 
            fontSize: 'clamp(0.9rem, 2.5vw, 1.2rem)', 
            fontWeight: 300, 
            lineHeight: 1.6,
            maxWidth: '700px',
            margin: '0 auto'
        }}>
          <span style={{ color: 'var(--accent-purple)', fontWeight: 600 }}>With native Stem Separation:</span> Producers can generate their own samples—no more digging, just describe it.
        </p>
      </section>

      {/* 2. CORE GENERATOR SECTION (UNCHANGED SIMPLICITY) */}
      <section style={{ maxWidth: '800px', width: '100%', marginBottom: '4rem' }}>
        <div className="glass-panel" style={{ width: '100%', padding: 'clamp(1.5rem, 5vw, 3rem)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(1rem, 4vw, 2rem)' }}>
            
            {/* Central Prompt */}
            <div style={{ width: '100%' }}>
              <textarea 
                className="input-field" 
                placeholder="Describe your beat (e.g. A dark trap beat in the style of Metro Boomin with heavy 808s...)"
                rows={5}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                style={{ resize: 'none', fontSize: 'clamp(1rem, 3.5vw, 1.2rem)', padding: 'clamp(1rem, 4vw, 1.5rem)', lineHeight: '1.6', width: '100%' }}
              />
            </div>

            {/* Musical Parameters */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500, letterSpacing: '1px' }}>TEMPO (BPM)</span>
                <input 
                  type="number" 
                  className="input-field" 
                  placeholder="Auto" 
                  value={bpm}
                  onChange={(e) => setBpm(e.target.value)}
                  style={{ width: '80px', textAlign: 'center', padding: '0.4rem', background: 'rgba(0,0,0,0.4)' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500, letterSpacing: '1px' }}>KEY (OPTIONAL)</span>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. C Minor" 
                  value={musicalKey}
                  onChange={(e) => setMusicalKey(e.target.value)}
                  style={{ width: '100px', textAlign: 'center', padding: '0.4rem', background: 'rgba(0,0,0,0.4)', fontSize: '0.9rem' }}
                />
              </div>
            </div>

            {/* Master Trigger */}
            <button 
              className="button highlight"
              onClick={handleGenerate}
              disabled={loading || !prompt}
              style={{
                width: '100%',
                padding: '1.2rem',
                fontSize: '1.2rem',
                fontWeight: 700,
                letterSpacing: '2px',
                borderRadius: '16px',
                marginTop: '1rem',
                boxShadow: loading ? '0 0 30px rgba(244, 114, 182, 0.4)' : 'none'
              }}
            >
              {loading ? 'RENDERING AUDIO...' : 'COOK UP'}
            </button>
            
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
              Due to high studio demand, please allow up to 60 seconds for the engine to cook your beat.
            </div>
            
          </div>
        </div>

        {/* Past Prompts Section */}
        {recentPrompts.length > 0 && (
          <div style={{ width: '100%', marginTop: '3rem' }}>
            <h3 style={{ fontSize: '1.2rem', color: 'white', fontWeight: 600, marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
              Your Past Prompts
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentPrompts.map((p, idx) => (
                <div 
                  key={idx} 
                  onClick={() => {
                     setPrompt(p);
                     window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="glass-panel"
                  style={{ 
                    padding: '1rem', 
                    borderRadius: '12px', 
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    color: 'rgba(255,255,255,0.8)',
                    transition: 'all 0.2s ease',
                    border: '1px solid rgba(255,255,255,0.05)'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'rgba(10,10,15,0.6)'}
                >
                  {p}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 3. COMMERCIAL PRICING GRID */}
      <section style={{ 
          maxWidth: '1200px', 
          width: '100%', 
          padding: '4rem 1rem', 
          borderTop: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
      }}>
        <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, marginBottom: '3rem', textAlign: 'center' }}>Studio Access Tiers</h2>
        
        <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '2rem', 
            width: '100%' 
        }}>
           {/* Tier 1: Artist */}
           <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', borderRadius: '24px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'var(--text-secondary)' }} />
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-secondary)' }}>ARTIST</h3>
              <div style={{ fontSize: '3rem', fontWeight: 800, margin: '1rem 0 2rem 0' }}>FREE</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem', color: 'rgba(255,255,255,0.8)' }}>
                 <li>✓ 7 Royalty-Free Beats / Week</li>
                 <li>✓ Full Commercial Rights</li>
                 <li>✓ Standard 44.1kHz MP3 Output</li>
                 <li style={{ opacity: 0.3 }}>✗ Unlimited Generations</li>
                 <li style={{ opacity: 0.3 }}>✗ Neural Stem Isolation</li>
                 <li style={{ opacity: 0.3 }}>✗ Basic Pitch MIDI Pack</li>
              </ul>
              <div style={{ flexGrow: 1 }} />
              <a href="/login" className="button" style={{ marginTop: '2rem', textAlign: 'center', width: '100%', padding: '1rem' }}>START CREATING</a>
           </div>

           {/* Tier 2: Producer */}
           <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', borderRadius: '24px', position: 'relative', overflow: 'hidden', border: '1px solid rgba(244, 114, 182, 0.3)', boxShadow: '0 0 40px rgba(244, 114, 182, 0.1)' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'var(--gradient-primary)' }} />
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>PRODUCER</h3>
              <div style={{ fontSize: '3rem', fontWeight: 800, margin: '1rem 0 2rem 0' }}>$9.99<span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-secondary)' }}>/mo</span></div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem', color: 'rgba(255,255,255,0.8)' }}>
                 <li><span style={{ color: 'var(--accent-purple)' }}>✓</span> <b>Infinite</b> Gen-3 Beats / Week</li>
                 <li><span style={{ color: 'var(--accent-purple)' }}>✓</span> Full Commercial Rights</li>
                 <li><span style={{ color: 'var(--accent-purple)' }}>✓</span> High-Fidelity MP3 Downloads</li>
                 <li><span style={{ color: 'var(--accent-purple)' }}>✓</span> Saved Smart Crate Library</li>
                 <li style={{ opacity: 0.3 }}>✗ Neural Stem Isolation</li>
                 <li style={{ opacity: 0.3 }}>✗ Basic Pitch MIDI Pack</li>
              </ul>
              <div style={{ flexGrow: 1 }} />
              <CheckoutButton priceId="prod_UFRIfR3pvgGMZ7" label="SUBSCRIBE NOW" isHighlight={true} />
           </div>

           {/* Tier 3: Super Producer */}
           <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', borderRadius: '24px', position: 'relative', overflow: 'hidden', border: '1px solid rgba(56, 189, 248, 0.5)', boxShadow: '0 0 60px rgba(56, 189, 248, 0.15)' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'var(--accent-blue)' }} />
              <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'var(--accent-blue)', color: '#000', padding: '4px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '1px' }}>INDUSTRY PRO</div>
              
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-blue)' }}>SUPER PRODUCER</h3>
              <div style={{ fontSize: '3rem', fontWeight: 800, margin: '1rem 0 2rem 0' }}>$19.99<span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-secondary)' }}>/mo</span></div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem', color: 'rgba(255,255,255,0.8)' }}>
                 <li><span style={{ color: 'var(--accent-blue)' }}>✓</span> <b>Infinite</b> Gen-3 Beats / Week</li>
                 <li><span style={{ color: 'var(--accent-blue)' }}>✓</span> Full Commercial Rights</li>
                 <li><span style={{ color: 'var(--accent-blue)' }}>✓</span> <b>Neural Demucs Stem Extraction</b></li>
                 <li><span style={{ color: 'var(--accent-blue)' }}>✓</span> <b>Spotify Basic Pitch MIDI Isolator</b></li>
                 <li><span style={{ color: 'var(--accent-blue)' }}>✓</span> Download 4-Track Studio Pipelines</li>
                 <li><span style={{ color: 'var(--accent-blue)' }}>✓</span> Beat Catalog Matrix</li>
              </ul>
              <div style={{ flexGrow: 1 }} />
              <CheckoutButton priceId="prod_UFRITsDGrQgSCJ" label="MASTER THE STUDIO" isHighlight={true} styleOverride={{ background: 'var(--accent-blue)' }} />
           </div>
        </div>
      </section>

      {/* 4. HOOK MAKER COMING SOON BADGE */}
      <section style={{ padding: '4rem 1rem', width: '100%', display: 'flex', justifyContent: 'center' }}>
          <div style={{ 
              background: 'rgba(0,0,0,0.4)', 
              border: '1px solid var(--accent-orange)', 
              padding: '1.5rem 3rem', 
              borderRadius: '50px',
              boxShadow: '0 0 30px rgba(251, 146, 60, 0.1)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '1rem'
          }}>
              <span style={{ fontSize: '1.5rem' }}>🎙️</span>
              <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'white', letterSpacing: '1px' }}>Hook Maker <span style={{ color: 'var(--accent-orange)' }}>Coming Soon!</span></h4>
          </div>
      </section>
      
      <div style={{ marginTop: '2rem', marginBottom: '4rem', opacity: 0.4, fontSize: '0.75rem', letterSpacing: '1px', color: 'var(--text-secondary)' }}>
        POWERED BY SONAUTO & REPLICATE
      </div>
    </main>
  );
}
