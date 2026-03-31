'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Invalid credentials');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '2rem',
      background: 'radial-gradient(circle at 50% 100%, rgba(56, 189, 248, 0.15), transparent 60%)',
    }}>
      <div 
        className="glass-panel" 
        style={{ 
          maxWidth: '450px', 
          width: '100%', 
          padding: '3rem', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
          borderRadius: '24px',
          animation: 'fadeIn 0.5s ease-out'
        }}
      >
        <div style={{
          width: '60px',
          height: '60px',
          background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '2rem',
          boxShadow: '0 10px 20px rgba(56, 189, 248, 0.4)'
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
             <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
             <path d="M10 17l5-5-5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
             <path d="M15 12H3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: 700, 
          marginBottom: '0.5rem', 
          color: 'white', 
          letterSpacing: '-1px' 
        }}>
          Welcome Back
        </h1>
        <p style={{ 
          color: 'var(--text-secondary)', 
          marginBottom: '2.5rem', 
          textAlign: 'center',
          fontSize: '1.1rem'
        }}>
          Log in to your private studio dashboard.
        </p>

        {error && (
          <div style={{
            background: 'rgba(255, 50, 50, 0.1)',
            border: '1px solid rgba(255, 50, 50, 0.3)',
            color: '#ff6b6b',
            padding: '1rem',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            width: '100%',
            fontSize: '0.9rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {success ? (
          <div style={{
            background: 'rgba(56, 189, 248, 0.1)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            color: 'var(--accent-blue)',
            padding: '2rem',
            borderRadius: '12px',
            width: '100%',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <span>Authenticating... Redirecting you to the studio.</span>
          </div>
        ) : (
          <form style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.25rem' }} onSubmit={handleLogin}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500, marginLeft: '4px' }}>Email Address</label>
              <input 
                type="email" 
                className="input-field" 
                placeholder="producer@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{ padding: '16px', fontSize: '1rem', borderRadius: '12px' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500, marginLeft: '4px' }}>Password</label>
              <input 
                type="password" 
                className="input-field" 
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{ padding: '16px', fontSize: '1rem', borderRadius: '12px' }}
              />
            </div>

            <button 
              type="submit"
              className="button" 
              disabled={loading}
              style={{ 
                width: '100%', 
                opacity: loading ? 0.7 : 1, 
                padding: '16px', 
                fontSize: '1.1rem', 
                marginTop: '1rem',
                borderRadius: '12px',
                fontWeight: 600,
                letterSpacing: '0.5px',
                background: 'var(--accent-blue)',
                boxShadow: '0 8px 16px rgba(56, 189, 248, 0.2)'
              }}
            >
              {loading ? 'AUTHENTICATING...' : 'LOG IN'}
            </button>
          </form>
        )}

        <div style={{ marginTop: '2.5rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Don't have an account? <a href="/signup" style={{ color: 'var(--accent-purple)', textDecoration: 'none', fontWeight: 500 }}>Sign up</a>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </main>
  );
}
