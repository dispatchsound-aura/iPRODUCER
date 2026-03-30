import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Typebeat Studio pro',
  description: 'AI Instrumental Generation',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
            <a href="/" style={{ fontWeight: 800, letterSpacing: '2px', fontSize: '1.4rem', color: '#FFF', display: 'flex', alignItems: 'center', gap: '4px', textShadow: '0 0 20px rgba(255,255,255,0.3)' }}>
              iPRODUCER
            </a>
          </div>

          {/* Right: Quick Controls */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <a href="/" className="button" style={{ padding: '8px 16px', fontSize: '0.9rem', border: 'none', background: 'transparent' }}>Studio</a>
            <a href="/dashboard" className="button" style={{ padding: '8px 16px', fontSize: '0.9rem', border: 'none', background: 'transparent' }}>Library</a>
            <a href="/signup" className="button highlight">Get Access</a>
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
