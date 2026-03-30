'use client';
import React, { useState, useEffect } from 'react';

export default function AdminDashboard() {
  // Auth Lock State
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [authEmail, setAuthEmail] = useState('dispatchsound@gmail.com');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Notification States
  const [notifySubject, setNotifySubject] = useState('');
  const [notifyMessage, setNotifyMessage] = useState('');
  const [notifyStatus, setNotifyStatus] = useState('');

  const handleAdminUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail, password: authPassword })
      });
      const data = await res.json();

      if (res.ok) {
        setIsUnlocked(true);
        // sessionStorage.setItem('adminUnlocked', 'true') could be added here for persistence
      } else {
        setAuthError(data.error);
      }
    } catch (err: any) {
       setAuthError(err.message);
    } finally {
       setAuthLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
      }
      if (data.users) {
        setUsers(data.users);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Only fetch users once the dashboard is unlocked
  useEffect(() => {
    if (isUnlocked) {
      fetchUsers();
    }
  }, [isUnlocked]);

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
         fetchUsers();
      } else {
         alert('Failed to delete: ' + data.error);
      }
    } catch (e) {
      alert('Failed to delete user.');
    }
  };

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    setNotifyStatus('sending');
    setTimeout(() => {
      setNotifyStatus('success');
      setNotifySubject('');
      setNotifyMessage('');
      setTimeout(() => setNotifyStatus(''), 3000);
    }, 1500);
  };

  if (!isUnlocked) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div className="glass-panel" style={{ maxWidth: '400px', width: '100%', padding: '3rem 2rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--accent-color)' }}>Master Unlock</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem' }}>
            Requires the master account <b style={{ color: 'white' }}>dispatchsound@gmail.com</b>
          </p>
          
          <form onSubmit={handleAdminUnlock} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input 
               type="email" 
               className="input-field" 
               placeholder="Master Email" 
               value={authEmail}
               onChange={e => setAuthEmail(e.target.value)}
               disabled // Forced to dispatchsound
               style={{ opacity: 0.7, cursor: 'not-allowed' }}
            />
            <input 
               type="password" 
               className="input-field" 
               placeholder="Master Password" 
               value={authPassword}
               onChange={e => setAuthPassword(e.target.value)}
               required
               autoFocus
            />
            
            {authError && <div style={{ color: '#ff4d4d', fontSize: '0.85rem' }}>{authError}</div>}
            
            <button className="button" disabled={authLoading} style={{ marginTop: '1rem' }}>
              {authLoading ? 'Verifying...' : 'Unlock Dashboard'}
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 600, color: 'white' }}>Admin Control Center</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Welcome back, dispatchsound. Manage your subscribers.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => setIsUnlocked(false)} className="button" style={{ background: 'transparent', border: '1px solid #ff4d4d', color: '#ff4d4d' }}>Lock Screen</button>
          <a href="/dashboard" className="button" style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'white', textDecoration: 'none' }}>Back to Studio</a>
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(217, 119, 6, 0.1)', border: '1px solid rgba(217, 119, 6, 0.4)', color: '#ffc107', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
           <strong style={{ fontSize: '1.1rem' }}>⚠️ Database Setup Required</strong>
           <p style={{ margin: 0, opacity: 0.9 }}>{error}</p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '2rem' }}>
        {/* Users Panel */}
        <section className="glass-panel" style={{ padding: '2rem', borderRadius: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Subscriber Base</h2>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{users.length} Total Users</span>
            </div>
            <button onClick={fetchUsers} className="button" style={{ padding: '8px 16px', fontSize: '0.9rem', background: 'rgba(255,255,255,0.05)' }}>
              Refresh
            </button>
          </div>

          {loading ? (
             <div style={{ color: 'var(--text-secondary)', padding: '2rem 0', textAlign: 'center' }}>Loading users...</div>
          ) : users.length === 0 ? (
             <div style={{ color: 'var(--text-secondary)', padding: '3rem 0', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
               No users have signed up yet.<br/>
               <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>Share your /signup page to get started.</span>
             </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {users.map(user => (
                <div key={user.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '12px', transition: 'background 0.2s' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                     <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(45deg, var(--accent-cyan), var(--accent-color))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                       {user.email.charAt(0).toUpperCase()}
                     </div>
                     <div>
                       <div style={{ fontWeight: 500 }}>{user.email}</div>
                       <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                         <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '10px', fontSize: '0.7rem' }}>{user.role}</span>
                         <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                       </div>
                     </div>
                  </div>
                  <button onClick={() => handleDeleteUser(user.id)} style={{ background: 'transparent', border: 'none', color: '#ff4d4d', cursor: 'pointer', padding: '8px', opacity: 0.7 }}>
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Right Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <section className="glass-panel" style={{ padding: '2rem', borderRadius: '24px' }}>
             <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ color: 'var(--accent-cyan)' }}>✦</span> Blast Notification</h2>
             <form onSubmit={handleSendNotification} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input type="text" className="input-field" placeholder="Subject" required value={notifySubject} onChange={e => setNotifySubject(e.target.value)} style={{ background: 'rgba(0,0,0,0.2)', fontSize: '0.9rem' }} />
                <textarea className="input-field" placeholder="Message to subscribers..." rows={4} required value={notifyMessage} onChange={e => setNotifyMessage(e.target.value)} style={{ resize: 'vertical', background: 'rgba(0,0,0,0.2)', fontSize: '0.9rem' }} />
                <button type="submit" className="button" disabled={notifyStatus === 'sending' || users.length === 0} style={{ opacity: (notifyStatus === 'sending' || users.length === 0) ? 0.5 : 1 }}>
                  {notifyStatus === 'sending' ? 'Sending...' : notifyStatus === 'success' ? 'Sent!' : 'Send to All Subscribers'}
                </button>
             </form>
          </section>

          <section className="glass-panel" style={{ padding: '2rem', borderRadius: '24px' }}>
             <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ color: 'var(--accent-color)' }}>⚙</span> Auth Settings</h2>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                   <span style={{ fontSize: '0.9rem' }}>Allow New Signups</span>
                   <div style={{ width: '40px', height: '22px', background: 'var(--accent-color)', borderRadius: '12px', position: 'relative' }}>
                     <div style={{ width: '18px', height: '18px', background: 'white', borderRadius: '50%', position: 'absolute', right: '2px', top: '2px' }}></div>
                   </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <span style={{ fontSize: '0.9rem' }}>Require Email Verification</span>
                   <div style={{ width: '40px', height: '22px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', position: 'relative' }}>
                     <div style={{ width: '18px', height: '18px', background: 'var(--text-secondary)', borderRadius: '50%', position: 'absolute', left: '2px', top: '2px' }}></div>
                   </div>
                </div>
             </div>
          </section>
        </div>
      </div>
    </main>
  );
}
