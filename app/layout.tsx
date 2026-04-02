import type { Metadata } from 'next';
import './globals.css';
import { getSession } from '../lib/auth';
import { Analytics } from '@vercel/analytics/next';
import FacebookPopup from './components/FacebookPopup';

export const metadata: Metadata = {
  title: 'TYPE BEAT STUDIO',
  description: 'AI Instrumental Generation',
  appleWebApp: { title: 'TYPE BEAT STUDIO', statusBarStyle: 'black-translucent' }
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
        <header className="main-header">
          {/* Left: Spinning Record & Branding */}
          <div className="header-left">
            <div className="spinning-record">
              💿
            </div>
            <a href="/" className="header-logo">
              TYPE BEAT STUDIO
              <span className="beta-badge">
                BETA
              </span>
            </a>
          </div>

          {/* Right: Quick Controls */}
          <div className="header-right">
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
        <Analytics />
        <FacebookPopup />
      </body>
    </html>
  );
}
