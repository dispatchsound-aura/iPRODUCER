'use client';
import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import WavePlayer from './WavePlayer';

export default function BeatCard({ gen, crates, view = 'grid', role = 'ARTIST' }: { gen: any, crates: any[], view?: 'grid' | 'list', role?: string }) {
  const [stemStatus, setStemStatus] = useState(gen.stemStatus || 'none');
  const [stems, setStems] = useState<any>(
    typeof gen.stems === 'string' ? JSON.parse(gen.stems) : gen.stems || null
  );
  const [splitting, setSplitting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  const [title, setTitle] = useState(gen.title || '');
  const [vibe, setVibe] = useState(gen.vibe || '');
  const [keyProperty, setKeyProperty] = useState(gen.key || '');
  const [crateId, setCrateId] = useState(gen.crateId || '');
  const [bpm, setBpm] = useState<string>(gen.bpm ? gen.bpm.toString() : '');
  const [detectingBpm, setDetectingBpm] = useState(false);
  const [status, setStatus] = useState(gen.status);
  const [beatUrl, setBeatUrl] = useState(gen.beatUrl);
  const [progressWidth, setProgressWidth] = useState('0%');

  useEffect(() => {
    if (status !== 'ready' && status !== 'failed') {
      const t = setTimeout(() => setProgressWidth('90%'), 100);
      return () => clearTimeout(t);
    }
  }, [status]);

  const isList = view === 'list';

  // Poll Sonauto API if generation is pending
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === 'pending') {
      interval = setInterval(async () => {
        try {
          const query = gen.id === 'ephemeral' ? `?taskId=${gen.taskId}` : '';
          const res = await fetch(`/api/status/${gen.id}${query}`);
          if (res.ok) {
            const data = await res.json();
            if (data.status === 'SUCCESS' || data.status === 'ready') {
              setStatus('ready');
              if (data.beatUrl) setBeatUrl(data.beatUrl);
              // Universally auto-refresh the page when beat is done generating so user sees the beat fully loaded
              window.location.reload(); 
            }
          }
        } catch (e) {}
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [status, gen.id, gen.taskId]);

  // Poll LALAL.AI Extractor Array
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (stemStatus === 'splitting') {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/split/status/${gen.id}`);
          if (res.ok) {
            const data = await res.json();
            if (data.status === 'ready') {
              setStemStatus('ready');
              setStems(data.stems);
            }
          } else {
            setStemStatus('none');
            setSplitting(false);
            alert("Stem Extraction process was aborted by the Neural ML Server. The audio format may be incompatible or Server resources are overloaded. Please try again later.");
          }
        } catch (e) {
           setStemStatus('none');
           setSplitting(false);
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [stemStatus, gen.id]);

  const handleSplit = async () => {
    setSplitting(true);
    setStemStatus('splitting');
    try {
      const res = await fetch(`/api/split/${gen.id}`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
          alert(data.error || "Failed to split stems.");
          setStemStatus('none');
      }
    } catch (e) {
      alert("Network exception while calling the machine learning cluster.");
      setStemStatus('none');
    }
    setSplitting(false);
  };

  const handleSaveMeta = async () => {
    await fetch(`/api/generations/${gen.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, vibe, crateId, key: keyProperty, bpm: bpm ? parseInt(bpm, 10) : undefined })
    });
    setEditing(false);
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to permanently delete this track from your catalog? This cannot be undone.")) {
      try {
        const res = await fetch(`/api/generations/${gen.id}`, { method: 'DELETE' });
        if (res.ok) {
           window.location.reload();
        } else {
           alert("Failed to delete track. Please contact support.");
        }
      } catch (e) {
         console.error(e);
      }
    }
  };

  const handleDetectBpm = async () => {
     if (!beatUrl) return;
     setDetectingBpm(true);
     try {
       // @ts-ignore
       const MusicTempo = (await import('music-tempo')).default || (await import('music-tempo'));
       const res = await fetch('/api/proxy-audio?url=' + encodeURIComponent(beatUrl));
       const arrayBuffer = await res.arrayBuffer();
       
       const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 44100 });
       const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
       
       // Algorithmically map physical peak variances against standard mathematical histograms
       const channelData = audioBuffer.getChannelData(0);
       const calcTempo = new (MusicTempo.MusicTempo || MusicTempo)(channelData);
       setBpm(Math.round(calcTempo.tempo).toString());
     } catch (e) {
       console.error("BPM Detect Error", e);
       alert("Failed to analyze neural sequence arrays.");
     }
     setDetectingBpm(false);
  };

  const handleExtractMidi = async (audioUrl: string, filterName: string) => {
     setSplitting(true);
     try {
        const { BasicPitch, addPitchBendsToNoteEvents, noteFramesToTime, outputToNotesPoly } = await import('@spotify/basic-pitch');
        const MidiWriter = (await import('midi-writer-js')).default;

        const audioRes = await fetch(audioUrl);
        const arrayBuffer = await audioRes.arrayBuffer();
        
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 22050 });
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

        const basicPitch = new BasicPitch('/basic-pitch-model/model.json');
        
        const frames: number[][] = [];
        const onsets: number[][] = [];
        const contours: number[][] = [];
        
        await basicPitch.evaluateModel(
          audioBuffer.getChannelData(0),
          (f: any, o: any, c: any) => { frames.push(...f); onsets.push(...o); contours.push(...c); },
          (p: number) => {}
        );

        const notesData = noteFramesToTime(
           addPitchBendsToNoteEvents(contours, outputToNotesPoly(frames, onsets, 0.25, 0.25, 5))
        );

        const track = new MidiWriter.Track();
        track.setTempo(gen.bpm || 120);
        const ticksPerSecond = ((gen.bpm || 120) * 128) / 60;
        
        notesData.forEach(n => {
           track.addEvent(new MidiWriter.NoteEvent({
             pitch: [n.pitchMidi],
             duration: 'T' + Math.max(1, Math.round(n.durationSeconds * ticksPerSecond)),
             tick: Math.round(n.startTimeSeconds * ticksPerSecond),
             velocity: Math.max(1, Math.min(100, Math.round(n.amplitude * 100)))
           }));
        });

        const writer = new MidiWriter.Writer(track);
        const dataUri = writer.dataUri();
        
        const a = document.createElement('a');
        a.href = dataUri;
        a.download = `TYPEBEAT_${gen.id}_${filterName}_MIDI.mid`;
        a.click();
     } catch(e) {
        console.error(e);
        alert("ML Engine Failed computing output.");
     }
     setSplitting(false);
  };

  const displayTitle = gen.title || gen.prompt?.replace(/(, no lyrics, No Words, Instrumental, no vocals)/ig, '')?.replace(/, strictly generated in the exact musical key of [a-zA-Z\\s]+(?=,|$)/ig, '') || 'Custom Beat Generation';

  return (
    <div className={`glass-panel ${isList ? 'list-view-card' : ''}`} style={{ display: 'flex', flexDirection: isList ? 'row' : 'column', position: 'relative', gap: isList ? '1rem' : '0' }}>
      
      {!isList && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'var(--accent-orange)' }} />}
      {isList && <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '4px', background: 'var(--accent-orange)' }} />}

      <div style={{ flex: isList ? '1' : 'none', paddingLeft: isList ? '1rem' : '0' }}>
        {!editing ? (
          <>
            <h4 style={{ marginBottom: '0.2rem', marginTop: isList ? '0' : '0.5rem', color: '#fff', fontSize: '1.1rem' }}>{displayTitle}</h4>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
               {gen.vibe && <span style={{ background: '#2a2f34', color: 'var(--accent-green)', padding: '2px 8px', borderRadius: '2px', fontSize: '0.7rem' }}>{gen.vibe}</span>}
            </div>
            
            <button className="button" onClick={() => setShowDetails(!showDetails)} style={{ background: 'transparent', border: 'none', padding: 0, color: 'var(--text-secondary)', textTransform: 'none', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
               Details {showDetails ? '▲' : '▼'}
            </button>

            {showDetails && (
              <div style={{ background: 'var(--control-bg)', border: '1px solid var(--border-color)', padding: '10px', borderRadius: '2px', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '8px' }}>
                  <div>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>TEMPO</span>
                    <p style={{ color: 'var(--accent-orange)', fontSize: '0.85rem' }}>{gen.bpm ? `${gen.bpm} BPM` : 'AUTO'}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>KEY</span>
                    <p style={{ color: 'var(--accent-orange)', fontSize: '0.85rem' }}>{gen.key || 'UNKNOWN'}</p>
                  </div>
                </div>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>PROMPT</span>
                <p style={{ color: '#ccc', fontSize: '0.8rem', fontStyle: 'italic', marginTop: '4px' }}>"{gen.prompt}"</p>
              </div>
            )}
            <button onClick={() => setEditing(true)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--accent-orange)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}>EDIT</button>
          </>
        ) : (
          <div style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: isList ? '0' : '0.5rem' }}>
            <input type="text" className="input-field" placeholder="Beat Title" value={title} onChange={e => setTitle(e.target.value)} />
            <input type="text" className="input-field" placeholder="Vibe / Genre" value={vibe} onChange={e => setVibe(e.target.value)} />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
               <input type="text" className="input-field" style={{ flex: 1.5 }} placeholder="Musical Key (e.g. C# Minor)" value={keyProperty} onChange={e => setKeyProperty(e.target.value)} />
               <div style={{ flex: 1, display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                 <input type="number" className="input-field" style={{ width: '60px', border: 'none', borderRadius: 0 }} placeholder="BPM" value={bpm} onChange={e => setBpm(e.target.value)} />
                 <button onClick={handleDetectBpm} disabled={detectingBpm} style={{ flex: 1, background: 'var(--accent-orange)', color: '#000', border: 'none', fontWeight: 800, fontSize: '0.75rem', cursor: detectingBpm ? 'not-allowed' : 'pointer' }}>
                   {detectingBpm ? '...' : 'ANALYZER'}
                 </button>
               </div>
            </div>
            <select className="input-field" value={crateId} onChange={e => setCrateId(e.target.value)}>
              <option value="">No Crate</option>
              {crates.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
               <button className="button highlight" onClick={handleSaveMeta}>Save Meta</button>
               <button className="button" onClick={handleDelete} style={{ background: 'rgba(255,50,50,0.1)', color: '#ff4d4d', border: '1px solid rgba(255,50,50,0.3)', fontSize: '0.85rem' }}>
                 Delete Track
               </button>
            </div>
            <button onClick={() => setEditing(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--accent-orange)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}>CANCEL</button>
          </div>
        )}

        {gen.status !== 'ready' && gen.status !== 'failed' && (
          <div style={{ marginTop: isList ? '0' : '1rem' }}>
            <div style={{ position: 'relative', width: '100%', height: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
               {/* Progress Fill */}
               <div style={{
                  position: 'absolute', top: 0, left: 0, bottom: 0,
                  width: progressWidth, 
                  background: 'linear-gradient(90deg, transparent, var(--accent-orange))',
                  transition: 'width 70s cubic-bezier(0.1, 0.8, 0.2, 1)',
                  opacity: 0.7
               }} />
               {/* Animated Pulse Overlay */}
               <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                  animation: 'shimmer 2s infinite', zIndex: 1
               }} />
               <style>{`@keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }`}</style>
               {/* Text Layer */}
               <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 600, color: '#fff', zIndex: 2, letterSpacing: '1px', textTransform: 'uppercase', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                  Rendering AI Composition...
               </div>
            </div>
            <div style={{ textAlign: 'center', marginTop: '0.6rem', color: 'var(--accent-blue)', fontSize: '0.75rem', fontStyle: 'italic', opacity: 0.8 }}>
              Analyzing prompts & generating neural audio sequences (Avg. 60-70s)
            </div>
          </div>
        )}
      </div>

      {gen.status === 'ready' && beatUrl && (
        <div style={{ flex: isList ? '2' : 'none', marginTop: isList ? '0' : 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <div style={{ width: '8px', height: '8px', background: 'var(--accent-green)', borderRadius: '50%' }}></div>
             <span style={{ fontSize: '0.75rem', color: '#fff', fontWeight: 500 }}>MASTER RENDER</span>
          </div>

          <WavePlayer url={gen.id === 'ephemeral' ? beatUrl : `/api/audio/${gen.id}`} />

          {gen.id === 'ephemeral' ? (
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <button 
                onClick={() => window.location.href = '/signup'} 
                className="button highlight" 
                style={{ flex: 1, textAlign: 'center', background: 'var(--accent-purple)' }}
              >
                Sign Up To Save & Download Stems
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <a href={`/api/audio/${gen.id}`} download={`TYPEBEAT_${gen.id}_Master.mp3`} className="button" style={{ flex: 1, textAlign: 'center' }}>
                MP3
              </a>
              {stemStatus === 'none' && (
                <button onClick={handleSplit} disabled={splitting} className="button highlight" style={{ flex: 2 }}>
                  {splitting ? 'Extracting...' : 'Isolate Stems'}
                </button>
              )}
              {stemStatus === 'splitting' && (
                <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <button disabled className="button" style={{ width: '100%', background: 'var(--accent-orange)' }}>
                    Processing Neural Stems... 
                  </button>
                  <span style={{ fontSize: '0.65rem', color: 'var(--accent-orange)', textAlign: 'center', lineHeight: '1.2' }}>
                    Process runs securely in the background (15-45s). Stems will auto-save to this catalog card.
                  </span>
                </div>
              )}
            </div>
          )}

          {stemStatus === 'ready' && stems && (
             <div style={{ background: 'var(--control-bg)', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '0.5rem' }}>
                <h5 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Isolated Elements (Demucs)</h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                   
                   <button 
                     onClick={async () => {
                       setSplitting(true);
                       try {
                           const zip = new JSZip();
                           const activeStems = Object.keys(stems).filter(k => k !== 'residuals');
                           for (const key of activeStems) {
                               const res = await fetch('/api/proxy-audio?url=' + encodeURIComponent(stems[key]));
                               const blob = await res.blob();
                               zip.file(`TYPEBEAT_${gen.id}_${key}.mp3`, blob);
                           }
                           const content = await zip.generateAsync({ type: 'blob' });
                           saveAs(content, `TYPEBEAT_${gen.id}_Stems.zip`);
                       } catch(e) {
                           console.error(e);
                           alert("Failed to compile ZIP archive. Check network connection.");
                       }
                       setSplitting(false);
                     }}
                     disabled={splitting}
                     className="button highlight"
                     style={{ fontSize: '0.8rem', padding: '10px', boxShadow: '0 0 15px rgba(56, 189, 248, 0.3)' }}
                   >
                     {splitting ? 'Compiling ZIP Archive (This takes a while)...' : 'Download All Stems (ZIP)'}
                   </button>
                   
                   {role === 'SUPER_PRODUCER' && stems.bass && stems.synthesizer && (
                     <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.2rem' }}>
                       <button 
                           onClick={() => handleExtractMidi('/api/proxy-audio?url=' + encodeURIComponent(stems.bass), 'bass')}
                           disabled={splitting}
                           className="button highlight" 
                           style={{ flex: 1, fontSize: '0.7rem', padding: '6px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white' }}
                       >
                           {splitting ? 'Processing MIDI...' : 'Extract Bass MIDI'}
                       </button>
                       <button 
                           onClick={() => handleExtractMidi('/api/proxy-audio?url=' + encodeURIComponent(stems.synthesizer), 'synth')}
                           disabled={splitting}
                           className="button highlight" 
                           style={{ flex: 1, fontSize: '0.7rem', padding: '6px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white' }}
                       >
                           {splitting ? 'Processing MIDI...' : 'Extract Synth MIDI'}
                       </button>
                     </div>
                   )}
                </div>
             </div>
          )}
        </div>
      )}
    </div>
  );
}
