import React from 'react';
import { PrismaClient } from '@prisma/client';
import { getSession } from '../../lib/auth';
import LogoutButton from '../components/LogoutButton';
import { redirect } from 'next/navigation';

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const session = await getSession();
  
  if (!session) {
    redirect('/login');
  }

  const userId = session.userId as string;

  const generations = await prisma.generation.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: { prompt: true, id: true, createdAt: true }
  });

  // Extract unique prompts
  const uniquePrompts = Array.from(new Set(generations.map(g => g.prompt))).filter(Boolean);

  return (
    <main style={{ padding: 'clamp(2rem, 10vh, 6rem) 1rem', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, color: 'white', letterSpacing: '-1px' }}>
            Account Settings
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your personal studio profile.</p>
        </div>
        <LogoutButton />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Admin Updates Board */}
        <div className="glass-panel" style={{ padding: '2rem', border: '1px solid rgba(56, 189, 248, 0.3)', background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.05), transparent)' }}>
          <h2 style={{ fontSize: '1.2rem', color: 'var(--accent-blue)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            📣 Admin Updates
          </h2>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '12px' }}>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.95rem', lineHeight: '1.6' }}>
              <strong>Studio Announcement:</strong> We are currently experiencing extremely high traffic volumes as hundreds of producers cook up beats! Please be patient, generating the highest-fidelity instrumentals takes immense computing power. 
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '1rem' }}>
              — Team iPRODUCER
            </p>
          </div>
        </div>

        {/* Saved Prompts History Log */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.2rem', color: 'white', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
            All Processed Prompts
          </h2>
          {uniquePrompts.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>No prompts found. Go cook up some beats!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {uniquePrompts.map((prompt, idx) => {
                // Sanitize string to visually remove trailing generator instructions for legacy UI beats just in case
                const cleanPrompt = prompt.replace(/(, no lyrics, No Words, Instrumental, no vocals)/ig, '').replace(/, strictly generated in the exact musical key of [a-zA-Z\s]+(?=,|$)/ig, '');
                
                return (
                  <div key={idx} style={{ 
                    padding: '1rem', 
                    background: 'rgba(255,255,255,0.02)', 
                    border: '1px solid rgba(255,255,255,0.05)', 
                    borderRadius: '12px',
                    color: 'rgba(255,255,255,0.8)',
                    fontSize: '0.95rem'
                  }}>
                    {cleanPrompt}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
