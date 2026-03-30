'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong during signup');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
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
      background: 'radial-gradient(circle at 50% 0%, rgba(217, 119, 6, 0.15), transparent 60%)',
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
          background: 'linear-gradient(135deg, var(--accent-color), #ff4d4d)',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '2rem',
          boxShadow: '0 10px 20px rgba(217, 119, 6, 0.4)'
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: 700, 
          marginBottom: '0.5rem', 
          color: 'white', 
          letterSpacing: '-1px' 
        }}>
          Join the Studio
        </h1>
        <p style={{ 
          color: 'var(--text-secondary)', 
          marginBottom: '2.5rem', 
          textAlign: 'center',
          fontSize: '1.1rem'
        }}>
          Create an account to start generating infinite beats and managing your library.
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
            background: 'rgba(50, 255, 100, 0.1)',
            border: '1px solid rgba(50, 255, 100, 0.3)',
            color: '#6bff94',
            padding: '2rem',
            borderRadius: '12px',
            width: '100%',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
               <path d="M22 11.08V12C21.9988 14.1564 21.3001 16.2547 20.0093 17.9818C18.7185 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" stroke="#6bff94" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
               <path d="M22 4L12 14.01L9 11.01" stroke="#6bff94" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Welcome aboard! Redirecting you to the studio...</span>
          </div>
        ) : (
          <form style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.25rem' }} onSubmit={handleSignup}>
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
                minLength={6}
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
                boxShadow: '0 8px 16px rgba(217, 119, 6, 0.2)'
              }}
            >
              {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
            </button>
          </form>
        )}

        <div style={{ marginTop: '2.5rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Already have an account? <a href="#" style={{ color: 'var(--accent-cyan)', textDecoration: 'none', fontWeight: 500 }}>Sign in</a>
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
