import React from 'react';
import { PrismaClient } from '@prisma/client';
import BeatContainer from '../components/BeatContainer';
import CreateCrateButton from '../components/CreateCrateButton';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export default async function Dashboard({ searchParams }: { searchParams: { crateId?: string } }) {
  const pendingGenerations = await prisma.generation.findMany({ 
    where: { NOT: { status: { in: ['ready', 'SUCCESS', 'FAILURE', 'failed'] } } } 
  });
  
  // Sync pending items with Sonauto before rendering
  for (const gen of pendingGenerations) {
    if (gen.taskId) {
      const res = await fetch(`https://api.sonauto.ai/v1/generations/${gen.taskId}`, {
        headers: { 'Authorization': `Bearer ${process.env.SONAUTO_API_KEY}` },
        cache: 'no-store'
      });
      if (res.ok) {
        const data = await res.json();
        console.log("Dashboard Polled Data:", data.status, "for", gen.taskId);
        if (data.status === 'SUCCESS' && data.song_paths && data.song_paths.length > 0) {
           await prisma.generation.update({
             where: { id: gen.id },
             data: { status: 'ready', beatUrl: data.song_paths[0] }
           });
           console.log("Updated to ready for", gen.id);
        } else if (data.status === 'FAILURE') {
           await prisma.generation.update({
             where: { id: gen.id },
             data: { status: 'failed' }
           });
        } else if (data.status && data.status !== gen.status) {
           await prisma.generation.update({
             where: { id: gen.id },
             data: { status: data.status }
           });
        }
      } else {
        console.error("Dashboard Poll failed:", res.status, await res.text());
      }
    }
  }

  const targetCrateId = searchParams?.crateId;
  const generations = await prisma.generation.findMany({
    where: targetCrateId ? { crateId: targetCrateId } : undefined,
    orderBy: { createdAt: 'desc' }
  });

  const crates = await prisma.crate.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <main style={{ padding: '0', height: '100%', display: 'flex', flexDirection: 'column' }}>
      
        {/* DAW Toolbar Secondary */}
      <div style={{ padding: '12px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)' }}>
        <h2 style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)' }}>Catalog</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <a href="/dashboard" className="button" style={{ fontSize: '0.75rem' }}>⟳ Refresh Catalog</a>
        </div>
      </div>
      
      {/* Workspace Panel Split */}
      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', flex: 1, height: 'calc(100vh - 120px)' }}>
        
        {/* Left Sidebar (Media Browser) */}
        <aside style={{ borderRight: '1px solid var(--glass-border)', padding: '2rem 1rem', overflowY: 'auto', background: 'var(--glass-bg)' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.75rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Smart Folders</h3>
          <ul style={{ listStyle: 'none', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            <li style={{ padding: '8px 12px', background: !targetCrateId ? 'rgba(56, 189, 248, 0.1)' : 'transparent', borderRadius: '8px', borderLeft: !targetCrateId ? '3px solid var(--accent-blue)' : '3px solid transparent' }}>
              <a href="/dashboard" style={{ color: !targetCrateId ? '#fff' : 'inherit', fontSize: '0.9rem', display: 'block' }}>All Outputs</a>
            </li>
          </ul>

          <h3 style={{ marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.75rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Crates (Playlists)</h3>
          <ul style={{ listStyle: 'none', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            {crates.map(c => (
              <li key={c.id} style={{ marginBottom: '0.5rem', padding: '8px 12px', borderRadius: '8px', background: targetCrateId === c.id ? 'rgba(192, 132, 252, 0.1)' : 'transparent', borderLeft: targetCrateId === c.id ? '3px solid var(--accent-purple)' : '3px solid transparent' }}>
                <a href={`/dashboard?crateId=${c.id}`} style={{ color: targetCrateId === c.id ? 'white' : 'inherit', fontWeight: targetCrateId === c.id ? '600' : '400', fontSize: '0.9rem' }}>
                  {c.name}
                </a>
              </li>
            ))}
          </ul>
          
          <CreateCrateButton />
        </aside>

        <section style={{ padding: '3rem', overflowY: 'auto' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }} className="glass-panel">
            <BeatContainer generations={generations} crates={crates} />
          </div>
        </section>
      </div>
    </main>
  );
}
