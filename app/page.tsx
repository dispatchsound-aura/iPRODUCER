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
  const [globalStats, setGlobalStats] = useState<{count: number, producers: number} | null>(null);
  const router = useRouter();

  useEffect(() => {
    try {
      const saved = localStorage.getItem('typebeat_recent_prompts');
      if (saved) setRecentPrompts(JSON.parse(saved));
    } catch(e) {}

    fetch('/api/stats')
      .then(r => r.json())
      .then(data => { 
          if (data.success && data.count) setGlobalStats({ count: data.count, producers: data.producers }); 
      })
      .catch(() => {});
  }, []);

  const handleEnhance = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/copilot', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      if (res.ok && data.success) {
         setPrompt(data.enhanced);
      }
    } catch(e) {}
    setLoading(false);
  };

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
          Design Your Sound.
        </h1>
        <p style={{ 
            color: 'var(--text-secondary)', 
            fontSize: 'clamp(1rem, 3vw, 1.4rem)', 
            fontWeight: 400, 
            lineHeight: 1.6,
            maxWidth: '800px',
            margin: '0 auto 1.5rem auto'
        }}>
          Instantly manifest industry-grade, royalty-free instrumentals. Extract studio-ready bass, drum, and melody stems alongside exact MIDI arrangements natively, unlocking infinite creative control in your DAW.
        </p>

        {globalStats !== null && (
          <div style={{ marginTop: '1.5rem', display: 'inline-block', padding: '8px 16px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '30px', color: 'var(--accent-blue)', fontSize: '0.9rem', fontWeight: 600, letterSpacing: '1px' }}>
            JOIN {globalStats.producers.toLocaleString()}+ PRODUCERS WHO HAVE COOKED {globalStats.count.toLocaleString()} BEATS
          </div>
        )}
      </section>

      {/* 2. CORE GENERATOR SECTION */}
      <style>{`
        @media (max-width: 1200px) {
          .studio-monitor { display: none !important; }
        }
      `}</style>
      <section style={{ maxWidth: '800px', width: '100%', marginBottom: '4rem', position: 'relative' }}>
        <img src="/studio_monitor.png" alt="Left Monitor" className="studio-monitor" style={{ position: 'absolute', left: '-350px', top: '50%', transform: 'translateY(-50%)', width: '420px', height: 'auto', opacity: 0.25, zIndex: -1, pointerEvents: 'none', mixBlendMode: 'screen' }} />
        <img src="/studio_monitor.png" alt="Right Monitor" className="studio-monitor" style={{ position: 'absolute', right: '-350px', top: '50%', transform: 'translateY(-50%) scaleX(-1)', width: '420px', height: 'auto', opacity: 0.25, zIndex: -1, pointerEvents: 'none', mixBlendMode: 'screen' }} />

        <div className="glass-panel" style={{ width: '100%', padding: 'clamp(1.5rem, 5vw, 3rem)', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(1rem, 4vw, 2rem)' }}>
            
            {/* Central Prompt */}
            <div style={{ width: '100%', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                 <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Main Sequence</span>
                 <button 
                   onClick={handleEnhance}
                   title="Deploy the Co-Producer AI Agent to instantly rewrite & upgrade your prompt to a studio-ready fidelity tier."
                   style={{ background: 'linear-gradient(135deg, rgba(244, 114, 182, 0.2), rgba(192, 132, 252, 0.2))', border: '1px solid var(--accent-purple)', padding: '4px 12px', borderRadius: '12px', color: 'white', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                 >
                   ✨ AI Co-Producer
                 </button>
              </div>
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
            {loading && (
               <div style={{ marginTop: '1rem', position: 'relative', width: '100%', height: '54px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                 <div style={{
                    position: 'absolute', top: 0, left: 0, bottom: 0,
                    width: '90%', background: 'linear-gradient(90deg, transparent, var(--accent-orange))',
                    transition: 'width 60s cubic-bezier(0.1, 0.8, 0.2, 1)', opacity: 0.7
                 }} />
                 <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)', animation: 'shimmer 2s infinite', zIndex: 1 }} />
                 <style>{`@keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }`}</style>
                 <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 700, color: '#fff', zIndex: 2, letterSpacing: '2px', textTransform: 'uppercase', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                    Synthesizing Neural Sequences...
                 </div>
               </div>
            )}
            
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
                display: loading ? 'none' : 'block'
              }}
            >
              COOK UP
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
                 <li>✓ 1 Free Neural Stem Isolation</li>
                 <li style={{ opacity: 0.3 }}>✗ Unlimited Generations</li>
                 <li style={{ opacity: 0.3 }}>✗ Basic Pitch MIDI Pack</li>
              </ul>
              <div style={{ flexGrow: 1 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '2rem' }}>
                 <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', marginBottom: '0.5rem', fontStyle: 'italic' }}>*Token top-ups available after weekly limit</p>
                 <a href="/login" className="button" style={{ textAlign: 'center', width: '100%', padding: '1rem' }}>START CREATING</a>
              </div>
           </div>

           {/* Tier 2: Producer */}
           <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', borderRadius: '24px', position: 'relative', overflow: 'hidden', border: '1px solid rgba(244, 114, 182, 0.3)', boxShadow: '0 0 40px rgba(244, 114, 182, 0.1)' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'var(--gradient-primary)' }} />
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>PRODUCER</h3>
              <div style={{ fontSize: '3rem', fontWeight: 800, margin: '1rem 0 2rem 0' }}>$9.99<span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-secondary)' }}>/mo</span></div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem', color: 'rgba(255,255,255,0.8)' }}>
                 <li><span style={{ color: 'var(--accent-purple)' }}>✓</span> <b>Infinite</b> Beats / Week</li>
                 <li><span style={{ color: 'var(--accent-purple)' }}>✓</span> Full Commercial Rights</li>
                 <li><span style={{ color: 'var(--accent-purple)' }}>✓</span> High-Fidelity MP3 Downloads</li>
                 <li><span style={{ color: 'var(--accent-purple)' }}>✓</span> Saved Smart Crate Library</li>
                 <li><span style={{ color: 'var(--accent-purple)' }}>✓</span> <b>10 Neural Stems / Week</b></li>
                 <li style={{ opacity: 0.3 }}>✗ Basic Pitch MIDI Pack</li>
              </ul>
              <div style={{ flexGrow: 1 }} />
              <CheckoutButton priceId="price_1TGwh9Pz1LkOQIGYG8lmD2w0" label="SUBSCRIBE NOW" isHighlight={true} />
           </div>

           {/* Tier 3: Super Producer */}
           <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', borderRadius: '24px', position: 'relative', overflow: 'hidden', border: '1px solid rgba(56, 189, 248, 0.5)', boxShadow: '0 0 60px rgba(56, 189, 248, 0.15)' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'var(--accent-blue)' }} />
              <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'var(--accent-blue)', color: '#000', padding: '4px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '1px' }}>INDUSTRY PRO</div>
              
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-blue)' }}>SUPER PRODUCER</h3>
              <div style={{ fontSize: '3rem', fontWeight: 800, margin: '1rem 0 2rem 0' }}>$19.99<span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-secondary)' }}>/mo</span></div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem', color: 'rgba(255,255,255,0.8)' }}>
                 <li><span style={{ color: 'var(--accent-blue)' }}>✓</span> <b>Infinite</b> Beats / Week</li>
                 <li><span style={{ color: 'var(--accent-blue)' }}>✓</span> Full Commercial Rights</li>
                 <li><span style={{ color: 'var(--accent-blue)' }}>✓</span> <b>Neural Demucs Stem Extraction</b> <span style={{ color: 'var(--accent-orange)', fontSize: '0.65rem', verticalAlign: 'top', background: 'rgba(249, 115, 22, 0.2)', padding: '2px 4px', borderRadius: '4px' }}>BETA</span></li>
                 <li><span style={{ color: 'var(--accent-blue)' }}>✓</span> <b>Spotify Basic Pitch MIDI Isolator</b> <span style={{ color: 'var(--accent-orange)', fontSize: '0.65rem', verticalAlign: 'top', background: 'rgba(249, 115, 22, 0.2)', padding: '2px 4px', borderRadius: '4px' }}>BETA</span></li>
                 <li><span style={{ color: 'var(--accent-blue)' }}>✓</span> Download 4-Track Studio Pipelines</li>
                 <li><span style={{ color: 'var(--accent-blue)' }}>✓</span> Beat Catalog Matrix</li>
              </ul>
              
              <div style={{ marginTop: '1.5rem', padding: '0.75rem', background: 'rgba(249, 115, 22, 0.1)', border: '1px solid rgba(249, 115, 22, 0.3)', borderRadius: '8px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)', lineHeight: '1.4' }}>
                <strong style={{ color: 'var(--accent-orange)' }}>⚠️ BETA NOTICE:</strong> High-tier Stem Extraction and MIDI generations are currently restricted features being actively worked on.<br/><br/>Join Super Producer now to unlock Infinite Beats and immediately be notified to participate in the upcoming beta testing rollout!
              </div>

              <div style={{ flexGrow: 1 }} />
              <CheckoutButton priceId="price_1TGwhAPz1LkOQIGYHNcXRFFw" label="JOIN SUPER PRODUCER BETA" isHighlight={true} styleOverride={{ background: 'var(--accent-blue)' }} />
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
      
      {/* Social Network Links */}
      <section style={{ padding: '2rem 1rem 0', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
         <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap', maxWidth: '800px' }}>
            <a href="https://www.facebook.com/mytypebeat1/" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = '#fff'} onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            </a>
            <a href="https://www.instagram.com/mytypebeatapp" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = '#fff'} onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}>
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
            <a href="https://www.tiktok.com/@mytypebeat.com" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = '#fff'} onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}>
               <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"></path></svg>
            </a>
            <a href="https://www.youtube.com/@TYPEBEATSTUDIOS" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = '#fff'} onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}>
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
            </a>
            <a href="https://x.com/mytypebeat" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = '#fff'} onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}>
               <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
            </a>
         </div>
      </section>

      <div style={{ marginTop: '2rem', marginBottom: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', opacity: 0.6, fontSize: '0.8rem', letterSpacing: '1px', color: 'var(--text-secondary)' }}>
        <a href="mailto:admin@mytypebeat.com" style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: 600 }}>Support: admin@mytypebeat.com</a>
        <span style={{ opacity: 0.5, fontSize: '0.7rem' }}>POWERED BY SONAUTO & REPLICATE</span>
      </div>
    </main>
  );
}
