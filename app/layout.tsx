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
        {/* Global DAW Transport Bar */}
        <header style={{ 
          height: '60px', 
          background: 'var(--transport-bg)', 
          borderBottom: '1px solid black',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          padding: '0 20px',
          boxShadow: '0 4px 10px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
          position: 'fixed',
          top: 0, left: 0, right: 0,
          zIndex: 1000
        }}>
          {/* Left: Spinning Record & Branding */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="spinning-record" style={{ fontSize: '1.5rem', filter: 'drop-shadow(0 0 12px var(--accent-color)) drop-shadow(0 0 25px var(--accent-color))' }}>
              💿
            </div>
            <a href="/" style={{ fontWeight: 800, letterSpacing: '1px', fontSize: '1.2rem', color: '#ECEFF4', display: 'flex', alignItems: 'center', gap: '4px' }}>
              iPRODUCER
            </a>
          </div>

          {/* Center: LCD Display */}
          <div style={{ display: 'none' }} className="lcd-container">
            {/* We use media queries dynamically, but inline is fine for this robust layout */}
          </div>
          <div className="lcd-display" style={{ width: '300px', height: '40px', fontSize: '0.85rem' }}>
             <span style={{ opacity: 0.5, marginRight: '8px' }}>P R O J E C T</span>
             <span> 0 0 : 0 0 : 0 0 </span>
             <span style={{ opacity: 0.5, marginLeft: '8px' }}> 1 2 0 BPM</span>
          </div>

          {/* Right: Quick Controls */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <a href="/" className="button" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Studio</a>
            <a href="/dashboard" className="button" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Library</a>
            <a href="/signup" className="button highlight" style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '20px' }}>Sign Up</a>
          </div>
        </header>

        {/* Main Workspace Area */}
        <div style={{ marginTop: '60px', minHeight: 'calc(100vh - 60px)', display: 'flex', flexDirection: 'column' }}>
          {children}
        </div>
      </body>
    </html>
  );
}
