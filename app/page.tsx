'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [bpm, setBpm] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Create a cool "Spinning" state when generating
  useEffect(() => {
    const record = document.querySelector('.spinning-record');
    if (record) {
      if (loading) {
        record.classList.remove('paused');
      } else {
        record.classList.add('paused');
      }
    }
  }, [loading]);

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, bpm: bpm ? parseInt(bpm, 10) : undefined }),
      });
      if (res.ok) {
        router.push('/dashboard');
      } else {
        alert('Generation failed');
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <main style={{ padding: '4rem 2rem', maxWidth: '900px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      {/* Synthesizer Plugin UI Shell */}
      <div 
        className="glass-panel" 
        style={{ 
          width: '100%', 
          borderRadius: '16px',
          background: 'linear-gradient(180deg, #2A2D35 0%, #1A1C20 100%)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.8), inset 0 2px 0 rgba(255,255,255,0.05), inset 0 0 0 1px #4A4E54',
          padding: '2px' // Outer rim
        }}
      >
        <div style={{
          background: '#1D2025',
          borderRadius: '14px',
          padding: '3rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '2rem'
        }}>
          {/* Plugin Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #111', paddingBottom: '1.5rem', marginBottom: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-1px', color: '#fff', margin: 0 }}>TYPEBEAT ENGINE</h1>
              <span style={{ color: 'var(--accent-color)', fontSize: '0.8rem', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 600 }}>Instrumental Generator</span>
            </div>
            
            <div className="lcd-display" style={{ width: '120px', height: '36px', fontSize: '0.8rem' }}>
              {loading ? 'PROCESSING' : 'READY'}
            </div>
          </div>

          {/* Prompt Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Prompt Sequence</label>
            <textarea 
              className="input-field" 
              placeholder="Enter instructions (e.g. Dark trap beat in the style of Metro Boomin with heavy 808s...)"
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              style={{ resize: 'vertical', fontSize: '1rem', background: '#090A0C', border: '1px solid #000', color: 'var(--text-primary)', boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.8)' }}
            />
          </div>

          {/* Parameters Section */}
          <div style={{ display: 'flex', gap: '2rem', background: '#17191C', padding: '1.5rem', borderRadius: '8px', border: '1px solid #111', boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.5)' }}>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Tempo Settings</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <input 
                    type="number" 
                    className="input-field" 
                    placeholder="Auto BPM" 
                    value={bpm}
                    onChange={(e) => setBpm(e.target.value)}
                    style={{ width: '100px', textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', color: 'var(--accent-color)', fontSize: '1.1rem', background: '#090A0C' }}
                  />
                  <span style={{ fontSize: '0.75rem', color: '#555' }}>Leave blank to let AI decide</span>
                </div>
             </div>
             
             {/* Fake Knobs for Aesthetics */}
             <div style={{ display: 'flex', gap: '1.5rem', flex: 1, justifyContent: 'flex-end', opacity: 0.5 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                   <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(145deg, #2a2d32, #1f2125)', border: '2px solid #111', position: 'relative', boxShadow: '0 4px 6px rgba(0,0,0,0.3), inset 0 2px 2px rgba(255,255,255,0.05)' }}>
                      <div style={{ width: '4px', height: '10px', background: 'var(--accent-orange)', position: 'absolute', top: '2px', left: '16px', borderRadius: '2px' }}></div>
                   </div>
                   <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>SWING</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                   <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(145deg, #2a2d32, #1f2125)', border: '2px solid #111', position: 'relative', boxShadow: '0 4px 6px rgba(0,0,0,0.3), inset 0 2px 2px rgba(255,255,255,0.05)' }}>
                      <div style={{ width: '4px', height: '10px', background: 'var(--accent-color)', position: 'absolute', top: '6px', right: '6px', transform: 'rotate(45deg)', borderRadius: '2px' }}></div>
                   </div>
                   <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>DRIVE</span>
                </div>
             </div>
          </div>

          {/* Generate Button positioned like a master trigger */}
          <div style={{ marginTop: '1rem' }}>
            <button 
              onClick={handleGenerate}
              disabled={loading || !prompt}
              style={{
                width: '100%',
                padding: '20px',
                background: loading ? 'var(--accent-record)' : 'linear-gradient(180deg, var(--accent-hover) 0%, #0284C7 100%)',
                border: '1px solid #000',
                borderTopColor: loading ? '#ff6b6b' : '#7DD3FC',
                borderRadius: '8px',
                color: 'white',
                fontSize: '1.2rem',
                fontWeight: 800,
                letterSpacing: '2px',
                cursor: (loading || !prompt) ? 'not-allowed' : 'pointer',
                boxShadow: loading ? '0 0 20px rgba(239, 68, 68, 0.5), inset 0 2px 10px rgba(0,0,0,0.4)' : '0 10px 20px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.4)',
                textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                transition: 'all 0.2s'
              }}
            >
              {loading ? 'RENDERING AUDIO...' : 'GENERATE MASTER'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
