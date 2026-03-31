import { PrismaClient } from '@prisma/client';
import { getSession } from '../../../lib/auth';
import { redirect } from 'next/navigation';

const prisma = new PrismaClient();

export default async function AdminDashboard() {
  const session = await getSession();
  
  if (!session?.userId) return redirect('/login');
  
  const currentUser = await prisma.user.findUnique({ where: { id: session.userId } });
  
  if (currentUser?.role !== 'ADMIN' && currentUser?.email !== 'dispatchsound@gmail.com') {
      return (
         <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <h2 style={{ color: 'var(--accent-orange)' }}>403 FORBIDDEN</h2>
            <p>You do not have Administrative clearances to view this matrix.</p>
         </div>
      );
  }

  const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
  });

  const totalUsers = users.length;
  const totalGenerations = await prisma.generation.count();
  const totalStems = await prisma.generation.count({ where: { stemStatus: { not: 'none' } } });

  return (
     <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>Master Administrative Node</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Overview of the complete TYPEBEAT User Ecosystem</p>
        
        {/* Analytics Block */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
           <div style={{ background: 'rgba(56, 189, 248, 0.1)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', letterSpacing: '1px', textTransform: 'uppercase' }}>TOTAL USERS</div>
              <div style={{ fontSize: '3rem', fontWeight: 800, color: '#fff' }}>{totalUsers}</div>
           </div>
           <div style={{ background: 'rgba(244, 114, 182, 0.1)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(244, 114, 182, 0.3)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', letterSpacing: '1px', textTransform: 'uppercase' }}>TOTAL AUDIO RENDERS</div>
              <div style={{ fontSize: '3rem', fontWeight: 800, color: '#fff' }}>{totalGenerations}</div>
           </div>
           <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', letterSpacing: '1px', textTransform: 'uppercase' }}>NEURAL STEMS EXTRACTED</div>
              <div style={{ fontSize: '3rem', fontWeight: 800, color: '#fff' }}>{totalStems}</div>
           </div>
        </div>

        <div style={{ background: 'rgba(5, 5, 10, 0.4)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}>
                    <th style={{ textAlign: 'left', padding: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ACCOUNT EMAIL</th>
                    <th style={{ textAlign: 'left', padding: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ASSIGNED ROLE</th>
                    <th style={{ textAlign: 'left', padding: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>TOKENS (WALLET)</th>
                    <th style={{ textAlign: 'left', padding: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>CREATED ON</th>
                    <th style={{ textAlign: 'right', padding: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>MANAGE</th>
                </tr>
            </thead>
            <tbody>
                {users.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '16px', fontWeight: 500 }}>{u.email}</td>
                        <td style={{ padding: '16px', color: u.role === 'SUPER_PRODUCER' ? 'var(--accent-blue)' : u.role === 'ADMIN' ? 'var(--accent-orange)' : 'var(--accent-green)', fontWeight: 700, letterSpacing: '1px', fontSize: '0.8rem' }}>{u.role}</td>
                        <td style={{ padding: '16px', fontWeight: 700, color: 'var(--accent-orange)' }}>{(u as any).availableCredits || 0}</td>
                        <td style={{ padding: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td style={{ padding: '16px', textAlign: 'right', display: 'flex', gap: '1rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                            <form action="/api/admin/credits" method="POST" style={{ display: 'inline-flex' }}>
                                <input type="hidden" name="userId" value={u.id} />
                                <input type="hidden" name="tokens" value="10" />
                                <button type="submit" className="button highlight" style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>INJECT</button>
                            </form>
                            <form action="/api/admin/role" method="POST" style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                                <input type="hidden" name="userId" value={u.id} />
                                <select name="newRole" defaultValue={u.role} style={{ padding: '6px 12px', background: 'rgba(0,0,0,0.5)', color: '#fff', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '0.8rem', outline: 'none' }}>
                                    <option value="ARTIST">ARTIST (Free)</option>
                                    <option value="PRODUCER">PRODUCER ($10)</option>
                                    <option value="SUPER_PRODUCER">SUPER_PRODUCER ($20)</option>
                                    <option value="ADMIN">SYSTEM ADMIN</option>
                                </select>
                                <button type="submit" className="button highlight" style={{ padding: '6px 16px', fontSize: '0.75rem', borderRadius: '4px' }}>EXECUTE</button>
                            </form>
                        </td>
                    </tr>
                ))}
            </tbody>
            </table>
        </div>
     </div>
  );
}
