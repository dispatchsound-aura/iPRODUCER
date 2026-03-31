'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
    <main style={{ padding: 'clamp(2rem, 10vh, 6rem) 1rem', maxWidth: '800px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', overflowX: 'hidden' }}>
      
      {/* Title Header */}
      <div style={{ textAlign: 'center', marginBottom: '3rem', width: '100%' }}>
        <h1 style={{ fontSize: 'clamp(2.2rem, 8vw, 4rem)', fontWeight: 800, background: 'linear-gradient(to right, #FFF, rgba(255,255,255,0.4))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '1rem', textShadow: '0 10px 30px rgba(0,0,0,0.5)', lineHeight: 1.1 }}>
          Create the Infinite.
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(1rem, 4vw, 1.2rem)', fontWeight: 300, padding: '0 1rem' }}>
          The highest fidelity instrumental generation engine.
        </p>
      </div>

      {/* Massive Glass Generator Card */}
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
            {/* Simple Tempo Control */}
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

            {/* Musical Key Control */}
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

      {/* Past Prompts Section (Outside Generator Card) */}
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
      <div style={{ marginTop: '2rem', opacity: 0.4, fontSize: '0.75rem', letterSpacing: '1px', color: 'var(--text-secondary)' }}>
        POWERED BY SONAUTO
      </div>
    </main>
  );
}
