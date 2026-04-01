'use client';
import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';

export default function WavePlayer({ url }: { url: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    wavesurferRef.current = WaveSurfer.create({
      container: containerRef.current,
      waveColor: 'rgba(56, 189, 248, 0.4)',
      progressColor: '#38bdf8',
      cursorColor: '#fff',
      barWidth: 2,
      barRadius: 3,
      cursorWidth: 1,
      height: 48,
      normalize: true,
    });

    wavesurferRef.current.load(url);

    wavesurferRef.current.on('ready', () => setIsReady(true));
    wavesurferRef.current.on('play', () => setIsPlaying(true));
    wavesurferRef.current.on('pause', () => setIsPlaying(false));
    wavesurferRef.current.on('finish', () => setIsPlaying(false));

    return () => {
      wavesurferRef.current?.destroy();
    };
  }, [url]);

  const togglePlayback = () => {
    if (!wavesurferRef.current) return;
    
    // Auto-pause other playing wavesurfers by dispatching a global event
    if (!isPlaying) {
      window.dispatchEvent(new CustomEvent('wave-play', { detail: { id: url }}));
    }
    wavesurferRef.current.playPause();
  };

  useEffect(() => {
    const handleGlobalPlay = (e: any) => {
      if (e.detail.id !== url && wavesurferRef.current?.isPlaying()) {
        wavesurferRef.current.pause();
      }
    };
    window.addEventListener('wave-play', handleGlobalPlay);
    return () => window.removeEventListener('wave-play', handleGlobalPlay);
  }, [url]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%', marginBottom: '1rem', background: 'rgba(0,0,0,0.3)', padding: '0.5rem 1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
      <button 
        onClick={togglePlayback}
        disabled={!isReady}
        className="button highlight"
        style={{
          width: '36px', height: '36px', padding: 0,
          borderRadius: '50%', border: 'none',
          background: isReady ? 'var(--accent-blue)' : 'rgba(255,255,255,0.1)',
          color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: isReady ? 'pointer' : 'not-allowed',
          flexShrink: 0,
          boxShadow: isPlaying ? '0 0 15px rgba(56, 189, 248, 0.6)' : 'none'
        }}
      >
        {isPlaying ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: '2px' }}><path d="M8 5v14l11-7z"/></svg>
        )}
      </button>

      <div ref={containerRef} style={{ flex: 1, position: 'relative' }}>
         {!isReady && (
           <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.75rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
             Decoding Audio Array...
           </div>
         )}
      </div>
    </div>
  );
}
