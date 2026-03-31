'use client';
import React from 'react';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <button 
      onClick={handleLogout}
      style={{
        padding: '0.8rem 1.5rem',
        background: 'rgba(255,50,50,0.1)',
        border: '1px solid rgba(255,50,50,0.3)',
        color: '#ff6b6b',
        borderRadius: '12px',
        fontWeight: 600,
        cursor: 'pointer',
        fontSize: '0.9rem',
        letterSpacing: '1px'
      }}
    >
      LOG OUT OF STUDIO
    </button>
  );
}
