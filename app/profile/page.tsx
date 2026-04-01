import React from 'react';
import { PrismaClient } from '@prisma/client';
import { getSession } from '../../lib/auth';
import LogoutButton from '../components/LogoutButton';
import { redirect } from 'next/navigation';

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const session = await getSession();
  
  if (!session || !session.userId) {
    redirect('/login');
  }

  const userId = session.userId as string;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });

    const generations = await prisma.generation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { prompt: true, id: true, createdAt: true }
    });

    // Extract unique prompts securely
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
                — Team TYPE BEAT STUDIO
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
                  const safeStr = typeof prompt === 'string' ? prompt : '';
                  const cleanPrompt = safeStr.replace(/(, no lyrics, No Words, Instrumental, no vocals)/ig, '').replace(/, strictly generated in the exact musical key of [a-zA-Z\s]+(?=,|$)/ig, '');
                  
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
           <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap', maxWidth: '800px', margin: '0 auto' }}>
              <a href="https://www.facebook.com/mytypebeat1/" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', transition: 'color 0.2s' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              <a href="https://www.instagram.com/mytypebeatapp" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', transition: 'color 0.2s' }}>
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="https://www.tiktok.com/@mytypebeat.com" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', transition: 'color 0.2s' }}>
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"></path></svg>
              </a>
              <a href="https://www.youtube.com/@TYPEBEATSTUDIOS" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', transition: 'color 0.2s' }}>
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
              </a>
              <a href="https://x.com/mytypebeat" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', transition: 'color 0.2s' }}>
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
              </a>
           </div>
        </div>
      </main>
    );
  } catch (error: any) {
    return (
      <main style={{ padding: 'clamp(2rem, 10vh, 6rem) 1rem', maxWidth: '800px', margin: '0 auto', width: '100%', color: 'white', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '4rem 2rem' }}>
          <h1 style={{ color: '#ff6b6b', marginBottom: '1rem', fontSize: '2rem' }}>Profile Data Unavailable</h1>
          <p style={{ color: 'var(--text-secondary)' }}>We couldn't load your studio profile at this time.</p>
          <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255,50,50,0.1)', borderRadius: '12px', border: '1px solid rgba(255,50,50,0.2)', display: 'inline-block' }}>
            <code style={{ color: '#ff6b6b', fontSize: '0.85rem' }}>{error?.message || error?.toString()}</code>
          </div>
          <div style={{ marginTop: '2rem' }}>
            <a href="/dashboard" className="button" style={{ display: 'inline-block' }}>Return to Studio Dashboard</a>
          </div>
        </div>
      </main>
    );
  }
}
