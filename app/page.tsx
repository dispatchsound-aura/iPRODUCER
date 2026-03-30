'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [bpm, setBpm] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const router = useRouter();

  // For MVP, just pull generations from the generic api directly to get past prompts
  useEffect(() => {
     fetch('/api/generations').then(res => res.json()).then(data => {
        if (data.generations) {
           setHistory(data.generations);
        }
     });
  }, []);

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
    <main style={{ padding: '4rem', maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
      <h1 style={{ fontSize: '4.5rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--accent-color)', letterSpacing: '-2px', textShadow: '0 0 15px rgba(217, 119, 6, 0.5)' }}>
        Studio Generation Engine
      </h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', marginBottom: '3rem', fontWeight: 400, fontFamily: 'Roboto Mono, monospace' }}>
        Initiate sequence to print your master and stems.
      </p>
      
      <div className="glass-panel" style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <textarea 
          className="input-field" 
          placeholder="Describe your beat (e.g. Dark trap beat in the style of Metro Boomin with heavy 808s...)"
          rows={4}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          style={{ resize: 'none' }}
        />
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <input 
              type="number" 
              className="input-field" 
              placeholder="BPM (Optional)" 
              value={bpm}
              onChange={(e) => setBpm(e.target.value)}
              style={{ flex: 1 }}
            />
            {bpm && <span style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', fontStyle: 'italic', textAlign: 'left', flex: 2 }}>Note: Using a custom BPM defaults audio processing to the V2 Sonauto engine.</span>}
        </div>
        <button 
          className="button" 
          onClick={handleGenerate}
          disabled={loading || !prompt}
          style={{ width: '100%', opacity: loading ? 0.7 : 1, padding: '16px', fontSize: '1.2rem', marginTop: '1rem' }}
        >
          {loading ? 'GENERATING...' : 'GENERATE BEAT'}
        </button>
      </div>

      {history.length > 0 && (
          <div style={{ marginTop: '4rem', textAlign: 'left', maxWidth: '800px', margin: '4rem auto 0 auto' }}>
             <h3 style={{ fontSize: '1.5rem', color: 'var(--accent-cyan)', marginBottom: '1rem', letterSpacing: '1px' }}>Your Prompt Library</h3>
             <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>Recent prompts that created your library tracks. Tap one to reuse it.</p>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {history.map((h, i) => (
                   <div key={i} onClick={() => setPrompt(h.prompt)} className="glass-panel" style={{ padding: '12px', cursor: 'pointer', transition: 'all 0.2s', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontStyle: 'italic' }}>"{h.prompt}"</p>
                      {h.title && <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>Saved as: <b style={{ color: 'var(--accent-color)' }}>{h.title}</b></span>}
                   </div>
                ))}
             </div>
          </div>
      )}

      <footer style={{ marginTop: 'auto', paddingTop: '4rem', color: 'var(--text-secondary)', fontSize: '0.875rem', opacity: 0.5 }}>
        powered by Sonauto
      </footer>
    </main>
  );
}
