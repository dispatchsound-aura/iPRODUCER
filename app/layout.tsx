import type { Metadata } from 'next';
import './globals.css';
import { getSession } from '../lib/auth';

export const metadata: Metadata = {
  title: 'TYPEBEAT',
  description: 'AI Instrumental Generation',
  appleWebApp: { title: 'TYPEBEAT', statusBarStyle: 'black-translucent' }
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <html lang="en">
      <body>
        {/* Floating Glass Navigation */}
        <header style={{ 
          height: '70px', 
          background: 'rgba(5, 5, 10, 0.4)', 
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          padding: '0 40px',
          position: 'fixed',
          top: 0, left: 0, right: 0,
          zIndex: 1000,
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
        }}>
          {/* Left: Spinning Record & Branding */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="spinning-record" style={{ fontSize: '1.8rem' }}>
              💿
            </div>
            <a href="/" style={{ fontWeight: 800, letterSpacing: '2px', fontSize: '1.4rem', color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px', textShadow: '0 0 20px rgba(255,255,255,0.3)', textDecoration: 'none' }}>
              TYPEBEAT
              <span style={{ fontSize: '0.65rem', fontWeight: 900, background: '#06b6d4', color: '#000', padding: '3px 8px', borderRadius: '4px', letterSpacing: '2px', textShadow: 'none', boxShadow: '0 0 15px rgba(6, 182, 212, 0.6)' }}>
                BETA
              </span>
            </a>
          </div>

          {/* Right: Quick Controls */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            {session ? (
              <>
                <a href="/dashboard" className="button" style={{ padding: '8px 16px', fontSize: '0.9rem', border: 'none', background: 'transparent' }}>Catalog</a>
                <a href="/profile" className="button highlight" style={{ padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--accent-purple)' }} title="Account Settings">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </a>
              </>
            ) : (
              <>
                <a href="/login" className="button highlight" style={{ background: 'transparent', border: '1px solid var(--accent-blue)', color: 'white', whiteSpace: 'nowrap' }}>Log In</a>
                <a href="/signup" className="button highlight" style={{ background: 'var(--accent-purple)' }}>Join</a>
              </>
            )}
          </div>
        </header>

        {/* Main Workspace Area */}
        <div style={{ marginTop: '70px', minHeight: 'calc(100vh - 70px)', display: 'flex', flexDirection: 'column' }}>
          {children}
        </div>
      </body>
    </html>
  );
}
