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
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });

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
              — Team TYPEBEAT
            </p>
          </div>
        </div>

        {/* Account Details & Stats */}
        <div className="glass-panel" style={{ padding: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', color: 'white', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Account Details</h2>
            <div style={{ marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Email Address</span>
              <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1rem' }}>{user?.email || 'N/A'}</p>
            </div>
            <div>
               <a href="/login" className="button" style={{ fontSize: '0.8rem', padding: '8px 16px', background: 'rgba(255,255,255,0.05)' }}>
                 Change Password
               </a>
            </div>
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', color: 'white', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Studio Statistics</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
               <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                 <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Lifetime Generations</span>
                 <p style={{ color: 'var(--accent-orange)', fontSize: '2rem', fontWeight: 800, margin: 0, lineHeight: 1 }}>{generations.length}</p>
               </div>
            </div>
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

      {/* Social Network Links */}
      <div style={{ marginTop: '4rem', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '2rem' }}>
         <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1.5rem' }}>Connect With Us</h3>
         <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <a href="https://www.facebook.com/mytypebeat1/" target="_blank" rel="noopener noreferrer" className="button" style={{ background: '#1877F2', border: 'none', color: 'white' }}>Facebook</a>
            <a href="https://www.instagram.com/mytypebeatapp" target="_blank" rel="noopener noreferrer" className="button highlight" style={{ background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', border: 'none', color: 'white' }}>Instagram</a>
            <a href="https://www.tiktok.com/@mytypebeat.com" target="_blank" rel="noopener noreferrer" className="button" style={{ background: '#000000', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}>TikTok</a>
            <a href="https://www.youtube.com/@TYPEBEATSTUDIOS" target="_blank" rel="noopener noreferrer" className="button highlight" style={{ background: '#FF0000', border: 'none', color: 'white' }}>YouTube</a>
            <a href="https://x.com/mytypebeat" target="_blank" rel="noopener noreferrer" className="button" style={{ background: '#000000', border: 'none', color: 'white' }}>𝕏 (Twitter)</a>
         </div>
      </div>
    </main>
  );
}
