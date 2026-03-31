'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [bpm, setBpm] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, bpm: bpm ? parseInt(bpm, 10) : undefined }),
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

          {/* Simple Tempo Control */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', gap: '1rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500,  }}>TEMPO OVERRIDE (BPM)</span>
            <input 
              type="number" 
              className="input-field" 
              placeholder="Auto" 
              value={bpm}
              onChange={(e) => setBpm(e.target.value)}
              style={{ width: '100px', textAlign: 'center', padding: '0.5rem', background: 'rgba(0,0,0,0.4)', flexGrow: 1, maxWidth: '150px' }}
            />
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
          
        </div>
      </div>

      {/* Sonauto API Compliance Watermark */}
      <div style={{ marginTop: '2rem', opacity: 0.4, fontSize: '0.75rem', letterSpacing: '1px', color: 'var(--text-secondary)' }}>
        POWERED BY SONAUTO
      </div>
    </main>
  );
}
