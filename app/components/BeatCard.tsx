'use client';
import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

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
  const [status, setStatus] = useState(gen.status);
  const [beatUrl, setBeatUrl] = useState(gen.beatUrl);

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
              // Only reload if hitting the permanent database
              if (gen.id !== 'ephemeral') {
                 window.location.reload(); 
              }
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
          }
        } catch (e) {}
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
      body: JSON.stringify({ title, vibe, crateId, key: keyProperty })
    });
    setEditing(false);
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
            <input type="text" className="input-field" placeholder="Musical Key (e.g. C# Minor)" value={keyProperty} onChange={e => setKeyProperty(e.target.value)} />
            <select className="input-field" value={crateId} onChange={e => setCrateId(e.target.value)}>
              <option value="">No Crate</option>
              {crates.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button className="button highlight" onClick={handleSaveMeta} style={{ alignSelf: 'flex-start' }}>Save Meta</button>
            <button onClick={() => setEditing(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--accent-orange)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}>CANCEL</button>
          </div>
        )}

        {gen.status !== 'ready' && gen.status !== 'failed' && (
          <>
            <button className="button" disabled style={{ width: '100%', marginTop: isList ? '0' : '1rem' }}>
              Rendering... ({gen.status})
            </button>
            <div style={{ textAlign: 'center', marginTop: '0.5rem', color: 'var(--accent-blue)', fontSize: '0.8rem', fontStyle: 'italic', opacity: 0.8 }}>
              Please allow up to 60 seconds for the beat to completely populate here in your catalog.
            </div>
          </>
        )}
      </div>

      {gen.status === 'ready' && beatUrl && (
        <div style={{ flex: isList ? '2' : 'none', marginTop: isList ? '0' : 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <div style={{ width: '8px', height: '8px', background: 'var(--accent-green)', borderRadius: '50%' }}></div>
             <span style={{ fontSize: '0.75rem', color: '#fff', fontWeight: 500 }}>MASTER RENDER</span>
          </div>
          <audio 
            controls 
            src={gen.id === 'ephemeral' ? beatUrl : `/api/audio/${gen.id}`} 
            onPlay={(e) => {
              const elements = document.querySelectorAll('audio');
              elements.forEach((audio) => {
                if (audio !== e.target) {
                  audio.pause();
                }
              });
            }}
            style={{ width: '100%', height: '32px', marginBottom: '0.5rem', filter: 'invert(0.9) hue-rotate(180deg) grayscale(1)' }} 
          />

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
                <button disabled className="button" style={{ flex: 2, background: 'var(--accent-orange)' }}>
                  Processing ML Stems... 
                </button>
              )}
            </div>
          )}

          {stemStatus === 'ready' && stems && (
             <div style={{ background: 'var(--control-bg)', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '0.5rem' }}>
                <h5 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Isolated Elements (Demucs)</h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                   {Object.keys(stems).filter(k => k !== 'residuals').map((keyName, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'space-between' }}>
                        <a href={stems[keyName]} target="_blank" download={`TYPEBEAT_${gen.id}_${keyName}.mp3`} className="button" style={{ flex: 1, fontSize: '0.7rem', padding: '6px', textAlign: 'center', background: '#30363a', textTransform: 'capitalize' }}>
                          Download {keyName} mp3
                        </a>
                        {(keyName === 'bass' || keyName === 'synthesizer') && role === 'SUPER_PRODUCER' && (
                           <button 
                             onClick={() => handleExtractMidi(stems[keyName], keyName)}
                             disabled={splitting}
                             className="button highlight" 
                             style={{ flex: 1, fontSize: '0.7rem', padding: '6px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white' }}
                           >
                             {splitting ? 'Processing MIDI...' : 'Extract MIDI'}
                           </button>
                        )}
                      </div>
                   ))}
                   
                   <button 
                     onClick={async () => {
                       setSplitting(true);
                       try {
                           const zip = new JSZip();
                           const activeStems = Object.keys(stems).filter(k => k !== 'residuals');
                           for (const key of activeStems) {
                               const res = await fetch(stems[key]);
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
                     style={{ marginTop: '0.5rem', fontSize: '0.8rem', padding: '10px', boxShadow: '0 0 15px rgba(56, 189, 248, 0.3)' }}
                   >
                     {splitting ? 'Compiling ZIP Archive...' : 'Download All Stems (ZIP)'}
                   </button>
                </div>
             </div>
          )}
        </div>
      )}
    </div>
  );
}
