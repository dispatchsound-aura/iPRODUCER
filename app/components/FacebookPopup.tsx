'use client';
import React, { useState, useEffect } from 'react';

const FACEBOOK_URL = "https://www.facebook.com/mytypebeat1/";
const POPUP_DELAY = 20000; // 20 seconds
const FREQUENCY_DAYS = 7;
const STORAGE_KEY = 'studio_fb_popup_last_seen';

export default function FacebookPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const lastSeen = localStorage.getItem(STORAGE_KEY);
    const now = Date.now();

    if (lastSeen) {
      const diff = now - parseInt(lastSeen, 10);
      const sevenDaysInMs = FREQUENCY_DAYS * 24 * 60 * 60 * 1000;
      if (diff < sevenDaysInMs) return;
    }

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, POPUP_DELAY);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
  };

  if (!isMounted || !isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 1000,
      width: '320px',
      animation: 'slideUp 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    }}>
      <div className="glass-panel" style={{
        padding: '1.5rem',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        background: 'rgba(20, 20, 25, 0.8)',
        borderRadius: '20px'
      }}>
        {/* Close Button */}
        <button 
          onClick={handleDismiss}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'transparent',
            border: 'none',
            color: 'rgba(255,255,255,0.4)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #1877F2, #0052cc)',
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(24, 119, 242, 0.3)'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
            </svg>
          </div>
          <div>
            <h4 style={{ margin: 0, color: 'white', fontSize: '1rem', fontWeight: 700 }}>Like our Studio?</h4>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>Join 1,000+ other producers.</p>
          </div>
        </div>

        <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', lineHeight: 1.4 }}>
          We post daily free prompts and beta features on our Facebook page.
        </p>

        <a 
          href={FACEBOOK_URL} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="button highlight" 
          onClick={handleDismiss}
          style={{ 
            width: '100%', 
            textAlign: 'center', 
            background: '#1877F2', 
            color: 'white',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            fontSize: '0.85rem'
          }}
        >
          Follow Us on Facebook
        </a>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideUp {
          from { transform: translateY(100px) scale(0.9); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
      `}} />
    </div>
  );
}
